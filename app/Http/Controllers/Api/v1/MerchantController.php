<?php

namespace App\Http\Controllers\Api\v1;

use App\Enums\OrderStatus;
use App\Events\OrderStatusUpdatedEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Merchant\CreateProductRequest;
use App\Http\Requests\Merchant\GetMerchantOrdersRequest;
use App\Http\Requests\Merchant\UpdateOrderStatusRequest;
use App\Http\Requests\Merchant\UpdateStockRequest;
use App\Jobs\DispatchOrderToCouriersJob;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class MerchantController extends Controller
{
    /**
     * Public directory of certified active merchants.
     */
    public function getPublicMerchants(Request $request): JsonResponse
    {
        $perPage = min((int) ($request->input('per_page', 12)), 50);

        $merchants = Merchant::query()
            ->where('is_active', true)
            ->withCount('products')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return $this->paginatedResponse($merchants);
    }

    /**
     * Upload a new automotive part product with dimensions and vehicle compatibility mappings.
     */
    public function createProduct(CreateProductRequest $request): JsonResponse
    {
        $merchant = $request->user()->merchant;

        if (! $merchant) {
            return $this->errorResponse('Merchant profile not found.', Response::HTTP_NOT_FOUND);
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

        return $this->successResponse(
            $product,
            'Product published successfully.',
            Response::HTTP_CREATED
        );
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

        return $this->successResponse($product, 'Stock updated successfully.');
    }

    /**
     * View store's incoming sub-orders with status filtering and pagination.
     */
    public function getOrders(GetMerchantOrdersRequest $request): JsonResponse
    {
        $merchant = $request->user()->merchant;
        $validated = $request->validated();
        $status = $validated['status'] ?? null;
        $perPage = min((int) ($validated['per_page'] ?? 15), 50);

        $query = Order::with(['items.product', 'customer', 'courier.user'])
            ->where('merchant_id', $merchant->id);

        if ($status) {
            $query->byStatus($status);
        }

        $orders = $query->orderByDesc('created_at')->paginate($perPage);

        return $this->paginatedResponse($orders);
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

        return $this->successResponse(
            $order,
            "Order transitioned to {$newStatus->label()}."
        );
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

        return $this->successResponse([
            'wallet_id' => $wallet->id,
            'balance' => (float) $wallet->balance,
            'currency' => $wallet->currency,
            'statement' => $entries->items(),
            'meta' => [
                'current_page' => $entries->currentPage(),
                'last_page' => $entries->lastPage(),
                'total' => $entries->total(),
            ],
        ]);
    }
}
