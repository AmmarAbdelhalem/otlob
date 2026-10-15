<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewOrderAvailableEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;
    public string $courierUserId;
    public float $distanceKm;

    public function __construct(Order $order, string $courierUserId, float $distanceKm)
    {
        $this->order = $order;
        $this->courierUserId = $courierUserId;
        $this->distanceKm = $distanceKm;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('couriers.' . $this->courierUserId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'order_code' => $this->order->order_code,
            'merchant_name' => $this->order->merchant?->store_name,
            'pickup_address' => $this->order->merchant?->address_text,
            'delivery_fee' => (float) $this->order->delivery_fee,
            'distance_km' => $this->distanceKm,
            'payment_type' => $this->order->payment_type->value,
            'total_amount' => (float) $this->order->total_amount,
        ];
    }
}
