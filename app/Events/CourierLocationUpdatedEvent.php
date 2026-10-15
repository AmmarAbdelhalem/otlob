<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CourierLocationUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $orderId;
    public string $courierId;
    public float $latitude;
    public float $longitude;

    public function __construct(string $orderId, string $courierId, float $latitude, float $longitude)
    {
        $this->orderId = $orderId;
        $this->courierId = $courierId;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('orders.' . $this->orderId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->orderId,
            'courier_id' => $this->courierId,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'timestamp' => now()->timestamp,
        ];
    }
}
