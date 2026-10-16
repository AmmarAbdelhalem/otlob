<?php

namespace Tests\Unit;

use App\Models\Merchant;
use App\Models\Product;
use App\Models\User;
use App\Services\CargoCalculatorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CargoCalculatorServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_accurately_calculates_weight_and_volumetric_size(): void
    {
        $user = User::create([
            'name' => 'Merchant Test',
            'phone' => '01000000001',
            'role' => 'merchant',
            'password' => 'secret123',
        ]);

        $merchant = Merchant::create([
            'user_id' => $user->id,
            'store_name' => 'Auto Parts Shop',
            'commercial_register_number' => 'CR-123456',
            'address_text' => 'Cairo, Egypt',
            'latitude' => 30.0444,
            'longitude' => 31.2357,
            'is_active' => true,
        ]);

        // Product 1: 5kg, 50cm x 40cm x 30cm -> 60,000 cm³ = 0.06 m³
        $product1 = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Brake Disc Set',
            'sku' => 'BD-100',
            'oem_number' => 'OEM-BD100',
            'description' => 'Heavy brake disc',
            'price' => 500.00,
            'stock_quantity' => 10,
            'weight_kg' => 5.0,
            'length_cm' => 50.0,
            'width_cm' => 40.0,
            'height_cm' => 30.0,
            'condition' => 'new',
            'is_active' => true,
        ]);

        // Product 2: 2kg, 20cm x 20cm x 10cm -> 4,000 cm³ = 0.004 m³
        $product2 = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Air Filter',
            'sku' => 'AF-200',
            'oem_number' => 'OEM-AF200',
            'description' => 'Standard filter',
            'price' => 150.00,
            'stock_quantity' => 20,
            'weight_kg' => 2.0,
            'length_cm' => 20.0,
            'width_cm' => 20.0,
            'height_cm' => 10.0,
            'condition' => 'new',
            'is_active' => true,
        ]);

        $service = new CargoCalculatorService();

        // 2 units of Product 1 (10 kg, 0.12 m³) + 3 units of Product 2 (6 kg, 0.012 m³)
        // Total Weight = 16 kg
        // Total Volume = 0.132 m³
        $items = [
            ['product' => $product1, 'quantity' => 2],
            ['product' => $product2, 'quantity' => 3],
        ];

        $result = $service->calculate($items);

        $this->assertEquals(16.0, $result['total_weight_kg']);
        $this->assertEquals(0.132, $result['total_volume_m3']);
    }
}
