<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CartController extends Controller
{
    /**
     * Get the authenticated user's active shopping cart with product items and merchant relations.
     */
    public function getCart(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['id' => (string) Str::uuid()]
        );

        $items = $cart->items()
            ->with(['product.merchant', 'product.compatibilities'])
            ->get();

        return $this->successResponse([
            'id' => $cart->id,
            'coupon_code' => $cart->coupon_code,
            'items' => $items,
        ]);
    }

    /**
     * Sync/merge client-side guest cart items into the authenticated user's database cart upon login.
     */
    public function syncCart(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.product_id' => ['required', 'uuid', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:50'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
        ]);

        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['id' => (string) Str::uuid()]
        );

        if (!empty($validated['coupon_code'])) {
            $cart->update(['coupon_code' => $validated['coupon_code']]);
        }

        foreach ($validated['items'] as $itemData) {
            $existing = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $itemData['product_id'])
                ->first();

            if ($existing) {
                $existing->update([
                    'quantity' => max($existing->quantity, $itemData['quantity']),
                ]);
            } else {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                ]);
            }
        }

        return $this->getCart($request);
    }

    /**
     * Add or increment product in cart.
     */
    public function addItem(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['id' => (string) Str::uuid()]
        );

        $quantity = $validated['quantity'] ?? 1;

        $item = CartItem::firstOrNew([
            'cart_id' => $cart->id,
            'product_id' => $validated['product_id'],
        ]);

        $item->quantity = $item->exists ? ($item->quantity + $quantity) : $quantity;
        $item->save();

        return $this->getCart($request);
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(Request $request, string $productId): JsonResponse
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if ($cart) {
            CartItem::where('cart_id', $cart->id)
                ->where('product_id', $productId)
                ->delete();
        }

        return $this->getCart($request);
    }

    /**
     * Clear entire cart.
     */
    public function clearCart(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();

        if ($cart) {
            $cart->items()->delete();
            $cart->update(['coupon_code' => null]);
        }

        return $this->successResponse(null, 'Cart cleared successfully.');
    }
}
