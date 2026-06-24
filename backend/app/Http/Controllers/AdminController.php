<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Coupon;
use App\Models\FAQ;
use App\Models\Order;
use App\Models\Page;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    // ---- Products ----
    public function saveProduct(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => 'sometimes|exists:products,id',
            'title' => 'required|string',
            'slug' => 'nullable|string',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'sale_price' => 'nullable|numeric',
            'category_id' => 'required|exists:categories,id',
            'tags' => 'nullable|array',
            'image' => 'required|string',
            'gallery' => 'nullable|array',
            'file_url' => 'required|string',
            'variations' => 'nullable|array',
            'featured' => 'boolean',
            'new_release' => 'boolean',
            'best_seller' => 'boolean',
        ]);

        if (!isset($data['slug']) || !$data['slug']) {
            $data['slug'] = Str::slug($data['title']);
        }

        if (isset($data['id'])) {
            $product = Product::findOrFail($data['id']);
            $product->update($data);
        } else {
            $product = Product::create($data);
        }

        return response()->json(['product' => $product->fresh()->load('category')]);
    }

    public function deleteProduct(string $id): JsonResponse
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ---- Categories ----
    public function saveCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => 'sometimes|exists:categories,id',
            'name' => 'required|string',
            'slug' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        if (!isset($data['slug']) || !$data['slug']) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category = isset($data['id'])
            ? tap(Category::findOrFail($data['id']))->update($data)
            : Category::create($data);

        return response()->json(['category' => $category]);
    }

    public function deleteCategory(string $id): JsonResponse
    {
        Category::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function saveTags(Request $request): JsonResponse
    {
        // Tags are derived from products, but we keep a global list via settings
        return response()->json(['message' => 'OK']);
    }

    // ---- Coupons ----
    public function saveCoupon(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string',
            'type' => 'required|in:percent,fixed',
            'value' => 'required|numeric',
            'expires_at' => 'nullable|date',
            'usage_limit' => 'nullable|integer',
            'used_count' => 'integer',
        ]);

        $coupon = Coupon::updateOrCreate(
            ['code' => $data['code']],
            $data
        );

        return response()->json(['coupon' => $coupon]);
    }

    public function deleteCoupon(string $code): JsonResponse
    {
        Coupon::where('code', $code)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ---- Reviews ----
    public function saveReview(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => 'sometimes|exists:reviews,id',
            'product_id' => 'required|exists:products,id',
            'user_id' => 'required|exists:users,id',
            'user_name' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'text' => 'required|string',
            'approved' => 'boolean',
        ]);

        $review = isset($data['id'])
            ? tap(Review::findOrFail($data['id']))->update($data)
            : Review::create($data);

        return response()->json(['review' => $review]);
    }

    public function deleteReview(string $id): JsonResponse
    {
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function approveReview(string $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->update(['approved' => true]);
        return response()->json(['review' => $review]);
    }

    // ---- Blog ----
    public function saveBlog(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => 'sometimes|exists:blog_posts,id',
            'title' => 'required|string',
            'slug' => 'nullable|string',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'cover' => 'required|string',
            'author' => 'required|string',
            'published_at' => 'nullable|date',
        ]);

        if (!isset($data['slug']) || !$data['slug']) {
            $data['slug'] = Str::slug($data['title']);
        }
        if (!isset($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post = isset($data['id'])
            ? tap(BlogPost::findOrFail($data['id']))->update($data)
            : BlogPost::create($data);

        return response()->json(['post' => $post]);
    }

    public function deleteBlog(string $id): JsonResponse
    {
        BlogPost::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ---- Testimonials ----
    public function saveTestimonial(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => 'sometimes|exists:testimonials,id',
            'name' => 'required|string',
            'role' => 'required|string',
            'text' => 'required|string',
            'avatar' => 'nullable|string',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $testimonial = isset($data['id'])
            ? tap(Testimonial::findOrFail($data['id']))->update($data)
            : Testimonial::create($data);

        return response()->json(['testimonial' => $testimonial]);
    }

    public function deleteTestimonial(string $id): JsonResponse
    {
        Testimonial::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ---- FAQs ----
    public function saveFaq(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => 'sometimes|exists:faqs,id',
            'question' => 'required|string',
            'answer' => 'required|string',
        ]);

        $faq = isset($data['id'])
            ? tap(FAQ::findOrFail($data['id']))->update($data)
            : FAQ::create($data);

        return response()->json(['faq' => $faq]);
    }

    public function deleteFaq(string $id): JsonResponse
    {
        FAQ::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ---- Pages ----
    public function savePages(Request $request): JsonResponse
    {
        $data = $request->validate([
            'pages' => 'required|array',
            'pages.*.key' => 'required|string|in:terms,privacy,refund,about,contact',
            'pages.*.content' => 'required|string',
        ]);

        foreach ($data['pages'] as $page) {
            Page::updateOrCreate(['key' => $page['key']], ['content' => $page['content']]);
        }

        $pages = Page::all()->pluck('content', 'key')->toArray();
        return response()->json(['pages' => $pages]);
    }

    // ---- Users ----
    public function users(): JsonResponse
    {
        return response()->json(['users' => User::all()]);
    }

    public function saveUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => 'sometimes|exists:users,id',
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email,' . $request->id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:admin,customer',
            'status' => 'required|in:active,suspended,banned',
            'verified' => 'boolean',
            'billing' => 'nullable|array',
        ]);

        if (isset($data['id'])) {
            $user = User::findOrFail($data['id']);
            if (isset($data['password']) && $data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
            $user->update($data);
        } else {
            $data['password'] = Hash::make($data['password'] ?? 'password');
            $user = User::create($data);
        }

        return response()->json(['user' => $user->fresh()]);
    }

    public function deleteUser(string $id): JsonResponse
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function setUserStatus(Request $request, string $id): JsonResponse
    {
        $data = $request->validate(['status' => 'required|in:active,suspended,banned']);
        $user = User::findOrFail($id);
        $user->update(['status' => $data['status']]);
        return response()->json(['user' => $user]);
    }

    // ---- Orders ----
    public function orders(): JsonResponse
    {
        $orders = Order::with('user')->orderByDesc('created_at')->get();
        return response()->json(['orders' => $orders]);
    }

    public function setOrderStatus(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:Pending,In Progress,Ready For Delivery,Delivered,Refunded',
        ]);
        $order = Order::findOrFail($id);
        $order->update(['status' => $data['status']]);
        return response()->json(['order' => $order]);
    }

    // ---- Contact Messages ----
    public function messages(): JsonResponse
    {
        $messages = ContactMessage::orderByDesc('created_at')->get();
        return response()->json(['messages' => $messages]);
    }

    public function markMessageRead(Request $request, string $id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->update(['read' => $request->boolean('read', true)]);
        return response()->json(['message' => $message]);
    }

    public function deleteMessage(string $id): JsonResponse
    {
        ContactMessage::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ---- Settings ----
    public function saveSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'brand' => 'sometimes|array',
            'hero' => 'sometimes|array',
            'integrations' => 'sometimes|array',
            'payments' => 'sometimes|array',
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        $settings = Setting::all()->pluck('value', 'key')->toArray();
        return response()->json(['settings' => $settings]);
    }

    // ---- Data ----
    public function dashboard(): JsonResponse
    {
        $totalOrders = Order::count();
        $totalRevenue = Order::sum('total');
        $totalUsers = User::count();
        $totalProducts = Product::count();
        $recentOrders = Order::with('user')->orderByDesc('created_at')->take(5)->get();

        return response()->json([
            'totalOrders' => $totalOrders,
            'totalRevenue' => $totalRevenue,
            'totalUsers' => $totalUsers,
            'totalProducts' => $totalProducts,
            'recentOrders' => $recentOrders,
        ]);
    }
}
