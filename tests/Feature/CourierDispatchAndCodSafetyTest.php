<?php

namespace Tests\Feature;

use App\Enums\PaymentType;
use App\Enums\VehicleType;
use App\Models\CourierProfile;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\CargoCalculatorService;
use App\Services\CourierTrackingService;
use App\Services\DeliveryFeeService;
use App\Services\DispatchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourierDispatchAndCodSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_courier_is_filtered_out_when_cargo_exceeds_weight_or_volume(): void
    {
        $courierUser = User::create(['name' => 'Motorcycle Courier', 'phone' => '01055555555', 'role' => 'courier', 'password' => 'secret123']);
        $courier = CourierProfile::create([
            'user_id' => $courierUser->id,
            'vehicle_type' => VehicleType::BIKE,
            'max_load_capacity' => 15.0, // 15 kg max
            'max_volume_capacity' => 0.05, // 0.05 m³ max
            'max_cod_limit' => 3000,
            'collected_cash_in_hand' => 0,
            'is_cod_suspended' => false,
            'is_online' => true,
            'current_lat' => 30.0444,
            'current_lng' => 31.2357,
        ]);

        $merchantUser = User::create(['name' => 'Merchant Store', 'phone' => '01066666666', 'role' => 'merchant', 'password' => 'secret123']);
        $merchant = Merchant::create([
            'user_id' => $merchantUser->id,
            'store_name' => 'Heavy Parts Depot',
            'commercial_register_number' => 'CR-77777',
            'address_text' => 'Cairo',
            'latitude' => 30.0450,
            'longitude' => 31.2360,
            'is_active' => true,
        ]);

        // Heavy product: 25 kg (exceeds bike's 15kg capacity)
        $heavyProduct = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Engine Block',
            'sku' => 'ENG-01',
            'oem_number' => 'OEM-ENG01',
            'description' => 'Heavy engine part',
            'price' => 2000.00,
            'stock_quantity' => 2,
            'weight_kg' => 25.0,
            'length_cm' => 60,
            'width_cm' => 50,
            'height_cm' => 40,
            'condition' => 'new',
            'is_active' => true,
        ]);

        $customer = User::create(['name' => 'Customer', 'phone' => '01077777777', 'role' => 'customer', 'password' => 'secret123']);
        $order = Order::create([
            'order_code' => 'ORD-HEAVY',
            'customer_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'subtotal' => 2000.00,
            'delivery_fee' => 30.00,
            'service_fee' => 20.00,
            'total_amount' => 2050.00,
            'payment_type' => PaymentType::CARD,
            'payment_status' => 'pending',
            'order_status' => 'pending',
            'delivery_lat' => 30.05,
            'delivery_lng' => 31.24,
            'delivery_otp' => '123456',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $heavyProduct->id,
            'quantity' => 1,
            'unit_price' => 2000.00,
            'total_price' => 2000.00,
        ]);

        $dispatchService = new DispatchService(
            new CargoCalculatorService(),
            new CourierTrackingService(),
            new DeliveryFeeService()
        );

        $eligible = $dispatchService->findEligibleCouriers($order, 20.0);

        // Motorcycle courier cannot carry 25kg (limit is 15kg)
        $this->assertFalse($eligible->contains('id', $courier->id));
    }

    public function test_courier_cod_limit_and_suspension_safety_guards(): void
    {
        $courierUser = User::create(['name' => 'COD Courier', 'phone' => '01088888888', 'role' => 'courier', 'password' => 'secret123']);
        $courier = CourierProfile::create([
            'user_id' => $courierUser->id,
            'vehicle_type' => VehicleType::CAR,
            'max_load_capacity' => 100.0,
            'max_volume_capacity' => 1.0,
            'max_cod_limit' => 2000.0,
            'collected_cash_in_hand' => 1800.0, // Already has 1800 EGP cash
            'is_cod_suspended' => false,
            'is_online' => true,
            'current_lat' => 30.0444,
            'current_lng' => 31.2357,
        ]);

        $merchantUser = User::create(['name' => 'Merchant Store', 'phone' => '01099999999', 'role' => 'merchant', 'password' => 'secret123']);
        $merchant = Merchant::create([
            'user_id' => $merchantUser->id,
            'store_name' => 'Fast Parts',
            'commercial_register_number' => 'CR-88888',
            'address_text' => 'Cairo',
            'latitude' => 30.0450,
            'longitude' => 31.2360,
            'is_active' => true,
        ]);

        $lightProduct = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Headlight Bulb',
            'sku' => 'BULB-01',
            'oem_number' => 'OEM-B01',
            'description' => 'Light bulb',
            'price' => 450.00,
            'stock_quantity' => 10,
            'weight_kg' => 0.5,
            'length_cm' => 10,
            'width_cm' => 10,
            'height_cm' => 10,
            'condition' => 'new',
            'is_active' => true,
        ]);

        $customer = User::create(['name' => 'Customer', 'phone' => '01012345678', 'role' => 'customer', 'password' => 'secret123']);

        // 1. COD Order of 500 EGP total (1800 + 500 = 2300 > 2000 limit)
        $codOrder = Order::create([
            'order_code' => 'ORD-COD-OVER',
            'customer_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'subtotal' => 450.00,
            'delivery_fee' => 35.00,
            'service_fee' => 15.00,
            'total_amount' => 500.00,
            'payment_type' => PaymentType::COD,
            'payment_status' => 'pending',
            'order_status' => 'pending',
            'delivery_lat' => 30.05,
            'delivery_lng' => 31.24,
            'delivery_otp' => '654321',
        ]);

        OrderItem::create([
            'order_id' => $codOrder->id,
            'product_id' => $lightProduct->id,
            'quantity' => 1,
            'unit_price' => 450.00,
            'total_price' => 450.00,
        ]);

        $dispatchService = new DispatchService(
            new CargoCalculatorService(),
            new CourierTrackingService(),
            new DeliveryFeeService()
        );

        // COD order exceeds limit -> Excluded
        $eligibleCod = $dispatchService->findEligibleCouriers($codOrder, 20.0);
        $this->assertFalse($eligibleCod->contains('id', $courier->id));

        // 2. Online Card order of 500 EGP -> Eligible! (No cash collection needed)
        $cardOrder = Order::create([
            'order_code' => 'ORD-CARD-OK',
            'customer_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'subtotal' => 450.00,
            'delivery_fee' => 35.00,
            'service_fee' => 15.00,
            'total_amount' => 500.00,
            'payment_type' => PaymentType::CARD,
            'payment_status' => 'pending',
            'order_status' => 'pending',
            'delivery_lat' => 30.05,
            'delivery_lng' => 31.24,
            'delivery_otp' => '654322',
        ]);

        OrderItem::create([
            'order_id' => $cardOrder->id,
            'product_id' => $lightProduct->id,
            'quantity' => 1,
            'unit_price' => 450.00,
            'total_price' => 450.00,
        ]);

        $eligibleCard = $dispatchService->findEligibleCouriers($cardOrder, 20.0);
        $this->assertTrue($eligibleCard->contains('id', $courier->id));
    }
}
