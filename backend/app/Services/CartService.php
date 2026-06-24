<?php

namespace App\Services;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Collection;

class CartService
{
    public function calculateTotals(Collection $items, ?Coupon $coupon = null): array
    {
        $itemDetails = $items->map(function ($ci) {
            $product = $ci->product;
            $variations = $product->variations ?? [];
            $variation = collect($variations)->firstWhere('id', $ci->variation_id);
            $price = $variation['price'] ?? ($product->sale_price ?? $product->price);
            return [
                'product' => $product,
                'variation' => $variation,
                'qty' => $ci->qty,
                'line' => (float) $price * $ci->qty,
                'unit' => (float) $price,
            ];
        });

        $subtotal = $itemDetails->sum('line');
        $discount = 0;

        if ($coupon) {
            $discount = $coupon->type === 'percent'
                ? $subtotal * ($coupon->value / 100)
                : min($subtotal, (float) $coupon->value);
        }

        return [
            'items' => $itemDetails,
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount, 2),
            'total' => round(max(0, $subtotal - $discount), 2),
        ];
    }
}
