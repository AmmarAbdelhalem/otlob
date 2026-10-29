<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class OfferController extends Controller
{
    /**
     * Public endpoint to validate a promo code against a cart subtotal.
     */
    public function validateCoupon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $code = strtoupper(trim($validated['code']));
        $subtotal = (float) $validated['subtotal'];

        $offer = Offer::whereRaw('UPPER(code) = ?', [$code])->first();

        if (!$offer) {
            return $this->errorResponse(
                'Invalid promo code. Please verify the code and try again.',
                Response::HTTP_NOT_FOUND,
                ['code' => ['Promo code not found.']]
            );
        }

        $check = $offer->isValidForAmount($subtotal);
        if (!$check['valid']) {
            return $this->errorResponse($check['message'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $discountAmount = $offer->calculateDiscount($subtotal);
        $discountPct = $offer->discount_type === 'percentage'
            ? (float) $offer->discount_value
            : round(($discountAmount / max(1, $subtotal)) * 100, 1);

        return $this->successResponse([
            'code' => $offer->code,
            'title' => $offer->title,
            'discount_type' => $offer->discount_type,
            'discount_value' => (float) $offer->discount_value,
            'discount_amount' => $discountAmount,
            'discount_percentage' => $discountPct,
            'final_subtotal' => max(0, $subtotal - $discountAmount),
        ], 'Promo code applied successfully.');
    }

    /**
     * Admin: List all promotional offers and coupons.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Offer::query();

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('code', 'like', "%{$q}%")
                    ->orWhere('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('discount_type')) {
            $query->where('discount_type', $request->input('discount_type'));
        }

        $offers = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 15));

        return $this->paginatedResponse($offers);
    }

    /**
     * Admin: Create a new promotional offer.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:offers,code'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'discount_type' => ['required', Rule::in(['percentage', 'fixed'])],
            'discount_value' => ['required', 'numeric', 'min:0.01'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'is_coupon_only' => ['boolean'],
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $offer = Offer::create($validated);

        return $this->successResponse($offer, 'Promotional offer created successfully.', Response::HTTP_CREATED);
    }

    /**
     * Admin: Get details of a single offer.
     */
    public function show(string $id): JsonResponse
    {
        $offer = Offer::findOrFail($id);
        return $this->successResponse($offer);
    }

    /**
     * Admin: Update an existing promotional offer.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $offer = Offer::findOrFail($id);

        $validated = $request->validate([
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('offers', 'code')->ignore($offer->id)],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'discount_type' => ['sometimes', 'required', Rule::in(['percentage', 'fixed'])],
            'discount_value' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'is_coupon_only' => ['boolean'],
        ]);

        if (isset($validated['code'])) {
            $validated['code'] = strtoupper(trim($validated['code']));
        }

        $offer->update($validated);

        return $this->successResponse($offer, 'Promotional offer updated successfully.');
    }

    /**
     * Admin: Delete a promotional offer.
     */
    public function destroy(string $id): JsonResponse
    {
        $offer = Offer::findOrFail($id);
        $offer->delete();

        return $this->successResponse(null, 'Promotional offer deleted successfully.');
    }

    /**
     * Admin: Toggle active status of an offer.
     */
    public function toggleStatus(string $id): JsonResponse
    {
        $offer = Offer::findOrFail($id);
        $offer->update(['is_active' => !$offer->is_active]);

        return $this->successResponse(
            $offer,
            $offer->is_active ? 'Offer activated.' : 'Offer deactivated.'
        );
    }

    /**
     * Public endpoint to list active promotions, deals, and coupon codes.
     */
    public function getPublicOffers(Request $request): JsonResponse
    {
        $query = Offer::query()->where('is_active', true);

        if ($request->boolean('coupons_only') || $request->input('type') === 'coupon') {
            $query->where('is_coupon_only', true);
        }

        $offers = $query->orderByDesc('created_at')->get();

        return $this->successResponse($offers);
    }
}

