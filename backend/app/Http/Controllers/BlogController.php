<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;

class BlogController extends Controller
{
    public function index(): JsonResponse
    {
        $posts = BlogPost::orderByDesc('published_at')->get();
        return response()->json(['blog' => $posts]);
    }

    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::where('slug', $slug)->firstOrFail();
        return response()->json(['post' => $post]);
    }
}
