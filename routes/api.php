<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthCheckController;

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
    | Authenticated Endpoints (memerlukan autentikasi)
    | Akan ditambahkan pada modul berikutnya
    |----------------------------------------------------------------------
    */

    // Route::middleware(['auth:sanctum'])->group(function () {
    //     // Chat routes
    //     // Image generation routes
    //     // Payment routes
    //     // User routes
    // });

    /*
    |----------------------------------------------------------------------
    | AI Generate Endpoints (rate limit khusus)
    | Akan ditambahkan pada modul berikutnya
    |----------------------------------------------------------------------
    */

    // Route::middleware(['auth:sanctum', 'throttle:ai-generate'])->group(function () {
    //     // AI text generation
    //     // AI image generation
    // });
});
