<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'user_name', 'user_email', 'items',
        'subtotal', 'discount', 'total', 'status', 'payment',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'payment' => 'array',
            'subtotal' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
