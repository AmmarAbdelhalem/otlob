<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentType;
use App\Events\OrderStatusUpdatedEvent;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class MerchantControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $merchantUser;
    protected Merchant $merchant;
    protected string $merchantToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->merchantUser = User::create([
            'name' => 'Auto Parts Merchant',
            'phone' => '01055556666',
            'role' => 'merchant',
            'password' => 'secret123',
        ]);

        $this->merchant = Merchant::create([
            'user_id' => $this->merchantUser->id,
            'store_name' => 'Apex Spares',
            'commercial_register_number' => 'CR-APEX-1',
            'address_text' => 'Nasr City',
            'latitude' => 30.05,
            'longitude' => 31.33,
            'is_active' => true,
        ]);

        $this->merchantToken = $this->merchantUser->createToken('test', ['role:merchant'])->plainTextToken;
    }

    public function test_merchant_can_create_product_and_update_stock(): void
    {
        // 1. Create Product
        $createResponse = $this->withHeader('Authorization', 'Bearer ' . $this->merchantToken)
            ->postJson('/api/v1/merchant/products', [
                'name' => 'Brembo Brake Disc',
                'sku' => 'BRM-001',
                'oem_number' => 'OEM-BRM01',
                'description' => 'Ventilated disc brake',
                'price' => 850.00,
                'stock_quantity' => 15,
                'weight_kg' => 7.5,
                'length_cm' => 30.0,
                'width_cm' => 30.0,
                'height_cm' => 8.0,
                'condition' => 'new',
                'compatibilities' => [
                    [
                        'make' => 'BMW',
                        'model' => '320i',
                        'year_from' => 2015,
                        'year_to' => 2021,
                    ],
                ],
            ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.sku', 'BRM-001')
            ->assertJsonCount(1, 'data.compatibilities');

        $productId = $createResponse->json('data.id');

        // 2. Update stock
        $updateStockResponse = $this->withHeader('Authorization', 'Bearer ' . $this->merchantToken)
            ->patchJson("/api/v1/merchant/products/{$productId}/stock", [
                'stock_quantity' => 12,
            ]);

        $updateStockResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.stock_quantity', 12);
    }

    public function test_merchant_can_filter_orders_and_advance_fulfillment_status(): void
    {
        Event::fake([OrderStatusUpdatedEvent::class]);

        $customer = User::create(['name' => 'Buyer', 'phone' => '01044443333', 'role' => 'customer', 'password' => 'secret123']);

        $order = Order::create([
            'order_code' => 'ORD-MERCHANT-TEST-1',
            'customer_id' => $customer->id,
            'merchant_id' => $this->merchant->id,
            'subtotal' => 850.0,
            'delivery_fee' => 40.0,
            'service_fee' => 15.0,
            'total_amount' => 905.0,
            'payment_type' => PaymentType::CARD,
            'payment_status' => 'pending',
            'order_status' => OrderStatus::PENDING,
            'delivery_lat' => 30.05,
            'delivery_lng' => 31.24,
            'delivery_otp' => '445566',
        ]);

        // 1. Get Orders filtered by status
        $ordersResponse = $this->withHeader('Authorization', 'Bearer ' . $this->merchantToken)
            ->getJson('/api/v1/merchant/orders?status=pending');

        $ordersResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');

        // 2. Transition status: PENDING -> ACCEPTED_BY_MERCHANT
        $transition1 = $this->withHeader('Authorization', 'Bearer ' . $this->merchantToken)
            ->patchJson("/api/v1/merchant/orders/{$order->id}/status", [
                'status' => 'accepted_by_merchant',
            ]);

        $transition1->assertStatus(200)
            ->assertJsonPath('data.order_status', OrderStatus::ACCEPTED_BY_MERCHANT->value);

        // 3. Transition status: ACCEPTED_BY_MERCHANT -> PREPARING
        $transition2 = $this->withHeader('Authorization', 'Bearer ' . $this->merchantToken)
            ->patchJson("/api/v1/merchant/orders/{$order->id}/status", [
                'status' => 'preparing',
            ]);

        $transition2->assertStatus(200)
            ->assertJsonPath('data.order_status', OrderStatus::PREPARING->value);

        // 4. Transition status: PREPARING -> READY_FOR_PICKUP
        $transition3 = $this->withHeader('Authorization', 'Bearer ' . $this->merchantToken)
            ->patchJson("/api/v1/merchant/orders/{$order->id}/status", [
                'status' => 'ready_for_pickup',
            ]);

        $transition3->assertStatus(200)
            ->assertJsonPath('data.order_status', OrderStatus::READY_FOR_PICKUP->value);

        Event::assertDispatched(OrderStatusUpdatedEvent::class, 3);
    }

    public function test_merchant_wallet_retrieval(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->merchantToken)
            ->getJson('/api/v1/merchant/wallet');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'wallet_id',
                    'balance',
                    'currency',
                    'statement',
                    'meta',
                ],
            ]);
    }
}
