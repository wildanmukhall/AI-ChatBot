<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: chat_messages
 *
 * Menyimpan pesan user dan jawaban AI dalam setiap chat session.
 * Kolom role menandakan pengirim: user, assistant, atau system.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_session_id')
                ->constrained('chat_sessions')
                ->cascadeOnDelete();
            $table->enum('role', ['user', 'assistant', 'system']);
            $table->text('content');
            $table->string('provider')->nullable();  // gemini, null untuk user
            $table->string('model')->nullable();       // model AI yang digunakan
            $table->json('metadata')->nullable();       // data tambahan opsional
            $table->timestamps();

            // Index untuk performa query
            $table->index('chat_session_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
