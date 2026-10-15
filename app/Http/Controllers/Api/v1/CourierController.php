<?php

namespace App\Http\Controllers\Api\v1;

use App\Enums\OrderStatus;
use App\Enums\PaymentType;
use App\Events\CourierLocationUpdatedEvent;
use App\Events\OrderStatusUpdatedEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Courier\CreateRemittanceRequest;
use App\Http\Requests\Courier\UpdateLocationRequest;
use App\Http\Requests\Courier\VerifyOtpRequest;
use App\Models\Order;
use App\Services\CourierTrackingService;
use App\Services\OrderAccountingService;
use App\Services\RemittanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CourierController extends Controller
{
    protected CourierTrackingService $trackingService;
    protected OrderAccountingService $accountingService;
    protected RemittanceService $remittanceService;

    public function __construct(
        CourierTrackingService $trackingService,
        OrderAccountingService $accountingService,
        RemittanceService $remittanceService
    ) {
        $this->trackingService = $trackingService;
        $this->accountingService = $accountingService;
        $this->remittanceService = $remittanceService;
    }

    /**
     * Ping live GPS coordinates to Redis and database.
     */
    public function updateLocation(UpdateLocationRequest $request): JsonResponse
    {
        $courier = $request->user()->courierProfile;

        if (! $courier) {
            return response()->json([
                'success' => false,
                'message' => 'Courier profile not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $lat = (float) $request->input('latitude');
        $lng = (float) $request->input('longitude');

        $this->trackingService->updateLocation($courier, $lat, $lng);

        // If courier is delivering an active order, broadcast live movement event
        $activeOrder = Order::where('courier_id', $courier->id)
            ->where('order_status', OrderStatus::IN_TRANSIT)
            ->first();

        if ($activeOrder) {
            event(new CourierLocationUpdatedEvent($activeOrder->id, $courier->id, $lat, $lng));
        }

        return response()->json([
            'success' => true,
            'message' => 'Coordinates updated.',
        ]);
    }

    /**
     * Toggle courier online/offline dispatch readiness state.
     */
    public function toggleStatus(Request $request): JsonResponse
    {
        $courier = $request->user()->courierProfile;

        $newState = $request->has('is_online')
            ? (bool) $request->input('is_online')
            : ! $courier->is_online;

        $courier->update(['is_online' => $newState]);

        if (! $newState) {
            $this->trackingService->removeLocation($courier->id);
        }

        return response()->json([
            'success' => true,
            'message' => $newState ? 'Courier is now online.' : 'Courier is now offline.',
            'data' => [
                'is_online' => $courier->is_online,
            ],
        ]);
    }

    /**
     * Get available dispatched offers and active deliveries for this courier.
     */
    public function getOrders(Request $request): JsonResponse
    {
        $courier = $request->user()->courierProfile;

        if (! $courier) {
            return response()->json([
                'success' => false,
                'message' => 'Courier profile not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        // 1. Active delivery assigned to this courier (assigned_to_courier or in_transit)
        $activeOrder = Order::with(['merchant', 'customer', 'items.product'])
            ->where('courier_id', $courier->id)
            ->whereIn('order_status', [OrderStatus::ASSIGNED_TO_COURIER, OrderStatus::IN_TRANSIT])
            ->latest()
            ->first();

        // 2. Available dispatched offers ready for pickup or awaiting courier assignment
        $availableOffers = Order::subOrdersOnly()
            ->with(['merchant', 'customer', 'items.product'])
            ->whereNull('courier_id')
            ->whereIn('order_status', [OrderStatus::READY_FOR_PICKUP, OrderStatus::PREPARING, OrderStatus::PENDING])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'active_order' => $activeOrder,
                'available_offers' => $availableOffers,
            ],
        ]);
    }

    /**
     * Accept a dispatched sub-order offer.
     */
    public function acceptOrder(Request $request, string $id): JsonResponse
    {
        $courier = $request->user()->courierProfile;

        return DB::transaction(function () use ($courier, $id) {
            /** @var Order $order */
            $order = Order::lockForUpdate()->findOrFail($id);

            if ($order->courier_id !== null) {
                return response()->json([
                    'success' => false,
                    'message' => 'This order has already been accepted by another courier.',
                ], Response::HTTP_CONFLICT);
            }

            if (! in_array($order->order_status, [OrderStatus::READY_FOR_PICKUP, OrderStatus::PENDING, OrderStatus::PREPARING])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is not available for assignment.',
                ], Response::HTTP_BAD_REQUEST);
            }

            // Enforce COD limit check
            if ($order->payment_type === PaymentType::COD && ! $courier->canAcceptCod((float) $order->total_amount)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot accept COD order: COD limit exceeded or account is suspended.',
                ], Response::HTTP_FORBIDDEN);
            }

            $previousStatus = $order->order_status->value;

            // Assign courier & transition status
            $order->courier_id = $courier->id;
            $order->order_status = OrderStatus::ASSIGNED_TO_COURIER;
            $order->save();

            event(new OrderStatusUpdatedEvent($order, $previousStatus, OrderStatus::ASSIGNED_TO_COURIER->value));

            return response()->json([
                'success' => true,
                'message' => 'Order offer accepted.',
                'data' => $order->load(['merchant', 'customer', 'items.product']),
            ]);
        });
    }

    /**
     * Confirm pickup from merchant counter.
     */
    public function pickupOrder(Request $request, string $id): JsonResponse
    {
        $courier = $request->user()->courierProfile;
        $order = Order::where('courier_id', $courier->id)->findOrFail($id);

        $courierPaidCash = (bool) $request->input('courier_paid_merchant_cash', false);
        $previousStatus = $order->order_status->value;

        $order->transitionTo(OrderStatus::IN_TRANSIT);
        if ($courierPaidCash) {
            $order->update(['courier_paid_merchant_cash' => true]);
        }

        event(new OrderStatusUpdatedEvent($order, $previousStatus, OrderStatus::IN_TRANSIT->value));

        return response()->json([
            'success' => true,
            'message' => 'Order picked up and is in transit.',
            'data' => $order,
        ]);
    }

    /**
     * Verify customer OTP upon delivery, complete order, and trigger double-entry financial settlement.
     */
    public function verifyOtp(VerifyOtpRequest $request, string $id): JsonResponse
    {
        $courier = $request->user()->courierProfile;
        $inputOtp = $request->input('otp');

        return DB::transaction(function () use ($courier, $id, $inputOtp) {
            /** @var Order $order */
            $order = Order::with(['merchant', 'courier.user'])
                ->where('courier_id', $courier->id)
                ->lockForUpdate()
                ->findOrFail($id);

            if (trim($order->delivery_otp) !== trim($inputOtp)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid delivery OTP. Please verify with the customer.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $previousStatus = $order->order_status->value;

            // 1. Mark order delivered
            $order->transitionTo(OrderStatus::DELIVERED);

            // 2. Trigger double-entry financial settlement based on payment type
            if ($order->payment_type === PaymentType::CARD) {
                $this->accountingService->settleOnlineOrder($order);
            } elseif ($order->payment_type === PaymentType::COD) {
                if ($order->courier_paid_merchant_cash) {
                    $this->accountingService->settleCodPaidByCourierOrder($order);
                } else {
                    $this->accountingService->settleCodStandardOrder($order);
                }
            }

            event(new OrderStatusUpdatedEvent($order, $previousStatus, OrderStatus::DELIVERED->value));

            return response()->json([
                'success' => true,
                'message' => 'Delivery verified successfully and payment settled.',
                'data' => $order->fresh(),
            ]);
        });
    }

    /**
     * Submit a cash clearance remittance receipt.
     */
    public function submitRemittance(CreateRemittanceRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $receiptPath = null;
        if ($request->hasFile('proof_receipt')) {
            $receiptPath = $request->file('proof_receipt')->store('remittances', 'public');
        }

        $remittance = $this->remittanceService->createRemittance(
            $user,
            (float) $validated['amount'],
            $validated['method'],
            $receiptPath
        );

        return response()->json([
            'success' => true,
            'message' => 'Remittance receipt submitted for admin verification.',
            'data' => $remittance,
        ], Response::HTTP_CREATED);
    }

    /**
     * View courier wallet balance, cash in hand, COD limit, and earnings history.
     */
    public function getWallet(Request $request): JsonResponse
    {
        $courier = $request->user()->courierProfile;
        $wallet = $courier->getWallet();

        $entries = $wallet->ledgerEntries()
            ->with('transaction')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'wallet_id' => $wallet->id,
                'balance' => (float) $wallet->balance,
                'collected_cash_in_hand' => (float) $courier->collected_cash_in_hand,
                'max_cod_limit' => (float) $courier->max_cod_limit,
                'is_cod_suspended' => $courier->is_cod_suspended,
                'currency' => $wallet->currency,
                'statement' => $entries->items(),
                'meta' => [
                    'current_page' => $entries->currentPage(),
                    'last_page' => $entries->lastPage(),
                    'total' => $entries->total(),
                ],
            ],
        ]);
    }
}
