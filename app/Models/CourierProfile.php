<?php

namespace App\Models;

use App\Enums\VehicleType;
use App\Enums\WalletType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CourierProfile extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'courier_profiles';

    protected $fillable = [
        'user_id',
        'vehicle_type',
        'max_load_capacity',
        'max_weight_capacity_kg',
        'max_volume_capacity',
        'max_volume_capacity_m3',
        'max_cod_limit',
        'collected_cash_in_hand',
        'is_cod_suspended',
        'is_online',
        'current_lat',
        'current_lng',
    ];

    protected function casts(): array
    {
        return [
            'vehicle_type' => VehicleType::class,
            'max_load_capacity' => 'decimal:2',
            'max_volume_capacity' => 'decimal:4',
            'max_cod_limit' => 'decimal:2',
            'collected_cash_in_hand' => 'decimal:2',
            'is_cod_suspended' => 'boolean',
            'is_online' => 'boolean',
            'current_lat' => 'decimal:7',
            'current_lng' => 'decimal:7',
        ];
    }

    /**
     * Alias max_weight_capacity_kg to max_load_capacity.
     */
    protected function maxWeightCapacityKg(): Attribute
    {
        return Attribute::make(
            get: fn ($value, array $attributes) => $attributes['max_load_capacity'] ?? null,
            set: fn ($value) => ['max_load_capacity' => $value],
        );
    }

    /**
     * Alias max_volume_capacity_m3 to max_volume_capacity.
     */
    protected function maxVolumeCapacityM3(): Attribute
    {
        return Attribute::make(
            get: fn ($value, array $attributes) => $attributes['max_volume_capacity'] ?? null,
            set: fn ($value) => ['max_volume_capacity' => $value],
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'courier_id');
    }

    /**
     * Get or create courier's wallet.
     */
    public function getWallet(): Wallet
    {
        return $this->user->getWallet(WalletType::COURIER);
    }

    /**
     * Check whether courier can carry the specified cargo weight and volume.
     */
    public function canCarryCargo(float $weightKg, float $volumeM3): bool
    {
        $weightLimit = (float) ($this->max_load_capacity ?? PHP_FLOAT_MAX);
        $volumeLimit = (float) ($this->max_volume_capacity ?? PHP_FLOAT_MAX);

        return $weightKg <= $weightLimit && $volumeM3 <= $volumeLimit;
    }

    /**
     * Check whether courier can safely accept a COD order of given amount.
     */
    public function canAcceptCod(float $amount): bool
    {
        if ($this->is_cod_suspended) {
            return false;
        }

        $limit = (float) ($this->max_cod_limit ?? 0);
        $currentCash = (float) ($this->collected_cash_in_hand ?? 0);

        return ($currentCash + $amount) <= $limit;
    }

    /**
     * Scope for online couriers.
     */
    public function scopeOnline(Builder $query): Builder
    {
        return $query->where('is_online', true);
    }

    /**
     * Scope for eligible couriers not suspended for COD.
     */
    public function scopeCodEligible(Builder $query): Builder
    {
        return $query->where('is_cod_suspended', false);
    }
}
