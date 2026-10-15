<?php

namespace App\Models;

use App\Enums\EntryType;
use App\Enums\WalletType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Wallet extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'wallets';

    protected $fillable = [
        'user_id',
        'type',
        'currency',
        'balance',
    ];

    protected function casts(): array
    {
        return [
            'type' => WalletType::class,
            'balance' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(LedgerEntry::class, 'wallet_id');
    }

    /**
     * Ledger integrity checker:
     * Recalculates balance directly from ledger entries history:
     * sum(credits) - sum(debits).
     *
     * @param bool $persist If true, synchronizes the wallet cached balance in database
     * @return array{stored: float, calculated: float, is_consistent: bool}
     */
    public function recalculateBalance(bool $persist = false): array
    {
        $sumResult = $this->ledgerEntries()
            ->selectRaw("
                COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0) as total_credit,
                COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0) as total_debit
            ")
            ->first();

        $totalCredit = (float) ($sumResult->total_credit ?? 0);
        $totalDebit  = (float) ($sumResult->total_debit ?? 0);
        $calculated  = round($totalCredit - $totalDebit, 2);
        $stored      = round((float) $this->balance, 2);

        $isConsistent = abs($stored - $calculated) < 0.001;

        if (! $isConsistent && $persist) {
            $this->balance = $calculated;
            $this->save();
        }

        return [
            'stored' => $stored,
            'calculated' => $calculated,
            'is_consistent' => $isConsistent,
        ];
    }

    /**
     * Retrieve or create the platform escrow wallet.
     */
    public static function platformEscrow(): self
    {
        return self::firstOrCreate(
            ['user_id' => null, 'type' => WalletType::PLATFORM_ESCROW->value],
            ['currency' => 'EGP', 'balance' => 0.00]
        );
    }

    /**
     * Retrieve or create the platform earnings wallet.
     */
    public static function platformEarnings(): self
    {
        return self::firstOrCreate(
            ['user_id' => null, 'type' => WalletType::PLATFORM_EARNINGS->value],
            ['currency' => 'EGP', 'balance' => 0.00]
        );
    }
}
