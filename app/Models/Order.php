<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'orders';

    protected $fillable = [
        'parent_id',
        'order_code',
        'customer_id',
        'merchant_id',
        'courier_id',
        'subtotal',
        'delivery_fee',
        'service_fee',
        'total_amount',
        'payment_type',
        'payment_status',
        'order_status',
        'courier_paid_merchant_cash',
        'delivery_lat',
        'delivery_lng',
        'delivery_otp',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'service_fee' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'payment_type' => PaymentType::class,
            'payment_status' => PaymentStatus::class,
            'order_status' => OrderStatus::class,
            'courier_paid_merchant_cash' => 'boolean',
            'delivery_lat' => 'decimal:7',
            'delivery_lng' => 'decimal:7',
        ];
    }

    /**
     * Parent order (if this is a sub-order).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'parent_id');
    }

    /**
     * Sub-orders (if this is a parent order).
     */
    public function subOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'parent_id');
    }

    /**
     * Order items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    /**
     * Customer who placed the order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Merchant fulfillment store (null for parent order).
     */
    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class, 'merchant_id');
    }

    /**
     * Courier profile assigned for delivery (null until assigned).
     */
    public function courier(): BelongsTo
    {
        return $this->belongsTo(CourierProfile::class, 'courier_id');
    }

    /**
     * Double-entry ledger transactions associated with this order.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'order_id');
    }

    /**
     * Check if this is a parent order.
     */
    public function isParent(): bool
    {
        return is_null($this->parent_id);
    }

    /**
     * Check if this is a sub-order.
     */
    public function isSubOrder(): bool
    {
        return ! is_null($this->parent_id);
    }

    /**
     * Check if the order can transition to a target status.
     */
    public function canTransitionTo(OrderStatus $target): bool
    {
        return $this->order_status->canTransitionTo($target);
    }

    /**
     * Transition the order to a target status with validation.
     *
     * @throws \InvalidArgumentException
     */
    public function transitionTo(OrderStatus $target): bool
    {
        $this->order_status->transitionTo($target);
        $this->order_status = $target;

        return $this->save();
    }

    /**
     * Scope to only parent orders.
     */
    public function scopeParentOnly(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope to only sub-orders.
     */
    public function scopeSubOrdersOnly(Builder $query): Builder
    {
        return $query->whereNotNull('parent_id');
    }

    /**
     * Scope by order status.
     */
    public function scopeByStatus(Builder $query, OrderStatus|string $status): Builder
    {
        $value = $status instanceof OrderStatus ? $status->value : $status;
        return $query->where('order_status', $value);
    }
}
