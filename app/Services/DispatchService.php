<?php

namespace App\Services;

use App\Enums\PaymentType;
use App\Models\CourierProfile;
use App\Models\Order;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Throwable;

class DispatchService
{
    protected CargoCalculatorService $cargoCalculator;
    protected CourierTrackingService $trackingService;
    protected DeliveryFeeService $feeService;

    public function __construct(
        CargoCalculatorService $cargoCalculator,
        CourierTrackingService $trackingService,
        DeliveryFeeService $feeService
    ) {
        $this->cargoCalculator = $cargoCalculator;
        $this->trackingService = $trackingService;
        $this->feeService = $feeService;
    }

    /**
     * Find all qualified, nearby couriers for a specific sub-order.
     *
     * @param Order $order The sub-order to dispatch
     * @param float $radiusKm Search radius in kilometers (default 15 km)
     * @return Collection<int, CourierProfile> Filtered couriers sorted by distance
     */
    public function findEligibleCouriers(Order $order, float $radiusKm = 15.0): Collection
    {
        // 1. Calculate order cargo requirements
        $cargo = $this->cargoCalculator->calculate($order);
        $totalWeightKg = $cargo['total_weight_kg'];
        $totalVolumeM3 = $cargo['total_volume_m3'];

        $isCodOrder = $order->payment_type === PaymentType::COD;
        $orderAmount = (float) $order->total_amount;

        // Origin store coordinates (pickup location)
        $pickupLat = (float) ($order->merchant?->latitude ?? $order->delivery_lat);
        $pickupLng = (float) ($order->merchant?->longitude ?? $order->delivery_lng);

        // 2. Discover nearby courier IDs via Redis GEOSEARCH
        $nearbyCouriersWithDist = $this->searchNearbyCouriers($pickupLng, $pickupLat, $radiusKm);

        if ($nearbyCouriersWithDist->isEmpty()) {
            return collect();
        }

        $courierIds = $nearbyCouriersWithDist->keys()->all();

        // 3. Fetch couriers from database
        $couriers = CourierProfile::with('user')
            ->whereIn('id', $courierIds)
            ->where('is_online', true)
            ->get();

        // 4. Apply business rule filters
        $eligible = $couriers->filter(function (CourierProfile $courier) use (
            $totalWeightKg,
            $totalVolumeM3,
            $isCodOrder,
            $orderAmount
        ) {
            // Heartbeat check
            if (! $this->trackingService->hasActiveHeartbeat($courier->id)) {
                return false;
            }

            // Volumetric and weight capacity check
            if (! $courier->canCarryCargo($totalWeightKg, $totalVolumeM3)) {
                return false;
            }

            // COD safety check
            if ($isCodOrder && ! $courier->canAcceptCod($orderAmount)) {
                return false;
            }

            return true;
        });

        // 5. Attach distance and sort by distance
        return $eligible->map(function (CourierProfile $courier) use ($nearbyCouriersWithDist) {
            $courier->distance_km = $nearbyCouriersWithDist->get($courier->id, 0.0);
            return $courier;
        })->sortBy('distance_km')->values();
    }

    /**
     * Query Redis GEOSEARCH for nearby couriers with distance.
     *
     * @return Collection<string, float> Map of courier_id => distance_km
     */
    protected function searchNearbyCouriers(float $lng, float $lat, float $radiusKm): Collection
    {
        try {
            // Redis GEOSEARCH command: GEOSEARCH key FROMLONLAT lng lat BYRADIUS radius KM WITHDIST ASC
            $results = Redis::geosearch(
                CourierTrackingService::REDIS_GEO_KEY,
                [
                    'longitude' => $lng,
                    'latitude' => $lat,
                ],
                [
                    'radius' => $radiusKm,
                    'unit' => 'km',
                ],
                ['withdist' => true, 'sort' => 'ASC']
            );

            if (! empty($results)) {
                $map = collect();
                foreach ($results as $result) {
                    // Result can be array [$courierId, $distKm] or object
                    if (is_array($result) && count($result) >= 2) {
                        $map->put((string) $result[0], (float) $result[1]);
                    }
                }
                return $map;
            }
        } catch (Throwable $e) {
            Log::info("Redis GEOSEARCH fallback to DB calculation: {$e->getMessage()}");
        }

        // Database Haversine fallback if Redis is unavailable or has no results
        return $this->dbSearchNearbyCouriers($lat, $lng, $radiusKm);
    }

    /**
     * Fallback proximity calculation directly querying active couriers in database.
     */
    protected function dbSearchNearbyCouriers(float $lat, float $lng, float $radiusKm): Collection
    {
        $couriers = CourierProfile::where('is_online', true)
            ->whereNotNull('current_lat')
            ->whereNotNull('current_lng')
            ->get();

        $map = collect();
        foreach ($couriers as $courier) {
            $dist = $this->feeService->calculateDistanceKm(
                $lat,
                $lng,
                (float) $courier->current_lat,
                (float) $courier->current_lng
            );

            if ($dist <= $radiusKm) {
                $map->put($courier->id, $dist);
            }
        }

        return $map;
    }
}
