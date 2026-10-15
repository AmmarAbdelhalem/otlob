<?php

namespace App\Services;

class DeliveryFeeService
{
    protected float $baseRate;
    protected float $ratePerKm;
    protected float $minimumFee;

    public function __construct(
        float $baseRate = 20.00,
        float $ratePerKm = 5.00,
        float $minimumFee = 25.00
    ) {
        $this->baseRate = $baseRate;
        $this->ratePerKm = $ratePerKm;
        $this->minimumFee = $minimumFee;
    }

    /**
     * Calculate great-circle distance between two GPS coordinates using the Haversine formula.
     *
     * @return float Distance in kilometers rounded to 2 decimal places.
     */
    public function calculateDistanceKm(float $latFrom, float $lngFrom, float $latTo, float $lngTo): float
    {
        $earthRadiusKm = 6371.0;

        $latDelta = deg2rad($latTo - $latFrom);
        $lngDelta = deg2rad($lngTo - $lngFrom);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos(deg2rad($latFrom)) * cos(deg2rad($latTo)) *
            sin($lngDelta / 2) * sin($lngDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadiusKm * $c, 2);
    }

    /**
     * Calculate delivery fee based on store coordinates and drop-off coordinates.
     *
     * @return array{distance_km: float, delivery_fee: float}
     */
    public function calculate(float $storeLat, float $storeLng, float $dropLat, float $dropLng): array
    {
        $distanceKm = $this->calculateDistanceKm($storeLat, $storeLng, $dropLat, $dropLng);
        $calculatedFee = $this->baseRate + ($distanceKm * $this->ratePerKm);
        $finalFee = max($this->minimumFee, round($calculatedFee, 2));

        return [
            'distance_km' => $distanceKm,
            'delivery_fee' => $finalFee,
        ];
    }
}
