<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case ACCEPTED_BY_MERCHANT = 'accepted_by_merchant';
    case PREPARING = 'preparing';
    case READY_FOR_PICKUP = 'ready_for_pickup';
    case ASSIGNED_TO_COURIER = 'assigned_to_courier';
    case IN_TRANSIT = 'in_transit';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';

    /**
     * Valid state transitions map.
     *
     * @return array<OrderStatus>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::PENDING              => [self::ACCEPTED_BY_MERCHANT, self::CANCELLED],
            self::ACCEPTED_BY_MERCHANT => [self::PREPARING, self::CANCELLED],
            self::PREPARING            => [self::READY_FOR_PICKUP, self::CANCELLED],
            self::READY_FOR_PICKUP     => [self::ASSIGNED_TO_COURIER, self::CANCELLED],
            self::ASSIGNED_TO_COURIER  => [self::IN_TRANSIT, self::CANCELLED],
            self::IN_TRANSIT           => [self::DELIVERED, self::CANCELLED],
            self::DELIVERED            => [],
            self::CANCELLED            => [],
        };
    }

    /**
     * Check if a transition to the target status is valid.
     */
    public function canTransitionTo(OrderStatus $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    /**
     * Transition to a new status, throwing if invalid.
     *
     * @throws \InvalidArgumentException
     */
    public function transitionTo(OrderStatus $target): OrderStatus
    {
        if (! $this->canTransitionTo($target)) {
            throw new \InvalidArgumentException(
                "Invalid order status transition from [{$this->value}] to [{$target->value}]."
            );
        }

        return $target;
    }

    /**
     * Check if this status is a terminal (final) state.
     */
    public function isTerminal(): bool
    {
        return in_array($this, [self::DELIVERED, self::CANCELLED], true);
    }

    /**
     * Get a human-readable label for this status.
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING              => 'Pending',
            self::ACCEPTED_BY_MERCHANT => 'Accepted by Merchant',
            self::PREPARING            => 'Preparing',
            self::READY_FOR_PICKUP     => 'Ready for Pickup',
            self::ASSIGNED_TO_COURIER  => 'Assigned to Courier',
            self::IN_TRANSIT           => 'In Transit',
            self::DELIVERED            => 'Delivered',
            self::CANCELLED            => 'Cancelled',
        };
    }
}
