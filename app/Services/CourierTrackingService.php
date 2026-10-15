<?php

namespace App\Services;

use App\Models\CourierProfile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Throwable;

class CourierTrackingService
{
    public const REDIS_GEO_KEY = 'couriers:locations';
    public const HEARTBEAT_TTL_SECONDS = 90;

    /**
     * Update courier live location in Redis and database.
     *
     * @param CourierProfile|string $courier Courier profile model or courier profile UUID
     * @param float $latitude GPS Latitude
     * @param float $longitude GPS Longitude
     */
    public function updateLocation(CourierProfile|string $courier, float $latitude, float $longitude): void
    {
        $profile = $courier instanceof CourierProfile ? $courier : CourierProfile::findOrFail($courier);
        $courierId = $profile->id;

        // 1. Update database coordinates
        $profile->update([
            'current_lat' => $latitude,
            'current_lng' => $longitude,
        ]);

        // 2. Update Redis Geospatial set & Heartbeat
        try {
            Redis::geoadd(self::REDIS_GEO_KEY, $longitude, $latitude, $courierId);
            Redis::setex("courier:heartbeat:{$courierId}", self::HEARTBEAT_TTL_SECONDS, now()->timestamp);
        } catch (Throwable $e) {
            Log::warning("Redis tracking unavailable: {$e->getMessage()}");
        }
    }

    /**
     * Check if a courier has an active heartbeat within TTL.
     */
    public function hasActiveHeartbeat(string $courierId): bool
    {
        try {
            $timestamp = Redis::get("courier:heartbeat:{$courierId}");
            if ($timestamp !== null) {
                return (now()->timestamp - (int) $timestamp) <= self::HEARTBEAT_TTL_SECONDS;
            }
        } catch (Throwable $e) {
            Log::warning("Redis heartbeat check unavailable: {$e->getMessage()}");
        }

        // Fallback: check profile updated_at within 2 minutes
        $profile = CourierProfile::find($courierId);
        return $profile && $profile->is_online && $profile->updated_at?->diffInSeconds(now()) <= self::HEARTBEAT_TTL_SECONDS;
    }

    /**
     * Remove courier from active location tracking (e.g. went offline).
     */
    public function removeLocation(string $courierId): void
    {
        try {
            Redis::zrem(self::REDIS_GEO_KEY, $courierId);
            Redis::del("courier:heartbeat:{$courierId}");
        } catch (Throwable $e) {
            Log::warning("Redis remove location error: {$e->getMessage()}");
        }
    }
}
