<?php

namespace App\Console\Commands;

use App\Enums\EntryType;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Console\Command;

class AuditLedgerIntegrityCommand extends Command
{
    protected $signature = 'ledger:audit {--fix : Automatically recalculate and fix discrepancies}';

    protected $description = 'Audit double-entry ledger balance integrity and verify global zero-sum transaction conservation';

    public function handle(): int
    {
        $this->info('Starting Double-Entry Ledger Audit...');

        $discrepanciesCount = 0;
        $unbalancedTxCount = 0;

        // 1. Audit every transaction for Debit == Credit conservation
        $this->info('Verifying transaction journal balances...');
        $transactions = Transaction::with('ledgerEntries')->get();

        foreach ($transactions as $tx) {
            $debits = (float) $tx->ledgerEntries->where('entry_type', EntryType::DEBIT)->sum('amount');
            $credits = (float) $tx->ledgerEntries->where('entry_type', EntryType::CREDIT)->sum('amount');

            if (abs($debits - $credits) > 0.0001) {
                $unbalancedTxCount++;
                $this->error("Unbalanced Transaction [ID: {$tx->id}, Ref: {$tx->reference_uuid}]: Debits = {$debits}, Credits = {$credits}");
            }
        }

        // 2. Audit each wallet's balance against ledger running total
        $this->info('Verifying individual wallet balance sums against ledger entries...');
        $wallets = Wallet::all();

        foreach ($wallets as $wallet) {
            $audit = $wallet->recalculateBalance((bool) $this->option('fix'));

            if (! $audit['is_consistent']) {
                $discrepanciesCount++;
                $this->warn("Wallet [ID: {$wallet->id}, Type: {$wallet->type->value}]: Recorded = {$audit['stored']}, Calculated = {$audit['calculated']}");

                if ($this->option('fix')) {
                    $this->info(" -> Corrected balance for Wallet [{$wallet->id}] to {$audit['calculated']}");
                }
            }
        }

        if ($unbalancedTxCount === 0 && $discrepanciesCount === 0) {
            $this->info('✔ Perfect Ledger Integrity: All transactions balanced and wallet sums match.');
            return Command::SUCCESS;
        }

        $this->error("Audit Completed with {$unbalancedTxCount} unbalanced transactions and {$discrepanciesCount} wallet discrepancies.");
        return Command::FAILURE;
    }
}
