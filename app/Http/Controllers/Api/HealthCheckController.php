<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * HealthCheckController
 *
 * Controller untuk endpoint health check dan status API.
 * Digunakan untuk memastikan backend berjalan dengan baik
 * dan memverifikasi koneksi dari frontend React.
 */
class HealthCheckController extends Controller
{
    /**
     * Health Check Endpoint
     *
     * GET /api/v1/health
     *
     * Mengembalikan status kesehatan backend API.
     */
    public function index(): JsonResponse
    {
        return ApiResponse::success([
            'app' => config('app.name'),
            'status' => 'ok',
            'environment' => app()->environment(),
            'timestamp' => now()->toIso8601String(),
        ], 'Backend API berjalan dengan baik.');
    }

    /**
     * API Version Status Endpoint
     *
     * GET /api/v1/status
     *
     * Mengembalikan informasi versi dan status API.
     */
    public function status(): JsonResponse
    {
        return ApiResponse::success([
            'version' => 'v1',
            'status' => 'active',
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
        ], 'API aktif.');
    }
}
