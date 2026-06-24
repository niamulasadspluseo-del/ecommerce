<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = ['name', 'role', 'text', 'avatar', 'rating'];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }
}
