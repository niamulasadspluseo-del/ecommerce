<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function products(Request $request): JsonResponse
    {
        $query = Product::with('category');

        if ($request->category) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        if ($request->search) {
            $q = $request->search;
            $query->where(function ($b) use ($q) {
                $b->where('title', 'like', "%{$q}%")
                  ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if ($request->tag) {
            $query->whereJsonContains('tags', $request->tag);
        }

        if ($request->sort === 'price_asc') $query->orderBy('price');
        elseif ($request->sort === 'price_desc') $query->orderByDesc('price');
        else $query->orderByDesc('created_at');

        $products = $query->get();

        return response()->json(['products' => $products]);
    }

    public function product(string $slug): JsonResponse
    {
        $product = Product::with('category', 'reviews')->where('slug', $slug)->firstOrFail();
        return response()->json(['product' => $product]);
    }

    public function categories(): JsonResponse
    {
        return response()->json(['categories' => Category::all()]);
    }

    public function tags(): JsonResponse
    {
        $tags = Product::pluck('tags')->flatten()->unique()->sort()->values();
        return response()->json(['tags' => $tags]);
    }

    public function featured(): JsonResponse
    {
        $products = Product::with('category')->where('featured', true)->get();
        return response()->json(['products' => $products]);
    }
}
