<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum OrderStatus: string implements HasLabel, HasColor, HasIcon
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

    public function getLabel(): ?string
    {
        return $this->label();
    }

    public function getColor(): string | array | null
    {
        return match ($this) {
            self::PENDING              => 'gray',
            self::ACCEPTED_BY_MERCHANT => 'info',
            self::PREPARING            => 'warning',
            self::READY_FOR_PICKUP     => 'info',
            self::ASSIGNED_TO_COURIER  => 'primary',
            self::IN_TRANSIT           => 'primary',
            self::DELIVERED            => 'success',
            self::CANCELLED            => 'danger',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::PENDING              => 'heroicon-m-clock',
            self::ACCEPTED_BY_MERCHANT => 'heroicon-m-check-circle',
            self::PREPARING            => 'heroicon-m-arrow-path',
            self::READY_FOR_PICKUP     => 'heroicon-m-archive-box',
            self::ASSIGNED_TO_COURIER  => 'heroicon-m-user-plus',
            self::IN_TRANSIT           => 'heroicon-m-truck',
            self::DELIVERED            => 'heroicon-m-check-badge',
            self::CANCELLED            => 'heroicon-m-x-circle',
        };
    }
}
