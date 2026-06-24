<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Order;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private CartService $cartService,
    ) {}

    public function create(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'payment.method' => 'required|in:stripe,crypto',
            'payment.txid' => 'nullable|string',
            'payment.network' => 'nullable|string',
            'payment.cardLast4' => 'nullable|string',
        ]);

        $cartItems = CartItem::with('product')->where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 422);
        }

        $couponCode = $user->cart_coupon_code;
        $coupon = $couponCode ? Coupon::where('code', $couponCode)->first() : null;
        $totals = $this->cartService->calculateTotals($cartItems, $coupon);

        $orderItems = $cartItems->map(function ($ci) {
            $product = $ci->product;
            $variations = $product->variations ?? [];
            $variation = collect($variations)->firstWhere('id', $ci->variation_id);
            $price = $variation['price'] ?? ($product->sale_price ?? $product->price);
            return [
                'productId' => $product->id,
                'title' => $product->title,
                'price' => (float) $price,
                'qty' => $ci->qty,
                'variationName' => $variation['name'] ?? null,
                'fileUrl' => $product->file_url,
            ];
        })->toArray();

        $order = Order::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'items' => $orderItems,
            'subtotal' => $totals['subtotal'],
            'discount' => $totals['discount'],
            'total' => $totals['total'],
            'status' => 'Pending',
            'payment' => $data['payment'],
        ]);

        if ($coupon) {
            $coupon->increment('used_count');
        }

        CartItem::where('user_id', $user->id)->delete();
        $user->update(['cart_coupon_code' => null]);

        return response()->json(['order' => $order], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['orders' => $orders]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();
        return response()->json(['order' => $order]);
    }

    public function delivered(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->where('status', 'Delivered')
            ->get();
        return response()->json(['orders' => $orders]);
    }
}
