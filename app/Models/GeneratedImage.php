<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeneratedImage extends Model
{
    protected $fillable = [
        'user_id',
        'prompt',
        'negative_prompt',
        'image_path',
        'image_url',
        'provider',
        'model',
        'status',
        'width',
        'height',
        'seed',
        'error_message',
        'quota_refunded',
        'metadata',
        'started_at',
        'completed_at',
        'failed_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'quota_refunded' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
