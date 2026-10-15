<?php

namespace App\Services;

use App\Enums\EntryType;
use App\Enums\PaymentStatus;
use App\Enums\TransactionType;
use App\Enums\WalletType;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\Wallet;
use InvalidArgumentException;

class OrderAccountingService
{
    protected LedgerService $ledgerService;

    public function __construct(LedgerService $ledgerService)
    {
        $this->ledgerService = $ledgerService;
    }

    /**
     * Settle an online card order upon successful delivery.
     * Escrow -> Courier (100% shipping fee) + Merchant (Parts - Commission) + Platform Earnings (Commission + Service Fee)
     *
     * @param Order $order
     * @param float $commissionRate Platform commission rate on parts (e.g., 0.10 for 10%)
     * @return Transaction
     */
    public function settleOnlineOrder(Order $order, float $commissionRate = 0.10): Transaction
    {
        $this->validateSettlementPrerequisites($order);

        $subtotal = (float) $order->subtotal;
        $deliveryFee = (float) $order->delivery_fee;
        $serviceFee = (float) $order->service_fee;
        $totalAmount = (float) $order->total_amount;

        $commissionAmount = round($subtotal * $commissionRate, 2);
        $merchantEarnings = round($subtotal - $commissionAmount, 2);
        $platformEarnings = round($commissionAmount + $serviceFee, 2);

        $escrowWallet = Wallet::platformEscrow();
        $platformEarningsWallet = Wallet::platformEarnings();
        $courierWallet = $order->courier->getWallet();
        $merchantWallet = $order->merchant->getWallet();

        $entries = [
            // Debit escrow wallet (funds leaving escrow)
            [
                'wallet' => $escrowWallet,
                'entry_type' => EntryType::DEBIT,
                'amount' => $totalAmount,
            ],
            // Credit courier wallet (100% of delivery fee)
            [
                'wallet' => $courierWallet,
                'entry_type' => EntryType::CREDIT,
                'amount' => $deliveryFee,
            ],
            // Credit merchant wallet (subtotal minus platform commission)
            [
                'wallet' => $merchantWallet,
                'entry_type' => EntryType::CREDIT,
                'amount' => $merchantEarnings,
            ],
            // Credit platform earnings wallet (commission + service fee)
            [
                'wallet' => $platformEarningsWallet,
                'entry_type' => EntryType::CREDIT,
                'amount' => $platformEarnings,
            ],
        ];

        $transaction = $this->ledgerService->recordTransaction(
            TransactionType::ORDER_PAYMENT,
            "Settlement for online order [{$order->order_code}]",
            $entries,
            $order
        );

        $order->update(['payment_status' => PaymentStatus::PAID]);

        return $transaction;
    }

    /**
     * Settle standard Cash On Delivery (COD) order upon delivery.
     * Courier collected customer cash -> Courier wallet debited -> Merchant & Platform credited.
     *
     * @param Order $order
     * @param float $commissionRate
     * @return Transaction
     */
    public function settleCodStandardOrder(Order $order, float $commissionRate = 0.10): Transaction
    {
        $this->validateSettlementPrerequisites($order);

        $subtotal = (float) $order->subtotal;
        $serviceFee = (float) $order->service_fee;
        $totalAmount = (float) $order->total_amount;

        $commissionAmount = round($subtotal * $commissionRate, 2);
        $merchantEarnings = round($subtotal - $commissionAmount, 2);
        $platformEarnings = round($commissionAmount + $serviceFee, 2);

        // Courier collected totalAmount in cash. Courier keeps delivery_fee in cash.
        // Net liability owed by courier to platform is: subtotal + serviceFee
        $courierNetLiability = round($subtotal + $serviceFee, 2);

        $courierWallet = $order->courier->getWallet();
        $merchantWallet = $order->merchant->getWallet();
        $platformEarningsWallet = Wallet::platformEarnings();

        $entries = [
            // Debit courier wallet (liability owed for cash in hand)
            [
                'wallet' => $courierWallet,
                'entry_type' => EntryType::DEBIT,
                'amount' => $courierNetLiability,
            ],
            // Credit merchant wallet (subtotal minus commission)
            [
                'wallet' => $merchantWallet,
                'entry_type' => EntryType::CREDIT,
                'amount' => $merchantEarnings,
            ],
            // Credit platform earnings (commission + service fee)
            [
                'wallet' => $platformEarningsWallet,
                'entry_type' => EntryType::CREDIT,
                'amount' => $platformEarnings,
            ],
        ];

        $transaction = $this->ledgerService->recordTransaction(
            TransactionType::COD_COLLECTION,
            "COD standard settlement for order [{$order->order_code}]",
            $entries,
            $order
        );

        // Update courier's physical cash in hand and verify COD suspension
        $courierProfile = $order->courier;
        $newCashInHand = round(((float) $courierProfile->collected_cash_in_hand) + $totalAmount, 2);
        $isSuspended = $courierProfile->is_cod_suspended;

        if ($courierProfile->max_cod_limit !== null && $newCashInHand > (float) $courierProfile->max_cod_limit) {
            $isSuspended = true;
        }

        $courierProfile->update([
            'collected_cash_in_hand' => $newCashInHand,
            'is_cod_suspended' => $isSuspended,
        ]);

        $order->update(['payment_status' => PaymentStatus::PAID]);

        return $transaction;
    }

    /**
     * Settle COD Paid-by-Courier Flow (Courier paid merchant cash upfront at pickup).
     * Merchant debited platform commission -> Courier debited platform service fee -> Platform earnings credited.
     *
     * @param Order $order
     * @param float $commissionRate
     * @return Transaction
     */
    public function settleCodPaidByCourierOrder(Order $order, float $commissionRate = 0.10): Transaction
    {
        $this->validateSettlementPrerequisites($order);

        $subtotal = (float) $order->subtotal;
        $serviceFee = (float) $order->service_fee;

        $platformCommission = round($subtotal * $commissionRate, 2);
        $totalPlatformEarnings = round($platformCommission + $serviceFee, 2);

        $merchantWallet = $order->merchant->getWallet();
        $courierWallet = $order->courier->getWallet();
        $platformEarningsWallet = Wallet::platformEarnings();

        $entries = [
            // Merchant owes platform commission from cash received at counter
            [
                'wallet' => $merchantWallet,
                'entry_type' => EntryType::DEBIT,
                'amount' => $platformCommission,
            ],
            // Courier owes platform service fee collected from customer
            [
                'wallet' => $courierWallet,
                'entry_type' => EntryType::DEBIT,
                'amount' => $serviceFee,
            ],
            // Platform earnings credited with commission + service fee
            [
                'wallet' => $platformEarningsWallet,
                'entry_type' => EntryType::CREDIT,
                'amount' => $totalPlatformEarnings,
            ],
        ];

        $transaction = $this->ledgerService->recordTransaction(
            TransactionType::COMMISSION_DEDUCTION,
            "Paid-by-courier COD settlement for order [{$order->order_code}]",
            $entries,
            $order
        );

        // Update courier cash in hand by serviceFee
        $courierProfile = $order->courier;
        $newCashInHand = round(((float) $courierProfile->collected_cash_in_hand) + $serviceFee, 2);
        $isSuspended = $courierProfile->is_cod_suspended;

        if ($courierProfile->max_cod_limit !== null && $newCashInHand > (float) $courierProfile->max_cod_limit) {
            $isSuspended = true;
        }

        $courierProfile->update([
            'collected_cash_in_hand' => $newCashInHand,
            'is_cod_suspended' => $isSuspended,
        ]);

        $order->update([
            'payment_status' => PaymentStatus::PAID,
            'courier_paid_merchant_cash' => true,
        ]);

        return $transaction;
    }

    /**
     * Common validations before financial settlement.
     */
    protected function validateSettlementPrerequisites(Order $order): void
    {
        if (! $order->merchant) {
            throw new InvalidArgumentException("Order [{$order->order_code}] does not have an associated merchant.");
        }

        if (! $order->courier) {
            throw new InvalidArgumentException("Order [{$order->order_code}] does not have an assigned courier.");
        }
    }
}
