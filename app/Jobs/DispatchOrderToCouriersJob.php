<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\DispatchService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DispatchOrderToCouriersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Order $order;
    public float $radiusKm;

    public function __construct(Order $order, float $radiusKm = 15.0)
    {
        $this->order = $order;
        $this->radiusKm = $radiusKm;
    }

    public function handle(DispatchService $dispatchService): void
    {
        Log::info("Starting dispatch discovery for Sub-Order [{$this->order->order_code}] (ID: {$this->order->id})");

        $matchedCouriers = $dispatchService->findEligibleCouriers($this->order, $this->radiusKm);

        Log::info("Dispatch discovery completed for Order [{$this->order->order_code}]: found {$matchedCouriers->count()} eligible couriers.");

        foreach ($matchedCouriers as $courier) {
            $dist = (float) ($courier->distance_km ?? 0.0);
            Log::info("Notifying courier [{$courier->id}] of available order offer [{$this->order->order_code}] at distance: {$dist} km");

            // Broadcast private websocket event to courier
            $userId = (string) ($courier->user_id ?? $courier->user?->id);
            if (! empty($userId)) {
                event(new \App\Events\NewOrderAvailableEvent($this->order, $userId, $dist));
            }

            // Dispatch push notification if FCM token is registered
            if ($courier->user && ! empty($courier->user->fcm_token)) {
                \App\Jobs\SendOrderPushNotificationJob::dispatch(
                    $courier->user,
                    'New Order Offer Available',
                    "Sub-Order #{$this->order->order_code} is available for pickup ({$dist} km away).",
                    [
                        'order_id' => $this->order->id,
                        'order_code' => $this->order->order_code,
                        'total_amount' => (float) $this->order->total_amount,
                    ]
                );
            }
        }
    }
}
