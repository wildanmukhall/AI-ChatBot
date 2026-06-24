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
     * Mengecek apakah user masih memiliki kuota.
     */
    public function hasQuota(\App\Models\User $user): bool
    {
        Log::info('ImageQuotaService: hasQuota dipanggil', ['user_id' => $user->id, 'quota' => $user->image_quota]);
        return $user->image_quota > 0;
    }

    /**
     * Mengurangi kuota user.
     */
    public function consume(\App\Models\User $user, int $amount = 1, array $context = []): void
    {
        Log::info('ImageQuotaService: consume dipanggil', ['user_id' => $user->id, 'amount' => $amount]);
        if ($user->image_quota >= $amount) {
            $user->decrement('image_quota', $amount);
        }
    }

    /**
     * Mengembalikan kuota user.
     */
    public function refund(\App\Models\User $user, int $amount = 1, array $context = []): void
    {
        Log::info('ImageQuotaService: refund dipanggil', ['user_id' => $user->id, 'amount' => $amount]);
        $user->increment('image_quota', $amount);
    }

    /**
     * Mendapatkan sisa kuota user.
     */
    public function getRemainingQuota(\App\Models\User $user): int
    {
        Log::info('ImageQuotaService: getRemainingQuota dipanggil', ['user_id' => $user->id, 'quota' => $user->image_quota]);
        return $user->image_quota;
    }
}
