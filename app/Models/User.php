<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasRoles, HasUuids;
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'user_type',
        'status',
        'fcm_token'
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
        ];
    }

    public function merchant() {
        return $this->hasOne(Merchant::class);
    }

    public function courierProfile() {
        return $this->hasOne(CourierProfile::class);
    }

    public function vehicles() {
        return $this->hasMany(CustomerVechicle::class);
    }

    public function wallets() {
        return $this->hasMany(Wallet::class);
    }

    public function orders() {
        return $this->hasMany(Order::class, 'customer_id');
    }
}
