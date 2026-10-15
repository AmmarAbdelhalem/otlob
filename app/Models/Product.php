<?php

namespace App\Models;

use App\Enums\ProductCondition;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'products';

    protected $fillable = [
        'merchant_id',
        'name',
        'sku',
        'oem_number',
        'description',
        'price',
        'stock_quantity',
        'weight_kg',
        'length_cm',
        'width_cm',
        'height_cm',
        'condition',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'weight_kg' => 'decimal:2',
            'length_cm' => 'decimal:2',
            'width_cm' => 'decimal:2',
            'height_cm' => 'decimal:2',
            'condition' => ProductCondition::class,
            'is_active' => 'boolean',
        ];
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function compatibilities(): HasMany
    {
        return $this->hasMany(ProductCompatibility::class, 'product_id');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }

    /**
     * Scope to products compatible with a specific vehicle make, model, and year.
     */
    public function scopeCompatibleWithVehicle(Builder $query, string $make, string $model, int $year): Builder
    {
        return $query->whereHas('compatibilities', function (Builder $q) use ($make, $model, $year) {
            $q->whereRaw('LOWER(make) = ?', [strtolower($make)])
              ->whereRaw('LOWER(model) = ?', [strtolower($model)])
              ->where('year_from', '<=', $year)
              ->where('year_to', '>=', $year);
        });
    }

    /**
     * Scope to products by OEM number.
     */
    public function scopeByOemNumber(Builder $query, string $oemNumber): Builder
    {
        return $query->where('oem_number', $oemNumber);
    }

    /**
     * Scope to active products only.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Calculate volume in cubic meters (m³).
     */
    public function getVolumeM3Attribute(): float
    {
        return ((float) $this->length_cm * (float) $this->width_cm * (float) $this->height_cm) / 1_000_000;
    }

    /**
     * Check if product has enough stock.
     */
    public function hasStock(int $quantity = 1): bool
    {
        return $this->stock_quantity >= $quantity;
    }
}
