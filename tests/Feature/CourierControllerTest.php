<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentType;
use App\Enums\VehicleType;
use App\Events\CourierLocationUpdatedEvent;
use App\Events\OrderStatusUpdatedEvent;
use App\Models\CourierProfile;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CourierControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $courierUser;
    protected CourierProfile $courier;
    protected string $courierToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->courierUser = User::create([
            'name' => 'Speedy Courier',
            'phone' => '01012340001',
            'role' => 'courier',
            'password' => 'secret123',
        ]);

        $this->courier = CourierProfile::create([
            'user_id' => $this->courierUser->id,
            'vehicle_type' => VehicleType::BIKE,
            'max_load_capacity' => 20.0,
            'max_volume_capacity' => 0.1,
            'max_cod_limit' => 2000.0,
            'collected_cash_in_hand' => 0.0,
            'is_cod_suspended' => false,
            'is_online' => true,
            'current_lat' => 30.0444,
            'current_lng' => 31.2357,
        ]);

        $this->courierToken = $this->courierUser->createToken('test', ['role:courier'])->plainTextToken;
    }

    public function test_courier_can_update_location_and_broadcast_live_movement(): void
    {
        Event::fake([CourierLocationUpdatedEvent::class]);

        $customer = User::create(['name' => 'Customer', 'phone' => '01099990001', 'role' => 'customer', 'password' => 'secret123']);
        $order = Order::create([
            'order_code' => 'ORD-TRANSIT-01',
            'customer_id' => $customer->id,
            'courier_id' => $this->courier->id,
            'subtotal' => 100.0,
            'delivery_fee' => 25.0,
            'service_fee' => 15.0,
            'total_amount' => 140.0,
            'payment_type' => PaymentType::CARD,
            'payment_status' => 'pending',
            'order_status' => OrderStatus::IN_TRANSIT,
            'delivery_lat' => 30.05,
            'delivery_lng' => 31.24,
            'delivery_otp' => '123456',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->courierToken)
            ->postJson('/api/v1/courier/location', [
                'latitude' => 30.0450,
                'longitude' => 31.2360,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->courier->refresh();
        $this->assertEquals(30.045, (float) $this->courier->current_lat);
        $this->assertEquals(31.236, (float) $this->courier->current_lng);

        Event::assertDispatched(CourierLocationUpdatedEvent::class);
    }

    public function test_courier_can_toggle_online_status(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->courierToken)
            ->postJson('/api/v1/courier/status', [
                'is_online' => false,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_online', false);

        $this->assertFalse($this->courier->fresh()->is_online);
    }

    public function test_courier_can_view_orders_and_accept_dispatched_offer(): void
    {
        Event::fake([OrderStatusUpdatedEvent::class]);

        $customer = User::create(['name' => 'Customer', 'phone' => '01099990002', 'role' => 'customer', 'password' => 'secret123']);
        $merchantUser = User::create(['name' => 'Store', 'phone' => '01088880002', 'role' => 'merchant', 'password' => 'secret123']);
        $merchant = Merchant::create([
            'user_id' => $merchantUser->id,
            'store_name' => 'Store 1',
            'commercial_register_number' => 'CR-OFFER-1',
            'address_text' => 'Cairo',
            'latitude' => 30.0,
            'longitude' => 31.0,
            'is_active' => true,
        ]);

        // Parent order
        $parent = Order::create([
            'order_code' => 'ORD-PARENT-OFFER',
            'customer_id' => $customer->id,
            'subtotal' => 200.0,
            'delivery_fee' => 30.0,
            'service_fee' => 15.0,
            'total_amount' => 245.0,
            'payment_type' => PaymentType::CARD,
            'payment_status' => 'pending',
            'order_status' => OrderStatus::PENDING,
            'delivery_lat' => 30.05,
            'delivery_lng' => 31.24,
            'delivery_otp' => '654321',
        ]);

        // Dispatched Sub-order
        $subOrder = Order::create([
            'parent_id' => $parent->id,
            'order_code' => 'ORD-SUB-OFFER-1',
            'customer_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'subtotal' => 200.0,
            'delivery_fee' => 30.0,
            'service_fee' => 15.0,
            'total_amount' => 245.0,
            'payment_type' => PaymentType::CARD,
            'payment_status' => 'pending',
            'order_status' => OrderStatus::READY_FOR_PICKUP,
            'delivery_lat' => 30.05,
            'delivery_lng' => 31.24,
            'delivery_otp' => '654321',
        ]);

        // 1. Fetch available orders
        $getOrdersResponse = $this->withHeader('Authorization', 'Bearer ' . $this->courierToken)
            ->getJson('/api/v1/courier/orders');

        $getOrdersResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.available_offers');

        // 2. Accept offer
        $acceptResponse = $this->withHeader('Authorization', 'Bearer ' . $this->courierToken)
            ->postJson("/api/v1/courier/orders/{$subOrder->id}/accept");

        $acceptResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_status', OrderStatus::ASSIGNED_TO_COURIER->value);

        $this->assertEquals($this->courier->id, $subOrder->fresh()->courier_id);

        // 3. Confirm pickup
        $pickupResponse = $this->withHeader('Authorization', 'Bearer ' . $this->courierToken)
            ->postJson("/api/v1/courier/orders/{$subOrder->id}/pickup", [
                'courier_paid_merchant_cash' => false,
            ]);

        $pickupResponse->assertStatus(200)
            ->assertJsonPath('data.order_status', OrderStatus::IN_TRANSIT->value);

        // 4. Verify OTP with incorrect OTP -> 422 Unprocessable
        $badOtpResponse = $this->withHeader('Authorization', 'Bearer ' . $this->courierToken)
            ->postJson("/api/v1/courier/orders/{$subOrder->id}/verify-otp", [
                'otp' => '000000',
            ]);

        $badOtpResponse->assertStatus(422)
            ->assertJsonPath('success', false);

        // 5. Verify OTP with correct OTP -> 200 Delivered & Settled
        $goodOtpResponse = $this->withHeader('Authorization', 'Bearer ' . $this->courierToken)
            ->postJson("/api/v1/courier/orders/{$subOrder->id}/verify-otp", [
                'otp' => '654321',
            ]);

        $goodOtpResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_status', OrderStatus::DELIVERED->value);
    }

    public function test_courier_can_submit_remittance_and_view_wallet(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('receipt.png', 100, 'image/png');

        $remittanceResponse = $this->withHeader('Authorization', 'Bearer ' . $this->courierToken)
            ->postJson('/api/v1/courier/remittances', [
                'amount' => 500.00,
                'method' => 'instapay',
                'proof_receipt' => $file,
            ]);

        $remittanceResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.amount', '500.00');

        $this->assertDatabaseHas('courier_remittances', [
            'courier_id' => $this->courierUser->id,
            'amount' => 500.00,
            'method' => 'instapay',
        ]);

        // Get Courier Wallet
        $walletResponse = $this->withHeader('Authorization', 'Bearer ' . $this->courierToken)
            ->getJson('/api/v1/courier/wallet');

        $walletResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'wallet_id',
                    'balance',
                    'collected_cash_in_hand',
                    'max_cod_limit',
                    'statement',
                    'meta',
                ],
            ]);
    }
}
