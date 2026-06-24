<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DataController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;

// === Public ===
Route::get('data', [DataController::class, 'index']);

Route::get('products', [ShopController::class, 'products']);
Route::get('products/featured', [ShopController::class, 'featured']);
Route::get('products/{slug}', [ShopController::class, 'product']);
Route::get('categories', [ShopController::class, 'categories']);
Route::get('tags', [ShopController::class, 'tags']);

Route::get('blog', [BlogController::class, 'index']);
Route::get('blog/{slug}', [BlogController::class, 'show']);

Route::post('contact', [ContactController::class, 'submit']);

// === Auth ===
Route::post('auth/signup', [AuthController::class, 'signup']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/forgot', [AuthController::class, 'forgot']);

// === Authenticated ===
Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::put('auth/profile', [AuthController::class, 'updateProfile']);

    Route::get('cart', [CartController::class, 'index']);
    Route::post('cart/add', [CartController::class, 'add']);
    Route::post('cart/remove', [CartController::class, 'remove']);
    Route::post('cart/set-qty', [CartController::class, 'setQty']);
    Route::post('cart/clear', [CartController::class, 'clear']);
    Route::post('cart/coupon', [CartController::class, 'applyCoupon']);
    Route::delete('cart/coupon', [CartController::class, 'removeCoupon']);

    Route::post('orders', [OrderController::class, 'create']);
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/delivered', [OrderController::class, 'delivered']);
    Route::get('orders/{id}', [OrderController::class, 'show']);

    // === Admin ===
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('dashboard', [AdminController::class, 'dashboard']);

        Route::post('products', [AdminController::class, 'saveProduct']);
        Route::delete('products/{id}', [AdminController::class, 'deleteProduct']);

        Route::post('categories', [AdminController::class, 'saveCategory']);
        Route::delete('categories/{id}', [AdminController::class, 'deleteCategory']);
        Route::post('tags', [AdminController::class, 'saveTags']);

        Route::post('coupons', [AdminController::class, 'saveCoupon']);
        Route::delete('coupons/{code}', [AdminController::class, 'deleteCoupon']);

        Route::post('reviews', [AdminController::class, 'saveReview']);
        Route::delete('reviews/{id}', [AdminController::class, 'deleteReview']);
        Route::post('reviews/{id}/approve', [AdminController::class, 'approveReview']);

        Route::post('blog', [AdminController::class, 'saveBlog']);
        Route::delete('blog/{id}', [AdminController::class, 'deleteBlog']);

        Route::post('testimonials', [AdminController::class, 'saveTestimonial']);
        Route::delete('testimonials/{id}', [AdminController::class, 'deleteTestimonial']);

        Route::post('faqs', [AdminController::class, 'saveFaq']);
        Route::delete('faqs/{id}', [AdminController::class, 'deleteFaq']);

        Route::post('pages', [AdminController::class, 'savePages']);

        Route::get('users', [AdminController::class, 'users']);
        Route::post('users', [AdminController::class, 'saveUser']);
        Route::delete('users/{id}', [AdminController::class, 'deleteUser']);
        Route::put('users/{id}/status', [AdminController::class, 'setUserStatus']);

        Route::get('orders', [AdminController::class, 'orders']);
        Route::put('orders/{id}/status', [AdminController::class, 'setOrderStatus']);

        Route::get('messages', [AdminController::class, 'messages']);
        Route::put('messages/{id}/read', [AdminController::class, 'markMessageRead']);
        Route::delete('messages/{id}', [AdminController::class, 'deleteMessage']);

        Route::post('settings', [AdminController::class, 'saveSettings']);
    });
});
