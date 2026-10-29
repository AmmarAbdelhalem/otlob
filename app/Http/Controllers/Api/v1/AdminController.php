<?php

namespace App\Http\Controllers\Api\v1;

use App\Enums\OrderStatus;
use App\Enums\RemittanceStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GetAdminOrdersRequest;
use App\Models\CourierProfile;
use App\Models\CourierRemittance;
use App\Models\LedgerEntry;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\RemittanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        return $this->paginatedResponse($merchants);
    }

    /**
     * Approve a merchant store.
     */
    public function approveMerchant(Request $request, string $id): JsonResponse
    {
        $merchant = Merchant::findOrFail($id);
        $merchant->update(['is_active' => true]);

        return $this->successResponse(
            $merchant,
            "Merchant store [{$merchant->store_name}] has been approved."
        );
    }

    /**
     * List courier profiles awaiting approval or suspended.
     */
    public function getPendingCouriers(Request $request): JsonResponse
    {
        $couriers = CourierProfile::with('user')
            ->where(function ($query) {
                $query->where('is_cod_suspended', true)
                      ->orWhereNull('max_load_capacity');
            })
            ->paginate(20);

        return $this->paginatedResponse($couriers);
    }

    /**
     * Approve/unfreeze a courier profile.
     */
    public function approveCourier(Request $request, string $id): JsonResponse
    {
        $courier = CourierProfile::findOrFail($id);
        $courier->update([
            'is_cod_suspended' => false,
            'max_load_capacity' => $courier->max_load_capacity ?? 20.0,
            'max_volume_capacity' => $courier->max_volume_capacity ?? 0.1,
            'max_cod_limit' => $courier->max_cod_limit ?? 2000.0,
        ]);

        return $this->successResponse(
            $courier,
            'Courier profile approved and active.'
        );
    }

    /**
     * Global oversight across all parent and sub-orders.
     */
    public function getAllOrders(GetAdminOrdersRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $status = $validated['status'] ?? null;
        $parentOnly = (bool) ($validated['parent_only'] ?? false);
        $perPage = min((int) ($validated['per_page'] ?? 20), 100);

        $query = Order::with(['customer', 'merchant', 'courier.user', 'subOrders']);

        if ($parentOnly) {
            $query->parentOnly();
        }

        if ($status) {
            $query->byStatus($status);
        }

        $orders = $query->orderByDesc('created_at')->paginate($perPage);

        return $this->paginatedResponse($orders);
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

        return $this->paginatedResponse($remittances);
    }

    /**
     * Audit courier remittance deposit receipt and clear courier debt.
     */
    public function approveRemittance(Request $request, string $id): JsonResponse
    {
        $remittance = CourierRemittance::with(['courier.courierProfile'])->findOrFail($id);

        $approved = $this->remittanceService->approveRemittance($remittance, $request->user());

        return $this->successResponse(
            $approved,
            "Remittance #{$approved->reference_number} approved and courier liability settled."
        );
    }

    /**
     * Financial analytics and reporting (Platform revenue, service fee income, escrow balance).
     */
    public function getFinancialReports(Request $request): JsonResponse
    {
        $platformEarningsWallet = Wallet::platformEarnings();
        $platformEscrowWallet = Wallet::platformEscrow();

        // Calculate service fee totals and order volume using enum scope
        $deliveredOrders = Order::subOrdersOnly()
            ->byStatus(OrderStatus::DELIVERED);

        $totalDeliveredSubOrders = $deliveredOrders->count();
        $totalGrossVolume = (float) $deliveredOrders->sum('total_amount');
        $totalServiceFees = (float) $deliveredOrders->sum('service_fee');
        $totalDeliveryFeesPaid = (float) $deliveredOrders->sum('delivery_fee');

        return $this->successResponse([
            'platform_earnings_balance' => (float) $platformEarningsWallet->balance,
            'platform_escrow_balance' => (float) $platformEscrowWallet->balance,
            'total_delivered_sub_orders' => $totalDeliveredSubOrders,
            'total_gross_merchandise_value' => $totalGrossVolume,
            'total_service_fee_revenue' => $totalServiceFees,
            'total_courier_delivery_payouts' => $totalDeliveryFeesPaid,
        ]);
    }

    /**
     * Comprehensive dashboard overview metrics and statistics.
     */
    public function getDashboardStats(Request $request): JsonResponse
    {
        $platformEarningsWallet = Wallet::platformEarnings();
        $platformEscrowWallet = Wallet::platformEscrow();

        $totalUsers = User::count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalMerchants = Merchant::count();
        $pendingMerchants = Merchant::where('is_active', false)->count();
        $totalCouriers = CourierProfile::count();
        $pendingCouriers = CourierProfile::where('is_cod_suspended', true)->count();

        $totalOrders = Order::parentOnly()->count();
        $ordersPending = Order::parentOnly()->where('order_status', OrderStatus::PENDING)->count();
        $ordersInTransit = Order::parentOnly()->where('order_status', OrderStatus::IN_TRANSIT)->count();
        $ordersDelivered = Order::parentOnly()->where('order_status', OrderStatus::DELIVERED)->count();

        $totalProducts = Product::count();
        $lowStockProducts = Product::where('stock_quantity', '<=', 5)->count();

        $deliveredOrders = Order::subOrdersOnly()->where('order_status', OrderStatus::DELIVERED);
        $totalRevenue = (float) $deliveredOrders->sum('total_amount');
        $totalServiceFees = (float) $deliveredOrders->sum('service_fee');

        return $this->successResponse([
            'users' => [
                'total' => $totalUsers,
                'customers' => $totalCustomers,
                'merchants' => $totalMerchants,
                'pending_merchants' => $pendingMerchants,
                'couriers' => $totalCouriers,
                'pending_couriers' => $pendingCouriers,
            ],
            'orders' => [
                'total' => $totalOrders,
                'pending' => $ordersPending,
                'in_transit' => $ordersInTransit,
                'delivered' => $ordersDelivered,
            ],
            'inventory' => [
                'total_products' => $totalProducts,
                'low_stock_count' => $lowStockProducts,
            ],
            'financials' => [
                'gross_volume' => $totalRevenue,
                'service_revenue' => $totalServiceFees,
                'platform_earnings' => (float) $platformEarningsWallet->balance,
                'platform_escrow' => (float) $platformEscrowWallet->balance,
            ],
        ]);
    }

    /**
     * User management: list and search system users.
     */
    public function getUsers(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $users = $query->latest()->paginate($request->input('per_page', 20));

        return $this->paginatedResponse($users);
    }

    /**
     * Inventory / Catalog oversight across all merchants.
     */
    public function getProducts(Request $request): JsonResponse
    {
        $query = Product::with(['merchant.user']);

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%")
                    ->orWhere('oem_number', 'like', "%{$q}%");
            });
        }

        if ($request->filled('merchant_id')) {
            $query->where('merchant_id', $request->input('merchant_id'));
        }

        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $products = $query->latest()->paginate($request->input('per_page', 20));

        return $this->paginatedResponse($products);
    }

    /**
     * Toggle product active state.
     */
    public function toggleProductStatus(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => !$product->is_active]);

        return $this->successResponse(
            $product,
            $product->is_active ? 'Product is now active in catalog.' : 'Product deactivated from catalog.'
        );
    }

    /**
     * System activity logs: recent financial transactions and ledger audit entries.
     */
    public function getActivityLogs(Request $request): JsonResponse
    {
        $logs = LedgerEntry::with(['wallet.holder', 'order'])
            ->latest()
            ->paginate($request->input('per_page', 25));

        return $this->paginatedResponse($logs);
    }
}
