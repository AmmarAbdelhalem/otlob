<?php

namespace App\Services;

use App\Enums\EntryType;
use App\Enums\RemittanceMethod;
use App\Enums\RemittanceStatus;
use App\Enums\TransactionType;
use App\Models\CourierProfile;
use App\Models\CourierRemittance;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class RemittanceService
{
    protected LedgerService $ledgerService;

    public function __construct(LedgerService $ledgerService)
    {
        $this->ledgerService = $ledgerService;
    }

    /**
     * Submit a cash clearance remittance request by a courier.
     */
    public function createRemittance(
        User|CourierProfile $courier,
        float $amount,
        RemittanceMethod $method,
        ?string $receiptPath = null
    ): CourierRemittance {
        if ($amount <= 0) {
            throw new InvalidArgumentException('Remittance amount must be greater than zero.');
        }

        $courierUser = $courier instanceof CourierProfile ? $courier->user : $courier;

        return CourierRemittance::create([
            'courier_id' => $courierUser->id,
            'amount' => round($amount, 2),
            'method' => $method,
            'status' => RemittanceStatus::PENDING,
            'proof_receipt_path' => $receiptPath,
        ]);
    }

    /**
     * Admin approves a courier remittance deposit, executes double-entry clearance journal,
     * reduces collected cash in hand, and unfreezes COD suspension if within limits.
     *
     * @param CourierRemittance $remittance
     * @param User $admin Admin performing the verification
     * @return CourierRemittance
     */
    public function approveRemittance(CourierRemittance $remittance, User $admin): CourierRemittance
    {
        if ($remittance->status !== RemittanceStatus::PENDING) {
            throw new InvalidArgumentException("Remittance [{$remittance->reference_number}] is already processed.");
        }

        return DB::transaction(function () use ($remittance, $admin) {
            $amount = (float) $remittance->amount;
            $courierUser = $remittance->courier;
            $courierProfile = $courierUser->courierProfile;

            // 1. Settle debt via Double-Entry journal:
            // Debit platform escrow/bank (platform received cash in bank)
            // Credit courier wallet (clearing courier's liability)
            $platformEscrowWallet = Wallet::platformEscrow();
            $courierWallet = $courierUser->getWallet(\App\Enums\WalletType::COURIER);

            $entries = [
                [
                    'wallet' => $platformEscrowWallet,
                    'entry_type' => EntryType::DEBIT,
                    'amount' => $amount,
                ],
                [
                    'wallet' => $courierWallet,
                    'entry_type' => EntryType::CREDIT,
                    'amount' => $amount,
                ],
            ];

            $this->ledgerService->recordTransaction(
                TransactionType::REMITTANCE_SETTLEMENT,
                "Remittance settlement approval ref #{$remittance->reference_number}",
                $entries
            );

            // 2. Adjust courier physical cash in hand and auto unfreeze COD suspension
            if ($courierProfile) {
                $newCashInHand = max(0.0, round(((float) $courierProfile->collected_cash_in_hand) - $amount, 2));
                $maxLimit = (float) ($courierProfile->max_cod_limit ?? PHP_FLOAT_MAX);

                $courierProfile->update([
                    'collected_cash_in_hand' => $newCashInHand,
                    'is_cod_suspended' => $newCashInHand > $maxLimit,
                ]);
            }

            // 3. Mark remittance as approved
            $remittance->update([
                'status' => RemittanceStatus::APPROVED,
                'verified_by_admin_id' => $admin->id,
                'settled_at' => now(),
            ]);

            return $remittance;
        });
    }

    /**
     * Reject a remittance deposit receipt.
     */
    public function rejectRemittance(CourierRemittance $remittance, User $admin): CourierRemittance
    {
        if ($remittance->status !== RemittanceStatus::PENDING) {
            throw new InvalidArgumentException("Remittance [{$remittance->reference_number}] is already processed.");
        }

        $remittance->update([
            'status' => RemittanceStatus::REJECTED,
            'verified_by_admin_id' => $admin->id,
            'settled_at' => now(),
        ]);

        return $remittance;
    }
}
