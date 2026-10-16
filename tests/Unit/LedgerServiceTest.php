<?php

namespace Tests\Unit;

use App\Enums\EntryType;
use App\Enums\TransactionType;
use App\Enums\WalletType;
use App\Models\Wallet;
use App\Services\LedgerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class LedgerServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_unbalanced_ledger_entries_throw_exception(): void
    {
        $wallet1 = Wallet::create([
            'type' => WalletType::PLATFORM_ESCROW,
            'balance' => 100.00,
        ]);

        $wallet2 = Wallet::create([
            'type' => WalletType::PLATFORM_EARNINGS,
            'balance' => 0.00,
        ]);

        $ledgerService = new LedgerService();

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unbalanced double-entry transaction');

        // Debit 100, Credit 80 (Unbalanced!)
        $ledgerService->recordTransaction(
            TransactionType::ORDER_PAYMENT,
            'Unbalanced test',
            [
                ['wallet' => $wallet1, 'entry_type' => EntryType::DEBIT, 'amount' => 100.00],
                ['wallet' => $wallet2, 'entry_type' => EntryType::CREDIT, 'amount' => 80.00],
            ]
        );
    }

    public function test_balanced_ledger_transaction_updates_wallet_balances_and_records_entries(): void
    {
        $wallet1 = Wallet::create([
            'type' => WalletType::PLATFORM_ESCROW,
            'balance' => 0.00,
        ]);

        $wallet2 = Wallet::create([
            'type' => WalletType::PLATFORM_EARNINGS,
            'balance' => 0.00,
        ]);

        $ledgerService = new LedgerService();

        // Transfer 150 from wallet1 to wallet2
        $transaction = $ledgerService->recordTransaction(
            TransactionType::ORDER_PAYMENT,
            'Balanced settlement test',
            [
                ['wallet' => $wallet1, 'entry_type' => EntryType::DEBIT, 'amount' => 150.00],
                ['wallet' => $wallet2, 'entry_type' => EntryType::CREDIT, 'amount' => 150.00],
            ]
        );

        $this->assertNotNull($transaction->id);
        $this->assertCount(2, $transaction->ledgerEntries);

        // Wallet 1 should decrease by 150 (0 - 150 = -150)
        $wallet1->refresh();
        $this->assertEquals(-150.00, (float) $wallet1->balance);

        // Wallet 2 should increase by 150 (0 + 150 = 150)
        $wallet2->refresh();
        $this->assertEquals(150.00, (float) $wallet2->balance);

        // Recalculate balance ledger integrity check
        $integrity1 = $wallet1->recalculateBalance();
        $this->assertTrue($integrity1['is_consistent']);
        $this->assertEquals(-150.00, $integrity1['calculated']);

        $integrity2 = $wallet2->recalculateBalance();
        $this->assertTrue($integrity2['is_consistent']);
        $this->assertEquals(150.00, $integrity2['calculated']);
    }
}
