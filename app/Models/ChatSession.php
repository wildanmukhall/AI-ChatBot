<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * ChatSession Model
 *
 * Merepresentasikan sesi percakapan antara user dan AI.
 *
 * Relasi:
 * - belongsTo User
 * - hasMany ChatMessage
 */
class ChatSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
    ];

    /**
     * User pemilik chat session ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Semua pesan dalam chat session ini.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    /**
     * Pesan terakhir dalam chat session ini.
     */
    public function lastMessage(): HasOne
    {
        return $this->hasOne(ChatMessage::class)->latestOfMany();
    }
}
