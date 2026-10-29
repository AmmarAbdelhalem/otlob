<?php

namespace Tests\Unit;

use App\Enums\EntryType;
use App\Enums\TransactionType;
use App\Enums\WalletType;
use App\Models\LedgerEntry;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletBalanceRecalculationTest extends TestCase
{
    use RefreshDatabase;

    public function test_platform_wallets_initialization(): void
    {
        $escrow = Wallet::platformEscrow();
        $this->assertEquals(WalletType::PLATFORM_ESCROW, $escrow->type);
        $this->assertNull($escrow->user_id);

        $earnings = Wallet::platformEarnings();
        $this->assertEquals(WalletType::PLATFORM_EARNINGS, $earnings->type);
        $this->assertNull($earnings->user_id);
    }

    public function test_recalculate_balance_detects_and_fixes_integrity_drift(): void
    {
        $user = User::create(['name' => 'Customer', 'phone' => '01000000001', 'role' => 'customer', 'password' => 'secret123']);
        $wallet = $user->getWallet(WalletType::CUSTOMER);

        // Manually set an incorrect stored balance (drift)
        $wallet->balance = 500.00;
        $wallet->save();

        $transaction = Transaction::create([
            'reference_uuid' => 'drift-test-uuid',
            'transaction_type' => TransactionType::ORDER_PAYMENT,
            'description' => 'Test drift',
        ]);

        // Add 100 EGP credit
        LedgerEntry::create([
            'transaction_id' => $transaction->id,
            'wallet_id' => $wallet->id,
            'entry_type' => EntryType::CREDIT,
            'amount' => 100.00,
            'running_balance' => 100.00,
        ]);

        // Add 30 EGP debit -> True balance should be 70.00
        LedgerEntry::create([
            'transaction_id' => $transaction->id,
            'wallet_id' => $wallet->id,
            'entry_type' => EntryType::DEBIT,
            'amount' => 30.00,
            'running_balance' => 70.00,
        ]);

        // 1. Without persist: reports inconsistent, stored stays 500
        $checkNoPersist = $wallet->recalculateBalance(persist: false);
        $this->assertFalse($checkNoPersist['is_consistent']);
        $this->assertEquals(500.00, $checkNoPersist['stored']);
        $this->assertEquals(70.00, $checkNoPersist['calculated']);
        $this->assertEquals(500.00, (float) $wallet->fresh()->balance);

        // 2. With persist: fixes the balance to 70
        $checkPersist = $wallet->recalculateBalance(persist: true);
        $this->assertFalse($checkPersist['is_consistent']); // initially wasn't consistent
        $this->assertEquals(70.00, (float) $wallet->fresh()->balance);

        // 3. Second run is now fully consistent
        $recheck = $wallet->recalculateBalance(persist: false);
        $this->assertTrue($recheck['is_consistent']);
        $this->assertEquals(70.00, $recheck['stored']);
        $this->assertEquals(70.00, $recheck['calculated']);
    }
}
