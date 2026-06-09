<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * ApiResponse Helper
 *
 * Menyediakan standarisasi format response JSON
 * untuk seluruh endpoint API agar konsisten dan
 * mudah dibaca oleh frontend React.
 */
class ApiResponse
{
    /**
     * Response sukses standar.
     *
     * Format:
     * {
     *   "success": true,
     *   "message": "...",
     *   "data": { ... }
     * }
     */
    public static function success($data = null, string $message = 'Request berhasil diproses.', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    /**
     * Response error standar.
     *
     * Format:
     * {
     *   "success": false,
     *   "message": "...",
     *   "errors": { ... }
     * }
     */
    public static function error(string $message = 'Terjadi kesalahan.', $errors = null, int $status = 500): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }

    /**
     * Response sukses dengan pagination.
     *
     * Format:
     * {
     *   "success": true,
     *   "message": "...",
     *   "data": [ ... ],
     *   "meta": {
     *     "current_page": 1,
     *     "last_page": 5,
     *     "per_page": 10,
     *     "total": 50
     *   }
     * }
     */
    public static function paginated(LengthAwarePaginator $paginator, string $message = 'Data berhasil diambil.'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Response validasi gagal (422).
     */
    public static function validationError($errors, string $message = 'Validasi gagal.'): JsonResponse
    {
        return self::error($message, $errors, 422);
    }

    /**
     * Response not found (404).
     */
    public static function notFound(string $message = 'Data tidak ditemukan.'): JsonResponse
    {
        return self::error($message, null, 404);
    }

    /**
     * Response unauthorized (401).
     */
    public static function unauthorized(string $message = 'Akses tidak diizinkan.'): JsonResponse
    {
        return self::error($message, null, 401);
    }

    /**
     * Response forbidden (403).
     */
    public static function forbidden(string $message = 'Anda tidak memiliki izin.'): JsonResponse
    {
        return self::error($message, null, 403);
    }

    /**
     * Response created (201).
     */
    public static function created($data = null, string $message = 'Data berhasil dibuat.'): JsonResponse
    {
        return self::success($data, $message, 201);
    }
}
