<?php

namespace Tests\Unit;

use App\Models\Merchant;
use App\Models\Product;
use App\Models\ProductCompatibility;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_volumetric_size_accessor(): void
    {
        $user = User::create(['name' => 'Merchant', 'phone' => '01011112222', 'role' => 'merchant', 'password' => 'secret123']);
        $merchant = Merchant::create([
            'user_id' => $user->id,
            'store_name' => 'Auto Shop',
            'commercial_register_number' => 'CR-UNIT-1',
            'address_text' => 'Cairo',
            'latitude' => 30.0,
            'longitude' => 31.0,
            'is_active' => true,
        ]);

        // Dimensions: 50cm x 40cm x 30cm = 60,000 cm³ = 0.06 m³
        $product = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Radiator',
            'sku' => 'RAD-01',
            'oem_number' => 'OEM-RAD-01',
            'description' => 'Cooling radiator',
            'price' => 1200.00,
            'stock_quantity' => 10,
            'weight_kg' => 5.0,
            'length_cm' => 50.0,
            'width_cm' => 40.0,
            'height_cm' => 30.0,
            'condition' => 'new',
            'is_active' => true,
        ]);

        $this->assertEquals(0.06, round($product->volume_m3, 4));
        $this->assertTrue($product->hasStock(5));
        $this->assertTrue($product->hasStock(10));
        $this->assertFalse($product->hasStock(11));
    }

    public function test_vehicle_compatibility_scope(): void
    {
        $user = User::create(['name' => 'Merchant 2', 'phone' => '01011112223', 'role' => 'merchant', 'password' => 'secret123']);
        $merchant = Merchant::create([
            'user_id' => $user->id,
            'store_name' => 'Parts Depot',
            'commercial_register_number' => 'CR-UNIT-2',
            'address_text' => 'Giza',
            'latitude' => 30.0,
            'longitude' => 31.0,
            'is_active' => true,
        ]);

        $brakePad = Product::create([
            'merchant_id' => $merchant->id,
            'name' => 'Front Brake Pads',
            'sku' => 'BP-UNIT',
            'oem_number' => 'OEM-BP-UNIT',
            'description' => 'Ceramic pads',
            'price' => 350.00,
            'stock_quantity' => 20,
            'weight_kg' => 1.5,
            'length_cm' => 15.0,
            'width_cm' => 10.0,
            'height_cm' => 8.0,
            'condition' => 'new',
            'is_active' => true,
        ]);

        // Fits Toyota Corolla 2018 - 2023
        ProductCompatibility::create([
            'product_id' => $brakePad->id,
            'make' => 'Toyota',
            'model' => 'Corolla',
            'year_from' => 2018,
            'year_to' => 2023,
        ]);

        // Match within range (2020)
        $match2020 = Product::compatibleWithVehicle('Toyota', 'Corolla', 2020)->get();
        $this->assertTrue($match2020->contains('id', $brakePad->id));

        // Case-insensitivity check ('toyota', 'corolla')
        $matchLower = Product::compatibleWithVehicle('toyota', 'corolla', 2020)->get();
        $this->assertTrue($matchLower->contains('id', $brakePad->id));

        // Boundary match (2018)
        $match2018 = Product::compatibleWithVehicle('Toyota', 'Corolla', 2018)->get();
        $this->assertTrue($match2018->contains('id', $brakePad->id));

        // Boundary match (2023)
        $match2023 = Product::compatibleWithVehicle('Toyota', 'Corolla', 2023)->get();
        $this->assertTrue($match2023->contains('id', $brakePad->id));

        // Out of range (2017)
        $outOfRange = Product::compatibleWithVehicle('Toyota', 'Corolla', 2017)->get();
        $this->assertFalse($outOfRange->contains('id', $brakePad->id));

        // Wrong model (Camry)
        $wrongModel = Product::compatibleWithVehicle('Toyota', 'Camry', 2020)->get();
        $this->assertFalse($wrongModel->contains('id', $brakePad->id));
    }
}
