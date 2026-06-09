<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Chat\StoreChatSessionRequest;
use App\Services\Chat\ChatService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * ChatSessionController
 *
 * Controller untuk mengelola chat session (sesi percakapan).
 * Controller ini hanya mendelegasikan ke ChatService.
 *
 * Endpoints:
 * - POST   /api/v1/chat-sessions       → store (buat session baru)
 * - GET    /api/v1/chat-sessions       → index (daftar session)
 * - GET    /api/v1/chat-sessions/{id}  → show (detail session)
 * - DELETE /api/v1/chat-sessions/{id}  → destroy (hapus session)
 */
class ChatSessionController extends Controller
{
    public function __construct(
        protected ChatService $chatService
    ) {}

    /**
     * Menampilkan daftar chat session milik user.
     *
     * Query params:
     * - page: nomor halaman (default: 1)
     * - per_page: jumlah per halaman (default: 10)
     * - search: pencarian berdasarkan title
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['per_page', 'search']);

        $sessions = $this->chatService->getUserSessions(
            $request->user(),
            $filters
        );

        // Transform data untuk response sesuai PRD contract
        $data = collect($sessions->items())->map(function ($session) {
            return [
                'id' => $session->id,
                'title' => $session->title,
                'last_message' => $session->lastMessage?->content
                    ? Str::limit($session->lastMessage->content, 100)
                    : null,
                'messages_count' => $session->messages_count,
                'updated_at' => $session->updated_at->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar chat session berhasil diambil.',
            'data' => $data,
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
            ],
        ]);
    }

    /**
     * Membuat chat session baru.
     */
    public function store(StoreChatSessionRequest $request): JsonResponse
    {
        $session = $this->chatService->createSession(
            $request->user(),
            $request->validated('title')
        );

        return ApiResponse::created([
            'id' => $session->id,
            'title' => $session->title,
            'created_at' => $session->created_at->toISOString(),
        ], 'Chat session berhasil dibuat.');
    }

    /**
     * Menampilkan detail satu chat session.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $session = $this->chatService->getSession($request->user(), $id);

        return ApiResponse::success([
            'id' => $session->id,
            'title' => $session->title,
            'created_at' => $session->created_at->toISOString(),
            'updated_at' => $session->updated_at->toISOString(),
        ], 'Detail chat session berhasil diambil.');
    }

    /**
     * Menghapus chat session beserta seluruh pesannya.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->chatService->deleteSession($request->user(), $id);

        return ApiResponse::success(null, 'Chat session berhasil dihapus.');
    }
}
