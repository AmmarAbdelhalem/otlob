<?php

namespace App\Http\Controllers\Api\v1;

use App\Enums\RemittanceStatus;
use App\Enums\WalletType;
use App\Http\Controllers\Controller;
use App\Models\CourierProfile;
use App\Models\CourierRemittance;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\Wallet;
use App\Services\RemittanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminController extends Controller
{
    protected RemittanceService $remittanceService;

    public function __construct(RemittanceService $remittanceService)
    {
        $this->remittanceService = $remittanceService;
    }

    /**
     * List merchant profiles awaiting approval.
     */
    public function getPendingMerchants(Request $request): JsonResponse
    {
        $merchants = Merchant::with('user')
            ->where('is_active', false)
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $merchants->items(),
            'meta' => [
                'current_page' => $merchants->currentPage(),
                'last_page' => $merchants->lastPage(),
                'total' => $merchants->total(),
            ],
        ]);
    }

    /**
     * Approve a merchant store.
     */
    public function approveMerchant(Request $request, string $id): JsonResponse
    {
        $merchant = Merchant::findOrFail($id);
        $merchant->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => "Merchant store [{$merchant->store_name}] has been approved.",
            'data' => $merchant,
        ]);
    }

    /**
     * List courier profiles awaiting approval.
     */
    public function getPendingCouriers(Request $request): JsonResponse
    {
        $couriers = CourierProfile::with('user')
            ->where('is_cod_suspended', true)
            ->orWhereNull('max_load_capacity')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $couriers->items(),
            'meta' => [
                'current_page' => $couriers->currentPage(),
                'last_page' => $couriers->lastPage(),
                'total' => $couriers->total(),
            ],
        ]);
    }

    /**
     * Approve/unfreeze a courier profile.
     */
    public function approveCourier(Request $request, string $id): JsonResponse
    {
        $courier = CourierProfile::findOrFail($id);
        $courier->update([
            'is_cod_suspended' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Courier profile approved and active.',
            'data' => $courier,
        ]);
    }

    /**
     * Global oversight across all parent and sub-orders.
     */
    public function getAllOrders(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $parentOnly = $request->boolean('parent_only', false);

        $query = Order::with(['customer', 'merchant', 'courier.user', 'subOrders']);

        if ($parentOnly) {
            $query->parentOnly();
        }

        if ($status) {
            $query->where('order_status', $status);
        }

        $orders = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * List courier remittance receipts awaiting admin audit.
     */
    public function getPendingRemittances(Request $request): JsonResponse
    {
        $remittances = CourierRemittance::with(['courier.courierProfile'])
            ->where('status', RemittanceStatus::PENDING)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $remittances->items(),
            'meta' => [
                'current_page' => $remittances->currentPage(),
                'last_page' => $remittances->lastPage(),
                'total' => $remittances->total(),
            ],
        ]);
    }

    /**
     * Audit courier remittance deposit receipt and clear courier debt.
     */
    public function approveRemittance(Request $request, string $id): JsonResponse
    {
        $remittance = CourierRemittance::with(['courier.courierProfile'])->findOrFail($id);

        $approved = $this->remittanceService->approveRemittance($remittance, $request->user());

        return response()->json([
            'success' => true,
            'message' => "Remittance #{$approved->reference_number} approved and courier liability settled.",
            'data' => $approved,
        ]);
    }

    /**
     * Financial analytics and reporting (Platform revenue, service fee income, escrow balance).
     */
    public function getFinancialReports(Request $request): JsonResponse
    {
        $platformEarningsWallet = Wallet::platformEarnings();
        $platformEscrowWallet = Wallet::platformEscrow();

        // Calculate service fee totals and order volume
        $deliveredOrders = Order::subOrdersOnly()
            ->where('order_status', 'delivered');

        $totalDeliveredSubOrders = $deliveredOrders->count();
        $totalGrossVolume = (float) $deliveredOrders->sum('total_amount');
        $totalServiceFees = (float) $deliveredOrders->sum('service_fee');
        $totalDeliveryFeesPaid = (float) $deliveredOrders->sum('delivery_fee');

        return response()->json([
            'success' => true,
            'data' => [
                'platform_earnings_balance' => (float) $platformEarningsWallet->balance,
                'platform_escrow_balance' => (float) $platformEscrowWallet->balance,
                'total_delivered_sub_orders' => $totalDeliveredSubOrders,
                'total_gross_merchandise_value' => $totalGrossVolume,
                'total_service_fee_revenue' => $totalServiceFees,
                'total_courier_delivery_payouts' => $totalDeliveryFeesPaid,
            ],
        ]);
    }
}
