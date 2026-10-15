<?php

namespace App\Services;

use App\Enums\EntryType;
use App\Enums\TransactionType;
use App\Models\LedgerEntry;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class LedgerService
{
    /**
     * Record a balanced double-entry transaction across multiple wallets atomically.
     *
     * @param string|TransactionType $transactionType
     * @param string $description
     * @param array<array{wallet: Wallet|string, entry_type: EntryType|string, amount: float}> $entries
     * @param Order|null $order Associated order, if any
     * @return Transaction The newly created transaction with its ledger entries
     *
     * @throws InvalidArgumentException
     */
    public function recordTransaction(
        string|TransactionType $transactionType,
        string $description,
        array $entries,
        ?Order $order = null
    ): Transaction {
        if (count($entries) < 2) {
            throw new InvalidArgumentException('Double-entry transactions require at least two ledger entries.');
        }

        // 1. Calculate and assert sum(Debits) == sum(Credits)
        $totalDebits = 0.0;
        $totalCredits = 0.0;

        foreach ($entries as $entry) {
            $amount = round((float) $entry['amount'], 2);
            if ($amount <= 0) {
                throw new InvalidArgumentException("Entry amount must be greater than zero. Received: {$amount}");
            }

            $type = $entry['entry_type'] instanceof EntryType
                ? $entry['entry_type']
                : EntryType::from(strtolower($entry['entry_type']));

            if ($type === EntryType::DEBIT) {
                $totalDebits += $amount;
            } else {
                $totalCredits += $amount;
            }
        }

        $totalDebits = round($totalDebits, 2);
        $totalCredits = round($totalCredits, 2);

        if (abs($totalDebits - $totalCredits) >= 0.01) {
            throw new InvalidArgumentException(
                "Unbalanced double-entry transaction: Total Debits ({$totalDebits}) does not match Total Credits ({$totalCredits})."
            );
        }

        // 2. Execute atomically inside a DB transaction with row locking
        return DB::transaction(function () use ($transactionType, $description, $entries, $order) {
            // Collect all unique wallet IDs to lock in consistent order (prevent deadlocks)
            $walletIds = collect($entries)->map(function ($entry) {
                return $entry['wallet'] instanceof Wallet ? $entry['wallet']->id : $entry['wallet'];
            })->unique()->sort()->values();

            // Lock wallets for update
            $wallets = Wallet::whereIn('id', $walletIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // Create parent Transaction header
            $txnType = $transactionType instanceof TransactionType ? $transactionType->value : $transactionType;
            $transaction = Transaction::create([
                'reference_uuid' => (string) Str::uuid(),
                'order_id' => $order?->id,
                'transaction_type' => $txnType,
                'description' => $description,
            ]);

            // Create individual Ledger entries and adjust wallet balances
            foreach ($entries as $entryData) {
                $walletId = $entryData['wallet'] instanceof Wallet
                    ? $entryData['wallet']->id
                    : $entryData['wallet'];

                /** @var Wallet $wallet */
                $wallet = $wallets->get($walletId);
                if (! $wallet) {
                    throw new InvalidArgumentException("Wallet with ID [{$walletId}] was not found.");
                }

                $amount = round((float) $entryData['amount'], 2);
                $entryType = $entryData['entry_type'] instanceof EntryType
                    ? $entryData['entry_type']
                    : EntryType::from(strtolower($entryData['entry_type']));

                $currentBalance = (float) $wallet->balance;

                // Credit adds to wallet, Debit deducts from wallet
                if ($entryType === EntryType::CREDIT) {
                    $newBalance = round($currentBalance + $amount, 2);
                } else {
                    $newBalance = round($currentBalance - $amount, 2);
                }

                // Persist ledger entry
                LedgerEntry::create([
                    'transaction_id' => $transaction->id,
                    'wallet_id' => $wallet->id,
                    'entry_type' => $entryType->value,
                    'amount' => $amount,
                    'running_balance' => $newBalance,
                ]);

                // Update cached balance on wallet model
                $wallet->balance = $newBalance;
                $wallet->save();
            }

            return $transaction->load('ledgerEntries.wallet');
        });
    }
}
