<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Merchant extends Model
{
    use HasUuids;
    public $table = 'merchants';

    protected $fillable = [
        'user_id',
        'store_name',
        'commercial_registration_number',
        'address_text',
        'latitude',
        'longitude',
        'is_active'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function products() {
        return $this->hasMany(Prodcut::class);
    }

    public function orders() {
        return $this->hasMany(Order::class);
    }
}
