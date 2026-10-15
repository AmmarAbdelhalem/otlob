<?php

namespace App\Models;

use App\Enums\RemittanceMethod;
use App\Enums\RemittanceStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CourierRemittance extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'courier_remittances';

    protected $fillable = [
        'reference_number',
        'courier_id',
        'amount',
        'method',
        'status',
        'proof_receipt_path',
        'verified_by_admin_id',
        'settled_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'method' => RemittanceMethod::class,
            'status' => RemittanceStatus::class,
            'settled_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($remittance) {
            if (empty($remittance->reference_number)) {
                $remittance->reference_number = 'REM-' . strtoupper(Str::random(10));
            }
        });
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    public function verifiedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_admin_id');
    }
}
