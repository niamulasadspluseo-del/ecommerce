<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\FAQ;
use App\Models\Page;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;

class DataController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        $brand = $settings['brand'] ?? ['name' => 'PixelMart', 'metaTitle' => 'PixelMart — Premium Digital Products', 'metaDesc' => 'Templates, ebooks, software and courses for creators and founders.'];
        $hero = $settings['hero'] ?? ['eyebrow' => 'Premium Digital Goods', 'title' => 'Build faster with battle-tested digital products', 'subtitle' => 'Templates, ebooks, software and courses crafted by working pros.', 'ctaText' => 'Shop products'];
        $integrations = $settings['integrations'] ?? [];
        $payments = $settings['payments'] ?? [
            'stripe' => ['enabled' => true, 'publishableKey' => '', 'secretKey' => ''],
            'crypto' => ['enabled' => true, 'networks' => [
                ['id' => 'n1', 'name' => 'USDT', 'chain' => 'TRC20', 'address' => 'TXxxxx...demoaddress'],
                ['id' => 'n2', 'name' => 'BTC', 'chain' => 'Bitcoin', 'address' => 'bc1qxxxx...demoaddress'],
                ['id' => 'n3', 'name' => 'ETH', 'chain' => 'ERC20', 'address' => '0xabcd...demoaddress'],
            ]],
        ];

        $pages = Page::all()->pluck('content', 'key')->toArray();
        $defaultPages = [
            'terms' => '# Terms & Conditions',
            'privacy' => '# Privacy Policy',
            'refund' => '# Refund & Return Policy',
            'about' => '# About Us',
            'contact' => '# Contact Us',
        ];
        $pages = array_merge($defaultPages, $pages);

        return response()->json([
            'products' => Product::with('category')->get(),
            'categories' => Category::all(),
            'testimonials' => Testimonial::all(),
            'faqs' => FAQ::all(),
            'blog' => BlogPost::all(),
            'settings' => [
                'brand' => $brand,
                'hero' => $hero,
                'integrations' => $integrations,
                'payments' => $payments,
            ],
            'pages' => $pages,
        ]);
    }
}
