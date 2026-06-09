<?php

namespace App\Services\Shared;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * ApiResponseService
 *
 * Service wrapper untuk ApiResponse helper.
 * Dapat digunakan melalui dependency injection
 * sebagai alternatif dari static call ApiResponse.
 */
class ApiResponseService
{
    /**
     * Response sukses standar.
     */
    public function success($data = null, string $message = 'Request berhasil diproses.', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    /**
     * Response error standar.
     */
    public function error(string $message = 'Terjadi kesalahan.', $errors = null, int $status = 500): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }

    /**
     * Response sukses dengan pagination.
     */
    public function paginated(LengthAwarePaginator $paginator, string $message = 'Data berhasil diambil.'): JsonResponse
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
}
