<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\StoreChatMessageRequest;
use App\Services\Chat\ChatService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ChatMessageController
 *
 * Controller untuk mengelola pesan dalam chat session.
 * Controller ini hanya mendelegasikan ke ChatService.
 *
 * Endpoints:
 * - GET  /api/v1/chat-sessions/{id}/messages  → index (daftar pesan)
 * - POST /api/v1/chat-sessions/{id}/messages  → store (kirim pesan + generate AI)
 */
class ChatMessageController extends Controller
{
    public function __construct(
        protected ChatService $chatService
    ) {}

    /**
     * Menampilkan semua pesan dalam chat session.
     * Diurutkan dari yang paling lama ke paling baru.
     */
    public function index(Request $request, int $chatSession): JsonResponse
    {
        $messages = $this->chatService->getSessionMessages(
            $request->user(),
            $chatSession
        );

        $data = $messages->map(function ($msg) {
            return [
                'id' => $msg->id,
                'role' => $msg->role,
                'content' => $msg->content,
                'provider' => $msg->provider,
                'model' => $msg->model,
                'created_at' => $msg->created_at->toISOString(),
            ];
        });

        return ApiResponse::success($data, 'Pesan chat berhasil diambil.');
    }

    /**
     * Mengirim pesan baru dan mendapatkan jawaban AI.
     *
     * Alur:
     * 1. Validasi input (StoreChatMessageRequest)
     * 2. ChatService menyimpan pesan user
     * 3. ChatService memanggil GeminiService
     * 4. ChatService menyimpan jawaban AI
     * 5. Return kedua pesan
     */
    public function store(StoreChatMessageRequest $request, int $chatSession): JsonResponse
    {
        $result = $this->chatService->sendMessage(
            $request->user(),
            $chatSession,
            $request->validated('message')
        );

        $userMsg = $result['user_message'];
        $aiMsg = $result['assistant_message'];

        return ApiResponse::success([
            'user_message' => [
                'id' => $userMsg->id,
                'role' => $userMsg->role,
                'content' => $userMsg->content,
                'created_at' => $userMsg->created_at->toISOString(),
            ],
            'assistant_message' => [
                'id' => $aiMsg->id,
                'role' => $aiMsg->role,
                'content' => $aiMsg->content,
                'provider' => $aiMsg->provider,
                'model' => $aiMsg->model,
                'created_at' => $aiMsg->created_at->toISOString(),
            ],
        ], 'Pesan berhasil diproses.');
    }
}
