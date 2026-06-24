<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\FAQ;
use App\Models\Page;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        User::create([
            'id' => 1,
            'name' => 'Admin',
            'email' => 'admin@demo.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'active',
            'verified' => true,
        ]);

        User::create([
            'id' => 2,
            'name' => 'Jane Customer',
            'email' => 'jane@demo.com',
            'password' => Hash::make('jane1234'),
            'role' => 'customer',
            'status' => 'active',
            'verified' => false,
        ]);

        // Categories
        $categories = [
            ['id' => 1, 'name' => 'Templates', 'slug' => 'templates', 'icon' => '📄'],
            ['id' => 2, 'name' => 'Ebooks', 'slug' => 'ebooks', 'icon' => '📚'],
            ['id' => 3, 'name' => 'Software', 'slug' => 'software', 'icon' => '💻'],
            ['id' => 4, 'name' => 'Graphics', 'slug' => 'graphics', 'icon' => '🎨'],
            ['id' => 5, 'name' => 'Courses', 'slug' => 'courses', 'icon' => '🎓'],
        ];
        foreach ($categories as $c) {
            Category::create($c);
        }

        // Products
        Product::create([
            'id' => 1,
            'slug' => 'notion-productivity-os',
            'title' => 'Notion Productivity OS',
            'description' => 'All-in-one productivity workspace template for Notion. Includes tasks, projects, habits, journal, and weekly review dashboard.',
            'price' => 49.00,
            'sale_price' => 29.00,
            'category_id' => 1,
            'tags' => ['new', 'trending'],
            'image' => 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
            'file_url' => 'https://example.com/files/notion-os.zip',
            'variations' => [
                ['id' => 'v1', 'name' => 'Personal', 'price' => 29],
                ['id' => 'v2', 'name' => 'Team', 'price' => 79],
            ],
            'featured' => true,
            'new_release' => true,
            'best_seller' => true,
        ]);

        Product::create([
            'id' => 2,
            'slug' => 'ai-prompt-pack',
            'title' => 'Ultimate AI Prompt Pack',
            'description' => '1000+ curated prompts for marketing, sales, coding and creative writing across ChatGPT, Claude and Gemini.',
            'price' => 19.00,
            'category_id' => 2,
            'tags' => ['popular'],
            'image' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
            'file_url' => 'https://example.com/files/prompts.pdf',
            'variations' => [],
            'featured' => true,
            'best_seller' => true,
        ]);

        Product::create([
            'id' => 3,
            'slug' => 'indie-saas-starter',
            'title' => 'Indie SaaS Starter Kit',
            'description' => 'Production-ready Next.js + Stripe + Auth boilerplate to ship your SaaS in a weekend.',
            'price' => 99.00,
            'sale_price' => 69.00,
            'category_id' => 3,
            'tags' => ['premium'],
            'image' => 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800',
            'file_url' => 'https://example.com/files/saas-kit.zip',
            'variations' => [],
            'featured' => true,
            'new_release' => true,
        ]);

        Product::create([
            'id' => 4,
            'slug' => 'icon-pack-pro',
            'title' => 'Icon Pack Pro — 2000 Icons',
            'description' => '2000+ pixel-perfect SVG icons in 6 styles. Figma + sprite + React components.',
            'price' => 29.00,
            'category_id' => 4,
            'tags' => ['trending'],
            'image' => 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800',
            'file_url' => 'https://example.com/files/icons.zip',
            'variations' => [],
            'best_seller' => true,
        ]);

        Product::create([
            'id' => 5,
            'slug' => 'youtube-growth-course',
            'title' => 'YouTube Growth Course',
            'description' => '12-hour course on growing a YouTube channel from 0 to 100k subs. Lifetime updates.',
            'price' => 149.00,
            'sale_price' => 99.00,
            'category_id' => 5,
            'tags' => ['premium'],
            'image' => 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800',
            'file_url' => 'https://example.com/files/yt-course.zip',
            'variations' => [],
            'featured' => true,
        ]);

        Product::create([
            'id' => 6,
            'slug' => 'minimal-resume-templates',
            'title' => 'Minimal Resume Templates',
            'description' => '12 clean resume templates in Word, Pages, and Figma formats.',
            'price' => 15.00,
            'category_id' => 1,
            'tags' => ['starter'],
            'image' => 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
            'file_url' => 'https://example.com/files/resume.zip',
            'variations' => [],
            'new_release' => true,
        ]);

        // Coupons
        Coupon::create(['code' => 'WELCOME10', 'type' => 'percent', 'value' => 10, 'usage_limit' => 100, 'used_count' => 3]);
        Coupon::create(['code' => 'SAVE5', 'type' => 'fixed', 'value' => 5, 'used_count' => 0]);

        // Reviews
        Review::create(['product_id' => 1, 'user_id' => 2, 'user_name' => 'Jane C.', 'rating' => 5, 'text' => 'Game changer for my workflow!', 'approved' => true]);
        Review::create(['product_id' => 2, 'user_id' => 2, 'user_name' => 'Jane C.', 'rating' => 4, 'text' => 'Massive value for the price.', 'approved' => true]);

        // Blog Posts
        BlogPost::create([
            'slug' => 'selling-digital-products-2026',
            'title' => 'Selling Digital Products in 2026: What\'s Working',
            'excerpt' => 'The playbook for creators shipping templates, ebooks and SaaS in the AI era.',
            'content' => 'Long-form content here. Replace from the admin panel.',
            'cover' => 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200',
            'author' => 'Admin',
            'published_at' => now()->subDays(3),
        ]);

        BlogPost::create([
            'slug' => 'stripe-vs-crypto-payments',
            'title' => 'Stripe vs Crypto: Which Should You Offer?',
            'excerpt' => 'A practical comparison of cards and on-chain payments for digital sellers.',
            'content' => 'Long-form content here.',
            'cover' => 'https://images.unsplash.com/photo-1620266757065-5814239881fd?w=1200',
            'author' => 'Admin',
            'published_at' => now()->subDays(10),
        ]);

        // Testimonials
        Testimonial::create(['name' => 'Sarah K.', 'role' => 'Designer', 'text' => 'Best store I\'ve bought templates from. Instant delivery and great support.', 'rating' => 5]);
        Testimonial::create(['name' => 'Marcus D.', 'role' => 'Indie Hacker', 'text' => 'The SaaS Starter saved me weeks. Solid quality.', 'rating' => 5]);
        Testimonial::create(['name' => 'Priya R.', 'role' => 'Marketer', 'text' => 'The prompt pack pays for itself in one day.', 'rating' => 5]);

        // FAQs
        FAQ::create(['question' => 'How do I receive my purchase?', 'answer' => 'Instantly — your download link appears in your dashboard and is emailed to you after checkout.']);
        FAQ::create(['question' => 'Do you offer refunds?', 'answer' => 'Yes, within 7 days if the product doesn\'t match its description. See our Refund Policy.']);
        FAQ::create(['question' => 'Can I pay with crypto?', 'answer' => 'Yes, we accept multiple networks. Choose Crypto at checkout and submit your TXID.']);
        FAQ::create(['question' => 'Is there a license for commercial use?', 'answer' => 'Most products include a commercial license. Check the product page for specifics.']);

        // Pages
        Page::create(['key' => 'terms', 'content' => '# Terms & Conditions

By using this site you agree to our terms. Replace this content from the admin panel.']);
        Page::create(['key' => 'privacy', 'content' => '# Privacy Policy

We respect your privacy. Replace this content from the admin panel.']);
        Page::create(['key' => 'refund', 'content' => '# Refund & Return Policy

Digital products are refundable within 7 days. Replace this content from the admin panel.']);
        Page::create(['key' => 'about', 'content' => '# About Us

We\'re a small team building tools and templates for creators.']);
        Page::create(['key' => 'contact', 'content' => '# Contact Us

Email us at support@demo.com — we reply within 24 hours.']);

        // Settings
        Setting::create(['key' => 'brand', 'value' => [
            'name' => 'PixelMart',
            'metaTitle' => 'PixelMart — Premium Digital Products',
            'metaDesc' => 'Templates, ebooks, software and courses for creators and founders.',
        ]]);
        Setting::create(['key' => 'hero', 'value' => [
            'eyebrow' => 'Premium Digital Goods',
            'title' => 'Build faster with battle-tested digital products',
            'subtitle' => 'Templates, ebooks, software and courses crafted by working pros. Instant download, lifetime updates.',
            'ctaText' => 'Shop products',
        ]]);
        Setting::create(['key' => 'integrations', 'value' => []]);
        Setting::create(['key' => 'payments', 'value' => [
            'stripe' => ['enabled' => true, 'publishableKey' => '', 'secretKey' => ''],
            'crypto' => ['enabled' => true, 'networks' => [
                ['id' => 'n1', 'name' => 'USDT', 'chain' => 'TRC20', 'address' => 'TXxxxx...demoaddress'],
                ['id' => 'n2', 'name' => 'BTC', 'chain' => 'Bitcoin', 'address' => 'bc1qxxxx...demoaddress'],
                ['id' => 'n3', 'name' => 'ETH', 'chain' => 'ERC20', 'address' => '0xabcd...demoaddress'],
            ]],
        ]]);
    }
}
