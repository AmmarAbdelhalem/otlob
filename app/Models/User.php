<?php

namespace App\Models;

use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Enums\WalletType;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, HasUuids, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'user_type',
        'status',
        'fcm_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserType::class,
            'status' => UserStatus::class,
        ];
    }

    /**
     * Alias user_type to role so both can be used interchangeably.
     */
    protected function userType(): Attribute
    {
        return Attribute::make(
            get: fn ($value, array $attributes) => $attributes['role'] ?? null,
            set: fn ($value) => ['role' => $value instanceof UserType ? $value->value : $value],
        );
    }

    public function merchant(): HasOne
    {
        return $this->hasOne(Merchant::class);
    }

    public function courierProfile(): HasOne
    {
        return $this->hasOne(CourierProfile::class);
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(CustomerVehicle::class, 'user_id');
    }

    public function wallets(): HasMany
    {
        return $this->hasMany(Wallet::class, 'user_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function remittances(): HasMany
    {
        return $this->hasMany(CourierRemittance::class, 'courier_id');
    }

    /**
     * Get or create a wallet for this user of a specific type.
     */
    public function getWallet(WalletType $type): Wallet
    {
        return $this->wallets()->firstOrCreate(
            ['type' => $type->value],
            ['balance' => 0.00, 'currency' => 'EGP']
        );
    }
}
