<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = CartItem::with('product')
            ->where('user_id', $request->user()->id)
            ->get();

        $couponCode = $request->user()->cart_coupon_code;
        $coupon = $couponCode ? Coupon::where('code', $couponCode)->first() : null;

        $totals = $this->calculateTotals($items, $coupon);

        return response()->json([
            'items' => $items,
            'coupon_code' => $couponCode,
            'coupon' => $coupon,
            'totals' => $totals,
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variation_id' => 'nullable|string',
            'qty' => 'integer|min:1',
        ]);

        $qty = $data['qty'] ?? 1;
        $userId = $request->user()->id;

        $existing = CartItem::where('user_id', $userId)
            ->where('product_id', $data['product_id'])
            ->where('variation_id', $data['variation_id'])
            ->first();

        if ($existing) {
            $existing->increment('qty', $qty);
        } else {
            CartItem::create([
                'user_id' => $userId,
                'product_id' => $data['product_id'],
                'variation_id' => $data['variation_id'],
                'qty' => $qty,
            ]);
        }

        return $this->index($request);
    }

    public function remove(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|string',
            'variation_id' => 'nullable|string',
        ]);

        CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $data['product_id'])
            ->where('variation_id', $data['variation_id'])
            ->delete();

        return $this->index($request);
    }

    public function setQty(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|string',
            'variation_id' => 'nullable|string',
            'qty' => 'required|integer|min:1',
        ]);

        CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $data['product_id'])
            ->where('variation_id', $data['variation_id'])
            ->update(['qty' => $data['qty']]);

        return $this->index($request);
    }

    public function clear(Request $request): JsonResponse
    {
        CartItem::where('user_id', $request->user()->id)->delete();
        $request->user()->update(['cart_coupon_code' => null]);
        return $this->index($request);
    }

    public function applyCoupon(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => 'required|string']);
        $coupon = Coupon::where('code', $data['code'])->first();

        if (!$coupon) {
            return response()->json(['message' => 'Invalid coupon'], 422);
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return response()->json(['message' => 'Coupon expired'], 422);
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json(['message' => 'Coupon limit reached'], 422);
        }

        $request->user()->update(['cart_coupon_code' => $coupon->code]);

        return $this->index($request);
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        $request->user()->update(['cart_coupon_code' => null]);
        return $this->index($request);
    }

    private function calculateTotals($items, $coupon = null): array
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
                'line' => $price * $ci->qty,
                'unit' => (float) $price,
            ];
        });

        $subtotal = $itemDetails->sum('line');
        $discount = 0;

        if ($coupon) {
            $discount = $coupon->type === 'percent'
                ? $subtotal * ($coupon->value / 100)
                : min($subtotal, $coupon->value);
        }

        return [
            'items' => $itemDetails,
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount, 2),
            'total' => round(max(0, $subtotal - $discount), 2),
        ];
    }
}
