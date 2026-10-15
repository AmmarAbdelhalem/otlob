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
            Log::info("Notifying courier [{$courier->id}] of available order offer [{$this->order->order_code}] at distance: {$courier->distance_km} km");
            // Integration hook for push notification / websocket event
        }
    }
}
