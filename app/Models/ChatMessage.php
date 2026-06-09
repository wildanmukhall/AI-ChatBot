<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ChatMessage Model
 *
 * Merepresentasikan satu pesan dalam chat session.
 *
 * Role:
 * - user: pesan dari pengguna
 * - assistant: jawaban dari AI
 * - system: pesan sistem (reserved)
 *
 * Relasi:
 * - belongsTo ChatSession
 */
class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_session_id',
        'role',
        'content',
        'provider',
        'model',
        'metadata',
    ];

    /**
     * Casting atribut.
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    /**
     * Chat session pemilik pesan ini.
     */
    public function chatSession(): BelongsTo
    {
        return $this->belongsTo(ChatSession::class);
    }
}
