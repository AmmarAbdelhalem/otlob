<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentType;
use App\Enums\RemittanceMethod;
use App\Enums\VehicleType;
use App\Models\CourierProfile;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\User;
use App\Services\RemittanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::create([
            'name' => 'System Admin',
            'phone' => '01000009999',
            'role' => 'admin',
            'password' => 'secret123',
        ]);

        $this->adminToken = $this->adminUser->createToken('admin-test', ['role:admin'])->plainTextToken;
    }

    public function test_admin_can_approve_pending_merchants(): void
    {
        $merchantOwner = User::create(['name' => 'Applicant', 'phone' => '01088887777', 'role' => 'merchant', 'password' => 'secret123']);
        $merchant = Merchant::create([
            'user_id' => $merchantOwner->id,
            'store_name' => 'Pending Store',
            'commercial_register_number' => 'CR-PENDING-1',
            'address_text' => 'Giza',
            'latitude' => 30.0,
            'longitude' => 31.0,
            'is_active' => false,
        ]);

        // 1. List pending merchants
        $listResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/merchants/pending');

        $listResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');

        // 2. Approve merchant
        $approveResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->patchJson("/api/v1/admin/merchants/{$merchant->id}/approve");

        $approveResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_active', true);

        $this->assertTrue($merchant->fresh()->is_active);
    }

    public function test_admin_can_approve_pending_or_suspended_couriers(): void
    {
        $courierUser = User::create(['name' => 'Applicant Courier', 'phone' => '01077776666', 'role' => 'courier', 'password' => 'secret123']);
        $courier = CourierProfile::create([
            'user_id' => $courierUser->id,
            'vehicle_type' => VehicleType::BIKE,
            'max_load_capacity' => null, // pending setup
            'max_volume_capacity' => null,
            'max_cod_limit' => null,
            'is_cod_suspended' => true,
        ]);

        // 1. List pending couriers
        $listResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/couriers/pending');

        $listResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');

        // 2. Approve courier
        $approveResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->patchJson("/api/v1/admin/couriers/{$courier->id}/approve");

        $approveResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_cod_suspended', false);

        $this->assertFalse($courier->fresh()->is_cod_suspended);
        $this->assertNotNull($courier->fresh()->max_load_capacity);
    }

    public function test_admin_can_review_and_approve_remittances(): void
    {
        $courierUser = User::create(['name' => 'Courier Ahmed', 'phone' => '01066665555', 'role' => 'courier', 'password' => 'secret123']);
        $courierProfile = CourierProfile::create([
            'user_id' => $courierUser->id,
            'vehicle_type' => VehicleType::CAR,
            'max_load_capacity' => 100.0,
            'max_volume_capacity' => 1.0,
            'max_cod_limit' => 2000.0,
            'collected_cash_in_hand' => 1500.0,
            'is_cod_suspended' => true,
        ]);

        $remittanceService = app(RemittanceService::class);
        $remittance = $remittanceService->createRemittance($courierUser, 1500.00, RemittanceMethod::INSTAPAY);

        // 1. List pending remittances
        $listResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/remittances');

        $listResponse->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // 2. Approve remittance
        $approveResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson("/api/v1/admin/remittances/{$remittance->id}/approve");

        $approveResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'approved');

        $courierProfile->refresh();
        $this->assertEquals(0.0, (float) $courierProfile->collected_cash_in_hand);
        $this->assertFalse($courierProfile->is_cod_suspended);
    }

    public function test_admin_financial_reports_and_metrics(): void
    {
        $customer = User::create(['name' => 'Buyer', 'phone' => '01055554445', 'role' => 'customer', 'password' => 'secret123']);
        $merchantOwner = User::create(['name' => 'Merchant', 'phone' => '01055554446', 'role' => 'merchant', 'password' => 'secret123']);
        $merchant = Merchant::create([
            'user_id' => $merchantOwner->id,
            'store_name' => 'Store Fin',
            'commercial_register_number' => 'CR-FIN-1',
            'address_text' => 'Cairo',
            'latitude' => 30.0,
            'longitude' => 31.0,
            'is_active' => true,
        ]);

        $parent = Order::create([
            'order_code' => 'ORD-FIN-PARENT',
            'customer_id' => $customer->id,
            'subtotal' => 500.0,
            'delivery_fee' => 50.0,
            'service_fee' => 20.0,
            'total_amount' => 570.0,
            'payment_type' => PaymentType::CARD,
            'payment_status' => 'paid',
            'order_status' => OrderStatus::DELIVERED,
            'delivery_lat' => 30.05,
            'delivery_lng' => 31.24,
            'delivery_otp' => '990011',
        ]);

        // Delivered sub-order
        Order::create([
            'parent_id' => $parent->id,
            'order_code' => 'ORD-FIN-SUB-1',
            'customer_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'subtotal' => 500.0,
            'delivery_fee' => 50.0,
            'service_fee' => 20.0,
            'total_amount' => 570.0,
            'payment_type' => PaymentType::CARD,
            'payment_status' => 'paid',
            'order_status' => OrderStatus::DELIVERED,
            'delivery_lat' => 30.05,
            'delivery_lng' => 31.24,
            'delivery_otp' => '990011',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/reports/financials');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_delivered_sub_orders', 1)
            ->assertJsonPath('data.total_gross_merchandise_value', 570)
            ->assertJsonPath('data.total_service_fee_revenue', 20)
            ->assertJsonPath('data.total_courier_delivery_payouts', 50);
    }
}
