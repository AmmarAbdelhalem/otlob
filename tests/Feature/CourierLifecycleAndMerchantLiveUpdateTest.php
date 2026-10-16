<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentType;
use App\Enums\VehicleType;
use App\Models\CourierProfile;
use App\Models\Merchant;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CourierLifecycleAndMerchantLiveUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_courier_acceptance_and_merchant_live_refresh_lifecycle(): void
    {
        // 1. Create Users
        $customerUser = User::create([
            'name' => 'Mohamed Ali',
            'phone' => '01012345678',
            'role' => 'customer',
            'password' => 'secret123',
        ]);

        $merchantUser = User::create([
            'name' => 'Hazem Spares',
            'phone' => '01011110001',
            'role' => 'merchant',
            'password' => 'secret123',
        ]);
        $merchant = Merchant::create([
            'user_id' => $merchantUser->id,
            'store_name' => 'Apex German Spares',
            'commercial_register_number' => 'CR-12345',
            'address_text' => 'Nasr City, Cairo',
            'latitude' => 30.0444,
            'longitude' => 31.2357,
            'is_active' => true,
        ]);

        $courierUser = User::create([
            'name' => 'Tarek Mansour',
            'phone' => '01022220001',
            'role' => 'courier',
            'password' => 'secret123',
        ]);
        $courierProfile = CourierProfile::create([
            'user_id' => $courierUser->id,
            'vehicle_type' => VehicleType::BIKE,
            'max_load_capacity' => 30.0,
            'max_volume_capacity' => 0.15,
            'max_cod_limit' => 5000.0,
            'collected_cash_in_hand' => 0.0,
            'is_cod_suspended' => false,
            'is_online' => true,
            'current_lat' => 30.0450,
            'current_lng' => 31.2360,
        ]);

        // 2. Create Product
        $product = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Ceramic Brake Pads',
            'sku' => 'BP-BMW-001',
            'oem_number' => '34116774692',
            'description' => 'High quality ceramic brake pads',
            'price' => 1200.00,
            'stock_quantity' => 10,
            'condition' => 'new',
            'weight_kg' => 2.5,
            'length_cm' => 20,
            'width_cm' => 15,
            'height_cm' => 8,
            'volumetric_weight' => 0.48,
            'is_active' => true,
        ]);

        // 3. Customer places checkout
        Sanctum::actingAs($customerUser);
        $checkoutResponse = $this->postJson('/api/v1/orders/checkout', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            'delivery_lat' => 30.0500,
            'delivery_lng' => 31.2400,
            'payment_type' => PaymentType::COD->value,
        ]);
        $checkoutResponse->assertStatus(201);
        $parentOrder = $checkoutResponse->json('data');
        $subOrder = $parentOrder['sub_orders'][0];
        $subOrderId = $subOrder['id'];
        $deliveryOtp = $subOrder['delivery_otp'];

        // 4. Merchant fetches orders
        Sanctum::actingAs($merchantUser);
        $merchantOrdersRes = $this->getJson('/api/v1/merchant/orders');
        $merchantOrdersRes->assertOk();
        $this->assertEquals(OrderStatus::PENDING->value, $merchantOrdersRes->json('data.0.order_status'));

        // Merchant transitions to accepted_by_merchant, preparing, then ready_for_pickup
        $this->patchJson("/api/v1/merchant/orders/{$subOrderId}/status", [
            'status' => OrderStatus::ACCEPTED_BY_MERCHANT->value,
        ])->assertOk();

        $this->patchJson("/api/v1/merchant/orders/{$subOrderId}/status", [
            'status' => OrderStatus::PREPARING->value,
        ])->assertOk();

        $this->patchJson("/api/v1/merchant/orders/{$subOrderId}/status", [
            'status' => OrderStatus::READY_FOR_PICKUP->value,
        ])->assertOk();

        // 5. Courier queries offers
        Sanctum::actingAs($courierUser);
        $courierOrdersRes = $this->getJson('/api/v1/courier/orders');
        $courierOrdersRes->assertOk();
        $availableOffers = $courierOrdersRes->json('data.available_offers');
        $this->assertNotEmpty($availableOffers);
        $this->assertEquals($subOrderId, $availableOffers[0]['id']);

        // Courier accepts the offer
        $acceptRes = $this->postJson("/api/v1/courier/orders/{$subOrderId}/accept");
        $acceptRes->assertOk();
        $this->assertEquals(OrderStatus::ASSIGNED_TO_COURIER->value, $acceptRes->json('data.order_status'));

        // 6. Verify Merchant dashboard immediately reflects assigned_to_courier and courier details
        Sanctum::actingAs($merchantUser);
        $merchantOrdersAfterAccept = $this->getJson('/api/v1/merchant/orders');
        $merchantOrdersAfterAccept->assertOk();
        $updatedSubOrder = $merchantOrdersAfterAccept->json('data.0');
        $this->assertEquals(OrderStatus::ASSIGNED_TO_COURIER->value, $updatedSubOrder['order_status']);
        $this->assertNotNull($updatedSubOrder['courier']);
        $this->assertEquals('Tarek Mansour', $updatedSubOrder['courier']['user']['name']);

        // 7. Courier confirms pickup
        Sanctum::actingAs($courierUser);
        $pickupRes = $this->postJson("/api/v1/courier/orders/{$subOrderId}/pickup", [
            'courier_paid_merchant_cash' => false,
        ]);
        $pickupRes->assertOk();
        $this->assertEquals(OrderStatus::IN_TRANSIT->value, $pickupRes->json('data.order_status'));

        // 8. Customer orders check
        Sanctum::actingAs($customerUser);
        $customerOrdersRes = $this->getJson('/api/v1/orders');
        $customerOrdersRes->assertOk();
        $this->assertEquals(OrderStatus::IN_TRANSIT->value, $customerOrdersRes->json('data.0.sub_orders.0.order_status'));

        // 9. Courier delivers and verifies with OTP
        Sanctum::actingAs($courierUser);
        $verifyRes = $this->postJson("/api/v1/courier/orders/{$subOrderId}/verify-otp", [
            'otp' => $deliveryOtp,
        ]);
        $verifyRes->assertOk();
        $this->assertEquals(OrderStatus::DELIVERED->value, $verifyRes->json('data.order_status'));

        // 10. Merchant and Admin confirm delivery
        Sanctum::actingAs($merchantUser);
        $merchantFinalRes = $this->getJson('/api/v1/merchant/orders');
        $merchantFinalRes->assertOk();
        $this->assertEquals(OrderStatus::DELIVERED->value, $merchantFinalRes->json('data.0.order_status'));
    }
}
