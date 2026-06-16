<?php

namespace App\Services\Chat;

use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\User;
use App\Services\AI\GeminiService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * ChatService
 *
 * Service layer untuk mengelola semua operasi chat.
 * Bertanggung jawab atas:
 * - Membuat chat session
 * - Mengambil daftar chat session user
 * - Mengambil pesan dalam chat session
 * - Menyimpan pesan user dan memanggil GeminiService
 * - Menyimpan jawaban assistant
 * - Menghapus chat session
 * - Memastikan ownership user
 */
class ChatService
{
    public function __construct(
        protected GeminiService $geminiService
    ) {}

    /**
     * Membuat chat session baru untuk user.
     */
    public function createSession(User $user, ?string $title = null): ChatSession
    {
        return $user->chatSessions()->create([
            'title' => $title ?? 'Percakapan Baru',
        ]);
    }

    /**
     * Mengambil daftar chat session milik user dengan pagination.
     *
     * Mendukung:
     * - Pagination (per_page)
     * - Pencarian berdasarkan title (search)
     * - Urutan berdasarkan updated_at terbaru
     */
    public function getUserSessions(User $user, array $filters = []): LengthAwarePaginator
    {
        $perPage = $filters['per_page'] ?? 10;
        $search = $filters['search'] ?? null;

        $query = $user->chatSessions()
            ->withCount('messages')
            ->with('lastMessage')
            ->orderBy('chat_sessions.updated_at', 'desc');

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        return $query->paginate($perPage);
    }

    /**
     * Mengambil satu chat session milik user.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getSession(User $user, int $sessionId): ChatSession
    {
        return $user->chatSessions()->findOrFail($sessionId);
    }

    /**
     * Mengambil semua pesan dalam chat session milik user.
     * Diurutkan dari yang paling lama ke paling baru.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getSessionMessages(User $user, int $sessionId): Collection
    {
        $session = $user->chatSessions()->findOrFail($sessionId);

        return $session->messages()
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Mengirim pesan ke AI dan menyimpan hasilnya.
     *
     * Alur:
     * 1. Validasi ownership session
     * 2. Simpan pesan user ke database
     * 3. Auto-generate title jika masih default
     * 4. Kirim prompt ke GeminiService
     * 5. Simpan jawaban AI ke database
     * 6. Update timestamp session
     * 7. Return user_message dan assistant_message
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     * @throws \App\Exceptions\ExternalApiException
     */
    public function sendMessage(User $user, int $sessionId, string $message): array
    {
        $session = $user->chatSessions()->findOrFail($sessionId);

        // 1. Simpan pesan user
        $userMessage = $session->messages()->create([
            'role' => 'user',
            'content' => $message,
            'provider' => null,
            'model' => null,
        ]);

        // 2. Auto-generate title dari pesan pertama
        $this->autoGenerateTitle($session, $message);

        // 3. Ambil riwayat percakapan untuk konteks (ambil 20 pesan terakhir agar token tidak membengkak)
        $history = $session->messages()
            ->orderBy('created_at', 'desc')
            ->take(20) // Limit riwayat agar tidak terlalu besar (sesuaikan dengan kebutuhan)
            ->get(['role', 'content'])
            ->reverse()
            ->values()
            ->toArray();

        // 4. Panggil Gemini API melalui GeminiService dengan riwayat
        try {
            $aiResponse = $this->geminiService->generateChat($history);
        } catch (\Exception $e) {
            Log::error('Gemini generate failed after user message saved', [
                'user_id' => $user->id,
                'chat_session_id' => $session->id,
                'provider' => 'gemini',
                'model' => $this->geminiService->getModel(),
                'error_message' => $e->getMessage(),
                'timestamp' => now()->toISOString(),
            ]);

            throw $e;
        }

        // 4. Simpan jawaban AI
        $assistantMessage = $session->messages()->create([
            'role' => 'assistant',
            'content' => $aiResponse,
            'provider' => 'gemini',
            'model' => $this->geminiService->getModel(),
        ]);

        // 5. Update timestamp session
        $session->touch();

        return [
            'user_message' => $userMessage,
            'assistant_message' => $assistantMessage,
        ];
    }

    /**
     * Menghapus chat session milik user beserta seluruh pesannya.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function deleteSession(User $user, int $sessionId): void
    {
        $session = $user->chatSessions()->findOrFail($sessionId);
        $session->delete(); // cascade delete messages via FK
    }

    /**
     * Auto-generate title dari pesan pertama user.
     *
     * Jika chat session masih berjudul "Percakapan Baru",
     * ambil 50 karakter pertama dari pesan pertama sebagai title.
     */
    protected function autoGenerateTitle(ChatSession $session, string $message): void
    {
        if ($session->title !== 'Percakapan Baru') {
            return;
        }

        // Hanya ubah title pada pesan pertama
        if ($session->messages()->count() > 1) {
            return;
        }

        $title = Str::limit($message, 50, '...');
        $session->update(['title' => $title]);
    }
}
