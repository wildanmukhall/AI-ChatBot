<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
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
| Struktur endpoint sesuai PRD:
|   GET  /api/v1/health  → Health check
|   GET  /api/v1/status  → API version status
|
| Auth endpoints (PRD Section 9.1):
|   POST /api/v1/auth/register → Register
|   POST /api/v1/auth/login    → Login
|   POST /api/v1/auth/logout   → Logout (auth)
|   GET  /api/v1/auth/me       → Data user aktif (auth)
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

    // Payment Webhook (Public)
    Route::post('/payments/midtrans/notification', [\App\Http\Controllers\Api\PaymentController::class, 'notification'])
        ->name('payments.notification');

    // Pricing Plans (Public — tampilkan di UI tanpa login)
    Route::get('/pricing-plans', [\App\Http\Controllers\Api\PricingPlanController::class, 'index'])
        ->name('pricing-plans.index');

    // Authentication (PRD Section 9.1)
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])
            ->middleware('throttle:5,1')
            ->name('auth.register');

        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:5,1')
            ->name('auth.login');

        // Protected auth endpoints
        Route::middleware(['auth:sanctum'])->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])
                ->name('auth.logout');

            Route::get('/me', [AuthController::class, 'me'])
                ->name('auth.me');
        });
    });

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

        // Payments
        Route::post('/payments/checkout', [\App\Http\Controllers\Api\PaymentController::class, 'checkout'])->name('payments.checkout');
        Route::get('/payments', [\App\Http\Controllers\Api\PaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{order}', [\App\Http\Controllers\Api\PaymentController::class, 'show'])->name('payments.show');

        // Image Generation
        Route::post('/images/generate', [\App\Http\Controllers\Api\ImageGenerationController::class, 'generate'])->name('images.generate');
        Route::get('/images/{id}/status', [\App\Http\Controllers\Api\ImageGenerationController::class, 'status'])->name('images.status');

        // Image Gallery
        Route::get('/images', [\App\Http\Controllers\Api\ImageGalleryController::class, 'index'])->name('images.index');
        Route::get('/images/{id}', [\App\Http\Controllers\Api\ImageGalleryController::class, 'show'])->name('images.show');
        Route::delete('/images/{id}', [\App\Http\Controllers\Api\ImageGalleryController::class, 'destroy'])->name('images.destroy');
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
