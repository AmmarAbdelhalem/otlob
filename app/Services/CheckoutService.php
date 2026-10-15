<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class CheckoutService
{
    protected DeliveryFeeService $deliveryFeeService;

    public function __construct(DeliveryFeeService $deliveryFeeService)
    {
        $this->deliveryFeeService = $deliveryFeeService;
    }

    /**
     * Process cart checkout with multi-merchant split orders and inventory safety locking.
     *
     * @param User|string $customer Customer model or customer UUID
     * @param array<array{product_id: string, quantity: int}> $cartItems
     * @param float $deliveryLat Customer drop-off latitude
     * @param float $deliveryLng Customer drop-off longitude
     * @param PaymentType $paymentType Payment type (COD, CARD, WALLET)
     * @param float $platformServiceFeeFixed Fixed service fee per sub-order (defaults to 15.00 EGP)
     * @return Order The created parent Order with loaded subOrders and items
     *
     * @throws InvalidArgumentException
     */
    public function checkout(
        User|string $customer,
        array $cartItems,
        float $deliveryLat,
        float $deliveryLng,
        PaymentType $paymentType = PaymentType::COD,
        float $platformServiceFeeFixed = 15.00
    ): Order {
        if (empty($cartItems)) {
            throw new InvalidArgumentException('Cart cannot be empty.');
        }

        $customerId = $customer instanceof User ? $customer->id : $customer;

        return DB::transaction(function () use (
            $customerId,
            $cartItems,
            $deliveryLat,
            $deliveryLng,
            $paymentType,
            $platformServiceFeeFixed
        ) {
            // 1. Collect and deduplicate product IDs
            $productQuantities = [];
            foreach ($cartItems as $item) {
                $pid = $item['product_id'];
                $qty = (int) ($item['quantity'] ?? 1);
                if ($qty <= 0) {
                    throw new InvalidArgumentException("Quantity for product [{$pid}] must be greater than zero.");
                }
                $productQuantities[$pid] = ($productQuantities[$pid] ?? 0) + $qty;
            }

            // 2. Lock items for update to prevent concurrent race conditions
            $products = Product::whereIn('id', array_keys($productQuantities))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // 3. Validate stock availability and active status
            foreach ($productQuantities as $productId => $quantity) {
                /** @var Product|null $product */
                $product = $products->get($productId);

                if (! $product) {
                    throw new InvalidArgumentException("Product with ID [{$productId}] was not found.");
                }

                if (! $product->is_active) {
                    throw new InvalidArgumentException("Product [{$product->name}] is currently inactive.");
                }

                if ($product->stock_quantity < $quantity) {
                    throw new InvalidArgumentException(
                        "Insufficient stock for product [{$product->name}]. Requested: {$quantity}, Available: {$product->stock_quantity}."
                    );
                }
            }

            // 4. Group products by merchant_id
            $merchantGroups = [];
            foreach ($productQuantities as $productId => $quantity) {
                /** @var Product $product */
                $product = $products->get($productId);
                $merchantGroups[$product->merchant_id][] = [
                    'product' => $product,
                    'quantity' => $quantity,
                ];
            }

            // 5. Pre-create Parent Order with initial zero totals
            $parentOrderCode = 'ORD-' . strtoupper(Str::random(10));
            $parentOrder = Order::create([
                'parent_id' => null,
                'order_code' => $parentOrderCode,
                'customer_id' => $customerId,
                'merchant_id' => null,
                'courier_id' => null,
                'subtotal' => 0.00,
                'delivery_fee' => 0.00,
                'service_fee' => 0.00,
                'total_amount' => 0.00,
                'payment_type' => $paymentType,
                'payment_status' => PaymentStatus::PENDING,
                'order_status' => OrderStatus::PENDING,
                'courier_paid_merchant_cash' => false,
                'delivery_lat' => $deliveryLat,
                'delivery_lng' => $deliveryLng,
                'delivery_otp' => str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT),
            ]);

            $parentSubtotal = 0.00;
            $parentDeliveryFee = 0.00;
            $parentServiceFee = 0.00;

            // 6. Process each merchant sub-order
            foreach ($merchantGroups as $merchantId => $items) {
                $merchant = Merchant::findOrFail($merchantId);

                // Calculate merchant delivery fee using Haversine
                $feeCalc = $this->deliveryFeeService->calculate(
                    (float) $merchant->latitude,
                    (float) $merchant->longitude,
                    $deliveryLat,
                    $deliveryLng
                );
                $subOrderDeliveryFee = $feeCalc['delivery_fee'];

                // Calculate subtotal for this merchant
                $subOrderSubtotal = 0.00;
                foreach ($items as $itemData) {
                    /** @var Product $prod */
                    $prod = $itemData['product'];
                    $qty = $itemData['quantity'];
                    $subOrderSubtotal += ((float) $prod->price * $qty);

                    // Safely decrement stock quantity
                    $prod->decrement('stock_quantity', $qty);
                }

                $subOrderServiceFee = $platformServiceFeeFixed;
                $subOrderTotal = round($subOrderSubtotal + $subOrderDeliveryFee + $subOrderServiceFee, 2);

                // Generate merchant sub-order with isolated OTP and unique code
                $subOrderOtp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
                $subOrderCode = $parentOrderCode . '-SUB-' . strtoupper(Str::random(6));

                $subOrder = Order::create([
                    'parent_id' => $parentOrder->id,
                    'order_code' => $subOrderCode,
                    'customer_id' => $customerId,
                    'merchant_id' => $merchantId,
                    'courier_id' => null,
                    'subtotal' => round($subOrderSubtotal, 2),
                    'delivery_fee' => round($subOrderDeliveryFee, 2),
                    'service_fee' => round($subOrderServiceFee, 2),
                    'total_amount' => $subOrderTotal,
                    'payment_type' => $paymentType,
                    'payment_status' => PaymentStatus::PENDING,
                    'order_status' => OrderStatus::PENDING,
                    'courier_paid_merchant_cash' => false,
                    'delivery_lat' => $deliveryLat,
                    'delivery_lng' => $deliveryLng,
                    'delivery_otp' => $subOrderOtp,
                ]);

                // Create OrderItem entries for sub-order
                foreach ($items as $itemData) {
                    /** @var Product $prod */
                    $prod = $itemData['product'];
                    $qty = $itemData['quantity'];
                    $unitPrice = (float) $prod->price;
                    $itemTotal = round($unitPrice * $qty, 2);

                    OrderItem::create([
                        'order_id' => $subOrder->id,
                        'product_id' => $prod->id,
                        'quantity' => $qty,
                        'unit_price' => $unitPrice,
                        'total_price' => $itemTotal,
                    ]);
                }

                $parentSubtotal += $subOrderSubtotal;
                $parentDeliveryFee += $subOrderDeliveryFee;
                $parentServiceFee += $subOrderServiceFee;
            }

            // 7. Update Parent Order with aggregated totals
            $parentOrder->update([
                'subtotal' => round($parentSubtotal, 2),
                'delivery_fee' => round($parentDeliveryFee, 2),
                'service_fee' => round($parentServiceFee, 2),
                'total_amount' => round($parentSubtotal + $parentDeliveryFee + $parentServiceFee, 2),
            ]);

            return $parentOrder->load(['subOrders.items.product', 'subOrders.merchant']);
        });
    }
}
