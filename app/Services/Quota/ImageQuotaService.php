<?php

namespace App\Services\Quota;

use Illuminate\Support\Facades\Log;

/**
 * ImageQuotaService
 *
 * Service untuk mengelola kuota generate gambar per user.
 * Akan diimplementasikan penuh pada modul pricing plan.
 *
 * Logika bisnis kuota:
 * - Mengecek sisa kuota user
 * - Mengurangi kuota setelah generate
 * - Mengecek apakah user memiliki akses
 */
class ImageQuotaService
{
    /**
     * Mengecek apakah user masih memiliki kuota (stub).
     *
     * @param int $userId ID User
     * @return bool Apakah masih memiliki kuota
     */
    public function hasQuota(int $userId): bool
    {
        Log::info('ImageQuotaService: hasQuota dipanggil', ['user_id' => $userId]);

        // Stub: implementasi pada modul berikutnya
        return true;
    }

    /**
     * Mengurangi kuota user setelah generate (stub).
     *
     * @param int $userId ID User
     * @return void
     */
    public function deductQuota(int $userId): void
    {
        Log::info('ImageQuotaService: deductQuota dipanggil', ['user_id' => $userId]);

        // Stub: implementasi pada modul berikutnya
    }

    /**
     * Mendapatkan sisa kuota user (stub).
     *
     * @param int $userId ID User
     * @return int Sisa kuota
     */
    public function getRemainingQuota(int $userId): int
    {
        Log::info('ImageQuotaService: getRemainingQuota dipanggil', ['user_id' => $userId]);

        // Stub: implementasi pada modul berikutnya
        return 0;
    }
}
