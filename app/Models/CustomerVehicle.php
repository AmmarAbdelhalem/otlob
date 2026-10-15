<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerVehicle extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'customer_vehicles';

    protected $fillable = [
        'user_id',
        'make',
        'model',
        'year',
        'vin',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
