<?php

namespace Tests\Feature;

use App\Enums\PaymentType;
use App\Enums\RemittanceMethod;
use App\Enums\RemittanceStatus;
use App\Enums\VehicleType;
use App\Models\CourierProfile;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\User;
use App\Models\Wallet;
use App\Services\LedgerService;
use App\Services\OrderAccountingService;
use App\Services\RemittanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountingAndRemittanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_online_card_settlement_allocates_funds_with_exact_double_entry_balance(): void
    {
        $ledgerService = new LedgerService();
        $accountingService = new OrderAccountingService($ledgerService);

        // Merchant
        $merchantUser = User::create(['name' => 'Store', 'phone' => '01011112222', 'role' => 'merchant', 'password' => 'secret123']);
        $merchant = Merchant::create([
            'user_id' => $merchantUser->id,
            'store_name' => 'Store A',
            'commercial_register_number' => 'CR-99991',
            'address_text' => 'Cairo',
            'latitude' => 30.0,
            'longitude' => 31.0,
            'is_active' => true,
        ]);

        // Courier
        $courierUser = User::create(['name' => 'Courier', 'phone' => '01033334444', 'role' => 'courier', 'password' => 'secret123']);
        $courierProfile = CourierProfile::create([
            'user_id' => $courierUser->id,
            'vehicle_type' => VehicleType::CAR,
            'max_load_capacity' => 100,
            'max_volume_capacity' => 1,
            'max_cod_limit' => 5000,
            'collected_cash_in_hand' => 0,
            'is_cod_suspended' => false,
            'is_online' => true,
        ]);

        $customer = User::create(['name' => 'Customer', 'phone' => '01055556666', 'role' => 'customer', 'password' => 'secret123']);

        // Order: subtotal 400, delivery 80, service fee 20 -> total 500
        $order = Order::create([
            'order_code' => 'ORD-SETTLE-ONLINE',
            'customer_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'courier_id' => $courierProfile->id,
            'subtotal' => 400.00,
            'delivery_fee' => 80.00,
            'service_fee' => 20.00,
            'total_amount' => 500.00,
            'payment_type' => PaymentType::CARD,
            'payment_status' => 'pending',
            'order_status' => 'delivered',
            'delivery_lat' => 30.0,
            'delivery_lng' => 31.0,
            'delivery_otp' => '999999',
        ]);

        // Put initial escrow funds
        $escrowWallet = Wallet::platformEscrow();
        $escrowWallet->update(['balance' => 1000.00]);

        // Settle order with 10% platform commission
        $transaction = $accountingService->settleOnlineOrder($order, 0.10);

        $this->assertNotNull($transaction);
        $this->assertEquals('paid', $order->fresh()->payment_status->value);

        // Escrow debited 500 (1000 - 500 = 500)
        $this->assertEquals(500.00, (float) $escrowWallet->fresh()->balance);

        // Courier credited 80 (100% of shipping fee)
        $courierWallet = $courierProfile->getWallet();
        $this->assertEquals(80.00, (float) $courierWallet->fresh()->balance);

        // Merchant credited 360 (400 subtotal - 40 commission)
        $merchantWallet = $merchant->getWallet();
        $this->assertEquals(360.00, (float) $merchantWallet->fresh()->balance);

        // Platform Earnings credited 60 (40 commission + 20 service fee)
        $platformEarnings = Wallet::platformEarnings();
        $this->assertEquals(60.00, (float) $platformEarnings->fresh()->balance);
    }

    public function test_remittance_approval_clears_courier_debt_and_unfreezes_cod_suspension(): void
    {
        $ledgerService = new LedgerService();
        $remittanceService = new RemittanceService($ledgerService);

        $courierUser = User::create(['name' => 'Courier Suspended', 'phone' => '01077778888', 'role' => 'courier', 'password' => 'secret123']);
        $courierProfile = CourierProfile::create([
            'user_id' => $courierUser->id,
            'vehicle_type' => VehicleType::CAR,
            'max_load_capacity' => 100,
            'max_volume_capacity' => 1,
            'max_cod_limit' => 2000.0,
            'collected_cash_in_hand' => 2500.0, // Exceeds limit
            'is_cod_suspended' => true, // Suspended
            'is_online' => true,
        ]);

        $admin = User::create(['name' => 'Admin User', 'phone' => '01000000000', 'role' => 'admin', 'password' => 'secret123']);

        // Courier deposits 1000 EGP via InstaPay
        $remittance = $remittanceService->createRemittance(
            $courierUser,
            1000.00,
            RemittanceMethod::INSTAPAY,
            'receipts/proof.jpg'
        );

        $this->assertEquals(RemittanceStatus::PENDING, $remittance->status);

        // Admin approves remittance
        $remittanceService->approveRemittance($remittance, $admin);

        $remittance->refresh();
        $this->assertEquals(RemittanceStatus::APPROVED, $remittance->status);
        $this->assertEquals($admin->id, $remittance->verified_by_admin_id);
        $this->assertNotNull($remittance->settled_at);

        // Courier cash in hand should drop from 2500 to 1500 (below 2000 limit)
        $courierProfile->refresh();
        $this->assertEquals(1500.00, (float) $courierProfile->collected_cash_in_hand);

        // COD suspension should be automatically unfrozen!
        $this->assertFalse($courierProfile->is_cod_suspended);
    }
}
