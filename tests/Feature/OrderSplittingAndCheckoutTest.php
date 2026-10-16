<?php

namespace Tests\Feature;

use App\Enums\PaymentType;
use App\Models\Merchant;
use App\Models\Product;
use App\Models\User;
use App\Services\CheckoutService;
use App\Services\DeliveryFeeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class OrderSplittingAndCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_multi_merchant_cart_splits_into_isolated_sub_orders_with_delivery_fees_and_otps(): void
    {
        // 1. Customer
        $customer = User::create([
            'name' => 'Ahmed Customer',
            'phone' => '01011111111',
            'role' => 'customer',
            'password' => 'secret123',
        ]);

        // 2. Merchant 1 (Cairo Downtown: 30.0444, 31.2357)
        $userM1 = User::create(['name' => 'Store 1', 'phone' => '01022222222', 'role' => 'merchant', 'password' => 'secret123']);
        $merchant1 = Merchant::create([
            'user_id' => $userM1->id,
            'store_name' => 'Downtown Auto Parts',
            'commercial_register_number' => 'CR-11111',
            'address_text' => 'Downtown Cairo',
            'latitude' => 30.0444,
            'longitude' => 31.2357,
            'is_active' => true,
        ]);

        // 3. Merchant 2 (Nasr City: 30.0561, 31.3301)
        $userM2 = User::create(['name' => 'Store 2', 'phone' => '01033333333', 'role' => 'merchant', 'password' => 'secret123']);
        $merchant2 = Merchant::create([
            'user_id' => $userM2->id,
            'store_name' => 'Nasr City Auto Parts',
            'commercial_register_number' => 'CR-22222',
            'address_text' => 'Nasr City Cairo',
            'latitude' => 30.0561,
            'longitude' => 31.3301,
            'is_active' => true,
        ]);

        // Products for Merchant 1
        $product1 = Product::create([
            'merchant_id' => $merchant1->id,
            'name' => 'Spark Plugs',
            'sku' => 'SP-01',
            'oem_number' => 'OEM-SP01',
            'description' => 'Platinum plugs',
            'price' => 100.00,
            'stock_quantity' => 10,
            'weight_kg' => 0.5,
            'length_cm' => 10,
            'width_cm' => 5,
            'height_cm' => 5,
            'condition' => 'new',
            'is_active' => true,
        ]);

        // Product for Merchant 2
        $product2 = Product::create([
            'merchant_id' => $merchant2->id,
            'name' => 'Brake Pads',
            'sku' => 'BP-02',
            'oem_number' => 'OEM-BP02',
            'description' => 'Ceramic pads',
            'price' => 250.00,
            'stock_quantity' => 5,
            'weight_kg' => 2.0,
            'length_cm' => 20,
            'width_cm' => 15,
            'height_cm' => 10,
            'condition' => 'new',
            'is_active' => true,
        ]);

        // Customer drop-off location (Maadi: 29.9602, 31.2569)
        $dropLat = 29.9602;
        $dropLng = 31.2569;

        $checkoutService = new CheckoutService(new DeliveryFeeService());

        $cart = [
            ['product_id' => $product1->id, 'quantity' => 2], // 2 x 100 = 200 EGP
            ['product_id' => $product2->id, 'quantity' => 1], // 1 x 250 = 250 EGP
        ];

        $parentOrder = $checkoutService->checkout(
            $customer,
            $cart,
            $dropLat,
            $dropLng,
            PaymentType::COD,
            15.00 // fixed platform service fee per sub-order
        );

        // Verify parent order created
        $this->assertNotNull($parentOrder);
        $this->assertTrue($parentOrder->isParent());
        $this->assertEquals(450.00, (float) $parentOrder->subtotal);
        $this->assertEquals(30.00, (float) $parentOrder->service_fee); // 2 sub-orders * 15

        // Verify sub-orders
        $subOrders = $parentOrder->subOrders;
        $this->assertCount(2, $subOrders);

        // Sub-order 1 (Merchant 1)
        $subOrder1 = $subOrders->firstWhere('merchant_id', $merchant1->id);
        $this->assertNotNull($subOrder1);
        $this->assertEquals(200.00, (float) $subOrder1->subtotal);
        $this->assertNotEmpty($subOrder1->delivery_otp);
        $this->assertGreaterThan(0, (float) $subOrder1->delivery_fee);
        $this->assertCount(1, $subOrder1->items);

        // Sub-order 2 (Merchant 2)
        $subOrder2 = $subOrders->firstWhere('merchant_id', $merchant2->id);
        $this->assertNotNull($subOrder2);
        $this->assertEquals(250.00, (float) $subOrder2->subtotal);
        $this->assertNotEmpty($subOrder2->delivery_otp);
        $this->assertNotEquals($subOrder1->delivery_otp, $subOrder2->delivery_otp);
        $this->assertGreaterThan(0, (float) $subOrder2->delivery_fee);

        // Verify stock decrements
        $product1->refresh();
        $this->assertEquals(8, $product1->stock_quantity); // 10 - 2

        $product2->refresh();
        $this->assertEquals(4, $product2->stock_quantity); // 5 - 1
    }

    public function test_checkout_fails_when_item_stock_is_insufficient(): void
    {
        $customer = User::create(['name' => 'Ahmed', 'phone' => '01011111112', 'role' => 'customer', 'password' => 'secret123']);
        $merchantUser = User::create(['name' => 'Store', 'phone' => '01022222223', 'role' => 'merchant', 'password' => 'secret123']);
        $merchant = Merchant::create([
            'user_id' => $merchantUser->id,
            'store_name' => 'Parts Shop',
            'commercial_register_number' => 'CR-33333',
            'address_text' => 'Cairo',
            'latitude' => 30.0,
            'longitude' => 31.0,
            'is_active' => true,
        ]);

        $product = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Limited Stock Part',
            'sku' => 'LIM-01',
            'oem_number' => 'OEM-LIM01',
            'description' => 'Only 1 left',
            'price' => 100.00,
            'stock_quantity' => 1,
            'weight_kg' => 1,
            'length_cm' => 10,
            'width_cm' => 10,
            'height_cm' => 10,
            'condition' => 'new',
            'is_active' => true,
        ]);

        $checkoutService = new CheckoutService(new DeliveryFeeService());

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Insufficient stock');

        // Request 5 units when only 1 is available
        $checkoutService->checkout(
            $customer,
            [['product_id' => $product->id, 'quantity' => 5]],
            30.0,
            31.0
        );
    }
}
