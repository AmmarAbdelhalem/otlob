<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;
    public string $previousStatus;
    public string $currentStatus;

    public function __construct(Order $order, string $previousStatus, string $currentStatus)
    {
        $this->order = $order;
        $this->previousStatus = $previousStatus;
        $this->currentStatus = $currentStatus;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('orders.' . $this->order->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'order_code' => $this->order->order_code,
            'previous_status' => $this->previousStatus,
            'current_status' => $this->currentStatus,
            'updated_at' => now()->toISOString(),
        ];
    }
}
