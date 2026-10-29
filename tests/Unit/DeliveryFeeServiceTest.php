<?php

namespace Tests\Unit;

use App\Services\DeliveryFeeService;
use PHPUnit\Framework\TestCase;

class DeliveryFeeServiceTest extends TestCase
{
    protected DeliveryFeeService $feeService;

    protected function setUp(): void
    {
        parent::setUp();
        // default: baseRate = 20.00, ratePerKm = 5.00, minimumFee = 25.00
        $this->feeService = new DeliveryFeeService(20.00, 5.00, 25.00);
    }

    public function test_haversine_distance_calculation(): void
    {
        // Cairo Downtown (30.0444, 31.2357) to Maadi (29.9602, 31.2569) is approx 9.5 km
        $distance = $this->feeService->calculateDistanceKm(30.0444, 31.2357, 29.9602, 31.2569);

        $this->assertGreaterThan(8.5, $distance);
        $this->assertLessThan(11.0, $distance);
    }

    public function test_identical_coordinates_yield_zero_distance(): void
    {
        $distance = $this->feeService->calculateDistanceKm(30.0, 31.0, 30.0, 31.0);
        $this->assertEquals(0.0, $distance);
    }

    public function test_minimum_delivery_fee_floor(): void
    {
        // Very short distance (< 1 km): 20 + (0.5 * 5) = 22.50, which is less than minimum 25.00
        $calc = $this->feeService->calculate(30.0444, 31.2357, 30.0450, 31.2360);

        $this->assertEquals(25.00, $calc['delivery_fee']);
        $this->assertLessThan(1.0, $calc['distance_km']);
    }

    public function test_calculated_delivery_fee_exceeding_minimum(): void
    {
        // 10 km distance: 20 + (10 * 5) = 70.00
        // Coordinates approximately 10 km apart
        $calc = $this->feeService->calculate(30.0444, 31.2357, 29.9602, 31.2569);

        $expectedFee = round(20.00 + ($calc['distance_km'] * 5.00), 2);
        $this->assertEquals($expectedFee, $calc['delivery_fee']);
        $this->assertGreaterThan(25.00, $calc['delivery_fee']);
    }

    public function test_custom_rates(): void
    {
        $customService = new DeliveryFeeService(baseRate: 10.00, ratePerKm: 2.00, minimumFee: 15.00);
        $calc = $customService->calculate(30.0, 31.0, 30.0, 31.0);

        $this->assertEquals(15.00, $calc['delivery_fee']);
    }
}
