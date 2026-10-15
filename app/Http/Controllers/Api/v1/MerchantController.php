<?php

namespace App\Http\Controllers\Api\v1;

use App\Enums\OrderStatus;
use App\Events\OrderStatusUpdatedEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Merchant\CreateProductRequest;
use App\Http\Requests\Merchant\UpdateOrderStatusRequest;
use App\Http\Requests\Merchant\UpdateStockRequest;
use App\Jobs\DispatchOrderToCouriersJob;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class MerchantController extends Controller
{
    /**
     * Upload a new automotive part product with dimensions and vehicle compatibility mappings.
     */
    public function createProduct(CreateProductRequest $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        if (! $merchant) {
            return response()->json([
                'success' => false,
                'message' => 'Merchant profile not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validated();
        $compatibilities = $validated['compatibilities'] ?? [];
        unset($validated['compatibilities']);

        $product = DB::transaction(function () use ($merchant, $validated, $compatibilities) {
            /** @var Product $prod */
            $prod = $merchant->products()->create(array_merge($validated, [
                'is_active' => $validated['is_active'] ?? true,
            ]));

            if (! empty($compatibilities)) {
                $prod->compatibilities()->createMany($compatibilities);
            }

            return $prod->load('compatibilities');
        });

        return response()->json([
            'success' => true,
            'message' => 'Product published successfully.',
            'data' => $product,
        ], Response::HTTP_CREATED);
    }

    /**
     * Update product stock quantity.
     */
    public function updateStock(UpdateStockRequest $request, string $id): JsonResponse
    {
        $merchant = $request->user()->merchant;
        $product = $merchant->products()->findOrFail($id);

        $product->update([
            'stock_quantity' => $request->input('stock_quantity'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stock updated successfully.',
            'data' => $product,
        ]);
    }

    /**
     * View store's incoming sub-orders with status filtering and pagination.
     */
    public function getOrders(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;
        $status = $request->query('status');
        $perPage = min((int) $request->query('per_page', 15), 50);

        $query = Order::with(['items.product', 'customer', 'courier.user'])
            ->where('merchant_id', $merchant->id);

        if ($status) {
            $query->where('order_status', $status);
        }

        $orders = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Update sub-order fulfillment status (e.g. preparing, ready_for_pickup).
     */
    public function updateOrderStatus(UpdateOrderStatusRequest $request, string $id): JsonResponse
    {
        $merchant = $request->user()->merchant;
        $order = Order::where('merchant_id', $merchant->id)->findOrFail($id);

        $newStatus = OrderStatus::from($request->validated()['status']);
        $previousStatus = $order->order_status->value;

        // Transition through state machine validation
        $order->transitionTo($newStatus);

        // Broadcast WebSocket event
        event(new OrderStatusUpdatedEvent($order, $previousStatus, $newStatus->value));

        // When order becomes ready for pickup, trigger courier discovery dispatch
        if ($newStatus === OrderStatus::READY_FOR_PICKUP) {
            DispatchOrderToCouriersJob::dispatch($order);
        }

        return response()->json([
            'success' => true,
            'message' => "Order transitioned to {$newStatus->label()}.",
            'data' => $order,
        ]);
    }

    /**
     * View merchant wallet balance and ledger statement.
     */
    public function getWallet(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;
        $wallet = $merchant->getWallet();

        $entries = $wallet->ledgerEntries()
            ->with('transaction')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'wallet_id' => $wallet->id,
                'balance' => (float) $wallet->balance,
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
