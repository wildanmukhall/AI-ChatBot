<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\ChatSessionController;
use App\Http\Controllers\Api\ChatMessageController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\Dev\GeminiTestController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Semua route API menggunakan prefix /api secara otomatis dari Laravel.
| Ditambahkan prefix v1 untuk versioning API.
|
| Struktur endpoint:
|   GET /api/v1/health  → Health check
|   GET /api/v1/status  → API version status
|
| Chat endpoints (authenticated):
|   POST   /api/v1/chat-sessions              → Buat chat session
|   GET    /api/v1/chat-sessions              → Daftar chat session
|   GET    /api/v1/chat-sessions/{id}         → Detail chat session
|   DELETE /api/v1/chat-sessions/{id}         → Hapus chat session
|   GET    /api/v1/chat-sessions/{id}/messages → Daftar pesan
|   POST   /api/v1/chat-sessions/{id}/messages → Kirim pesan + generate AI
|
*/

Route::middleware(['throttle:api'])->prefix('v1')->group(function () {

    /*
    |----------------------------------------------------------------------
    | Public Endpoints (tanpa autentikasi)
    |----------------------------------------------------------------------
    */

    // Health Check & Status
    Route::get('/health', [HealthCheckController::class, 'index'])
        ->name('api.health');

    Route::get('/status', [HealthCheckController::class, 'status'])
        ->name('api.status');

    /*
    |----------------------------------------------------------------------
    | Authenticated Endpoints (memerlukan autentikasi Sanctum)
    |----------------------------------------------------------------------
    */

    Route::middleware(['auth:sanctum'])->group(function () {

        // Chat Session CRUD
        Route::apiResource('chat-sessions', ChatSessionController::class)
            ->only(['index', 'store', 'show', 'destroy']);

        // Chat Messages (nested under chat-sessions)
        Route::get('chat-sessions/{chatSession}/messages', [ChatMessageController::class, 'index'])
            ->name('chat-sessions.messages.index');

        Route::post('chat-sessions/{chatSession}/messages', [ChatMessageController::class, 'store'])
            ->name('chat-sessions.messages.store')
            ->middleware('throttle:ai-generate');

        // User Profile
        Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
        Route::get('/profile/stats', [ProfileController::class, 'stats'])->name('profile.stats');
    });
});

/*
|--------------------------------------------------------------------------
| Development Endpoints (Opsional, khusus testing)
|--------------------------------------------------------------------------
*/
if (app()->environment('local', 'development', 'testing')) {
    Route::post('/dev/gemini/test', [GeminiTestController::class, 'test'])->name('api.dev.gemini.test');
}
