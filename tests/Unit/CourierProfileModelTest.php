<?php

namespace Tests\Unit;

use App\Enums\VehicleType;
use App\Models\CourierProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourierProfileModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_carry_cargo_weight_and_volume_checks(): void
    {
        $user = User::create(['name' => 'Courier', 'phone' => '01012341234', 'role' => 'courier', 'password' => 'secret123']);
        $courier = CourierProfile::create([
            'user_id' => $user->id,
            'vehicle_type' => VehicleType::BIKE,
            'max_load_capacity' => 15.0, // 15 kg
            'max_volume_capacity' => 0.05, // 0.05 m³
            'max_cod_limit' => 2000.0,
            'collected_cash_in_hand' => 0.0,
            'is_cod_suspended' => false,
            'is_online' => true,
        ]);

        // Within capacity
        $this->assertTrue($courier->canCarryCargo(10.0, 0.02));
        $this->assertTrue($courier->canCarryCargo(15.0, 0.05)); // exact limit

        // Weight exceeded
        $this->assertFalse($courier->canCarryCargo(15.1, 0.02));

        // Volume exceeded
        $this->assertFalse($courier->canCarryCargo(5.0, 0.051));

        // Both exceeded
        $this->assertFalse($courier->canCarryCargo(20.0, 0.1));
    }

    public function test_can_accept_cod_boundary_conditions(): void
    {
        $user = User::create(['name' => 'Courier', 'phone' => '01012341235', 'role' => 'courier', 'password' => 'secret123']);
        $courier = CourierProfile::create([
            'user_id' => $user->id,
            'vehicle_type' => VehicleType::CAR,
            'max_load_capacity' => 100.0,
            'max_volume_capacity' => 1.0,
            'max_cod_limit' => 1000.0,
            'collected_cash_in_hand' => 600.0,
            'is_cod_suspended' => false,
            'is_online' => true,
        ]);

        // 600 + 300 = 900 <= 1000 -> true
        $this->assertTrue($courier->canAcceptCod(300.0));

        // 600 + 400 = 1000 <= 1000 -> true (exact limit)
        $this->assertTrue($courier->canAcceptCod(400.0));

        // 600 + 401 = 1001 > 1000 -> false
        $this->assertFalse($courier->canAcceptCod(401.0));

        // If COD is suspended -> always false
        $courier->update(['is_cod_suspended' => true]);
        $this->assertFalse($courier->canAcceptCod(50.0));
    }

    public function test_attribute_aliases_for_weight_and_volume(): void
    {
        $user = User::create(['name' => 'Courier', 'phone' => '01012341236', 'role' => 'courier', 'password' => 'secret123']);
        $courier = CourierProfile::create([
            'user_id' => $user->id,
            'vehicle_type' => VehicleType::VAN,
            'max_weight_capacity_kg' => 500.0,
            'max_volume_capacity_m3' => 3.5,
        ]);

        $this->assertEquals(500.0, (float) $courier->max_load_capacity);
        $this->assertEquals(3.5, (float) $courier->max_volume_capacity);
        $this->assertEquals(500.0, (float) $courier->max_weight_capacity_kg);
        $this->assertEquals(3.5, (float) $courier->max_volume_capacity_m3);
    }
}
