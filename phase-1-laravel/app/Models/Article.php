<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'author',
        'published_at',
        'version',
    ];

    protected $casts = [
        'published_at' => 'date',
    ];
}
