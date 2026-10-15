<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;

class CargoCalculatorService
{
    /**
     * Calculate total volumetric size (m³) and total weight (kg) for a list of items or an order.
     *
     * @param iterable|Order $items Items can be an Order, a collection of OrderItem, or array of ['product' => Product, 'quantity' => int] or ['product_id' => string, 'quantity' => int]
     * @return array{total_weight_kg: float, total_volume_m3: float}
     */
    public function calculate(iterable|Order $items): array
    {
        if ($items instanceof Order) {
            $items = $items->items()->with('product')->get();
        }

        $totalWeightKg = 0.0;
        $totalVolumeM3 = 0.0;

        foreach ($items as $item) {
            $product = null;
            $quantity = 1;

            if ($item instanceof OrderItem) {
                $product = $item->product ?? Product::find($item->product_id);
                $quantity = (float) $item->quantity;
            } elseif (is_array($item)) {
                $quantity = (float) ($item['quantity'] ?? 1);
                if (isset($item['product']) && $item['product'] instanceof Product) {
                    $product = $item['product'];
                } elseif (isset($item['product_id'])) {
                    $product = Product::find($item['product_id']);
                }
            } elseif ($item instanceof Product) {
                $product = $item;
                $quantity = 1;
            }

            if (! $product) {
                continue;
            }

            $weight = (float) ($product->weight_kg ?? 0.0);
            $length = (float) ($product->length_cm ?? 0.0);
            $width  = (float) ($product->width_cm ?? 0.0);
            $height = (float) ($product->height_cm ?? 0.0);

            // Volume in cubic meters (1 m³ = 1,000,000 cm³)
            $unitVolumeM3 = ($length * $width * $height) / 1_000_000;

            $totalWeightKg += ($weight * $quantity);
            $totalVolumeM3 += ($unitVolumeM3 * $quantity);
        }

        return [
            'total_weight_kg' => round($totalWeightKg, 3),
            'total_volume_m3' => round($totalVolumeM3, 6),
        ];
    }
}
