<?php

namespace App\Models;

use App\Enums\WalletType;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Merchant extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'merchants';

    protected $fillable = [
        'user_id',
        'store_name',
        'commercial_register_number',
        'commercial_registration_number',
        'address_text',
        'latitude',
        'longitude',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Alias commercial_registration_number to commercial_register_number.
     */
    protected function commercialRegistrationNumber(): Attribute
    {
        return Attribute::make(
            get: fn ($value, array $attributes) => $attributes['commercial_register_number'] ?? null,
            set: fn ($value) => ['commercial_register_number' => $value],
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'merchant_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'merchant_id');
    }

    /**
     * Get or create the merchant's wallet.
     */
    public function getWallet(): Wallet
    {
        return $this->user->getWallet(WalletType::MERCHANT);
    }
}
