<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'slug', 'title', 'description', 'price', 'sale_price',
        'category_id', 'tags', 'image', 'gallery', 'file_url',
        'variations', 'featured', 'new_release', 'best_seller',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'tags' => 'array',
            'gallery' => 'array',
            'variations' => 'array',
            'featured' => 'boolean',
            'new_release' => 'boolean',
            'best_seller' => 'boolean',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
