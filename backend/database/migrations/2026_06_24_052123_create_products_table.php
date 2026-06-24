<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->json('tags')->nullable();
            $table->string('image');
            $table->json('gallery')->nullable();
            $table->string('file_url');
            $table->json('variations')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('new_release')->default(false);
            $table->boolean('best_seller')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
