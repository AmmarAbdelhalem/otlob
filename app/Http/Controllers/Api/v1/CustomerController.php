<?php

namespace App\Http\Controllers\Api\v1;

use App\Enums\PaymentType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\AddVehicleRequest;
use App\Http\Requests\Customer\CheckoutRequest;
use App\Http\Requests\Customer\SearchProductsRequest;
use App\Jobs\DispatchOrderToCouriersJob;
use App\Jobs\SendSmsOtpJob;
use App\Models\CustomerVehicle;
use App\Models\Order;
use App\Models\Product;
use App\Services\CheckoutService;
use App\Services\CourierTrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class CustomerController extends Controller
{
    protected CheckoutService $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    /**
     * List vehicles registered in customer's garage.
     */
    public function getVehicles(Request $request): JsonResponse
    {
        $vehicles = $request->user()->vehicles()->orderByDesc('is_default')->get();

        return $this->successResponse($vehicles);
    }

    /**
     * Add a vehicle to customer's garage.
     */
    public function addVehicle(AddVehicleRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if (! empty($validated['is_default'])) {
            $user->vehicles()->update(['is_default' => false]);
        }

        $vehicle = $user->vehicles()->create($validated);

        return $this->successResponse(
            $vehicle,
            'Vehicle added to garage.',
            Response::HTTP_CREATED
        );
    }

    /**
     * High-scale product search with Redis caching, vehicle fitment filters, OEM/SKU lookup, and pagination.
     */
    public function searchProducts(SearchProductsRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $make = $validated['make'] ?? null;
        $model = $validated['model'] ?? null;
        $year = isset($validated['year']) && $validated['year'] > 0 ? (int) $validated['year'] : null;
        $condition = $validated['condition'] ?? null;
        $minPrice = isset($validated['min_price']) ? (float) $validated['min_price'] : null;
        $maxPrice = isset($validated['max_price']) ? (float) $validated['max_price'] : null;
        $sortBy = $validated['sort_by'] ?? 'popularity';
        $oem = $validated['oem_number'] ?? null;
        $sku = $validated['sku'] ?? null;
        $keyword = $validated['q'] ?? null;
        $page = (int) ($validated['page'] ?? 1);
        $perPage = min((int) ($validated['per_page'] ?? 15), 50);

        // Build unique cache key for high-throughput scaling (+5M users)
        $cacheKey = 'products:search:' . md5(json_encode([
            'make' => $make,
            'model' => $model,
            'year' => $year,
            'condition' => $condition,
            'min_price' => $minPrice,
            'max_price' => $maxPrice,
            'sort_by' => $sortBy,
            'oem' => $oem,
            'sku' => $sku,
            'keyword' => $keyword,
            'page' => $page,
            'per_page' => $perPage,
        ]));

        $results = Cache::remember($cacheKey, now()->addMinutes(3), function () use (
            $make,
            $model,
            $year,
            $condition,
            $minPrice,
            $maxPrice,
            $sortBy,
            $oem,
            $sku,
            $keyword,
            $perPage
        ) {
            $query = Product::with(['compatibilities', 'merchant'])
                ->active();

            // Vehicle Fitment Search
            if ($make || $model || $year) {
                $query->compatibleWithVehicle($make, $model, $year);
            }

            // Part Condition Filter
            if ($condition) {
                $query->where('condition', $condition);
            }

            // Price Range Boundaries
            if ($minPrice !== null) {
                $query->where('price', '>=', $minPrice);
            }
            if ($maxPrice !== null) {
                $query->where('price', '<=', $maxPrice);
            }

            if ($oem) {
                $query->byOemNumber($oem);
            }

            if ($sku) {
                $query->where('sku', $sku);
            }

            if ($keyword) {
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', "%{$keyword}%")
                      ->orWhere('description', 'like', "%{$keyword}%")
                      ->orWhere('sku', 'like', "%{$keyword}%")
                      ->orWhere('oem_number', 'like', "%{$keyword}%");
                });
            }

            // Sorting
            match ($sortBy) {
                'price-asc' => $query->orderBy('price', 'asc'),
                'price-desc' => $query->orderBy('price', 'desc'),
                'newest' => $query->orderByDesc('created_at'),
                default => $query->orderByDesc('stock_quantity'),
            };

            return $query->paginate($perPage);
        });

        return $this->paginatedResponse($results);
    }

    /**
     * Run multi-merchant split cart checkout.
     */
    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $order = $this->checkoutService->checkout(
            $user,
            $validated['items'],
            (float) $validated['delivery_lat'],
            (float) $validated['delivery_lng'],
            PaymentType::from($validated['payment_type'])
        );

        // Trigger SMS notification with OTPs and dispatch jobs for each sub-order
        foreach ($order->subOrders as $subOrder) {
            SendSmsOtpJob::dispatch($user->phone, $subOrder->delivery_otp, $subOrder->order_code);
            DispatchOrderToCouriersJob::dispatch($subOrder);
        }

        return $this->successResponse(
            $order,
            'Order placed successfully.',
            Response::HTTP_CREATED
        );
    }

    /**
     * List customer orders.
     */
    public function getOrders(Request $request): JsonResponse
    {
        $orders = Order::with(['subOrders.items.product', 'subOrders.merchant', 'subOrders.courier.user', 'items.product', 'merchant'])
            ->where('customer_id', $request->user()->id)
            ->parentOnly()
            ->orderByDesc('created_at')
            ->paginate(15);

        return $this->paginatedResponse($orders);
    }

    /**
     * Get order details and full breakdown (subtotal, shipping, service fees).
     */
    public function getOrderDetails(Request $request, string $id): JsonResponse
    {
        $order = Order::with(['subOrders.items.product', 'subOrders.merchant', 'subOrders.courier.user', 'items.product', 'merchant'])
            ->where('customer_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        return $this->successResponse($order);
    }

    /**
     * Real-time order tracking endpoint (fetches courier's live GPS from Redis).
     */
    public function trackOrder(Request $request, string $id): JsonResponse
    {
        $order = Order::with(['courier.user', 'merchant'])
            ->where('customer_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $liveCourierPosition = null;

        if ($order->courier_id) {
            try {
                // Redis GEOPOS lookup for live GPS coordinates
                $coords = Redis::geopos(CourierTrackingService::REDIS_GEO_KEY, $order->courier_id);
                if (! empty($coords) && ! empty($coords[0])) {
                    $liveCourierPosition = [
                        'longitude' => (float) $coords[0][0],
                        'latitude' => (float) $coords[0][1],
                    ];
                }
            } catch (Throwable $e) {
                // Fallback to database coordinates
                if ($order->courier?->current_lat && $order->courier?->current_lng) {
                    $liveCourierPosition = [
                        'latitude' => (float) $order->courier->current_lat,
                        'longitude' => (float) $order->courier->current_lng,
                    ];
                }
            }
        }

        return $this->successResponse([
            'order_code' => $order->order_code,
            'status' => $order->order_status->value,
            'status_label' => $order->order_status->label(),
            'courier' => $order->courier ? [
                'name' => $order->courier->user->name,
                'phone' => $order->courier->user->phone,
                'vehicle_type' => $order->courier->vehicle_type->value,
                'live_position' => $liveCourierPosition,
            ] : null,
            'pickup_location' => [
                'latitude' => (float) ($order->merchant?->latitude ?? 0),
                'longitude' => (float) ($order->merchant?->longitude ?? 0),
            ],
            'delivery_location' => [
                'latitude' => (float) $order->delivery_lat,
                'longitude' => (float) $order->delivery_lng,
            ],
        ]);
    }
}
