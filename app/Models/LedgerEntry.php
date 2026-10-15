<?php

namespace App\Models;

use App\Enums\EntryType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerEntry extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ledger_entries';

    protected $fillable = [
        'transaction_id',
        'wallet_id',
        'entry_type',
        'amount',
        'running_balance',
    ];

    protected function casts(): array
    {
        return [
            'entry_type' => EntryType::class,
            'amount' => 'decimal:2',
            'running_balance' => 'decimal:2',
        ];
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class, 'wallet_id');
    }
}
