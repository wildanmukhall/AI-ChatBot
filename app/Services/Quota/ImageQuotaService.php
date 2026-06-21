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
     */
    public function hasQuota(\App\Models\User $user): bool
    {
        Log::info('ImageQuotaService: hasQuota dipanggil', ['user_id' => $user->id]);
        return true;
    }

    /**
     * Mengurangi kuota user (stub).
     */
    public function consume(\App\Models\User $user, int $amount = 1, array $context = []): void
    {
        Log::info('ImageQuotaService: consume dipanggil', ['user_id' => $user->id, 'amount' => $amount]);
    }

    /**
     * Mengembalikan kuota user (stub).
     */
    public function refund(\App\Models\User $user, int $amount = 1, array $context = []): void
    {
        Log::info('ImageQuotaService: refund dipanggil', ['user_id' => $user->id, 'amount' => $amount]);
    }

    /**
     * Mendapatkan sisa kuota user (stub).
     */
    public function getRemainingQuota(\App\Models\User $user): int
    {
        Log::info('ImageQuotaService: getRemainingQuota dipanggil', ['user_id' => $user->id]);
        return 10;
    }
}
