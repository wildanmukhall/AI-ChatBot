<?php

namespace App\Services\Quota;

use App\Models\GeneratedImage;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * ImageQuotaService
 *
 * Service untuk mengelola kuota generate gambar per user.
 * Kuota dihitung secara dinamis:
 *   remaining = sum(paid orders' image_quota) - count(completed generated images)
 *
 * Logika bisnis kuota:
 * - Mengecek sisa kuota user
 * - Mengurangi kuota setelah generate (otomatis via GeneratedImage)
 * - Mengecek apakah user memiliki akses
 */
class ImageQuotaService
{
    /**
     * Mengecek apakah user masih memiliki kuota.
     */
    public function hasQuota(User $user): bool
    {
        return $this->getRemainingQuota($user) > 0;
    }

    /**
     * Mengurangi kuota user.
     */
    public function consume(User $user, int $amount = 1, array $context = []): void
    {
        $user->decrement('image_quota', $amount);

        Log::info('ImageQuotaService: consume', [
            'user_id' => $user->id,
            'amount' => $amount,
            'remaining_before' => $user->image_quota + $amount,
            'remaining_after' => $user->image_quota,
        ]);
    }

    /**
     * Mengembalikan kuota user.
     */
    public function refund(User $user, int $amount = 1, array $context = []): void
    {
        $user->increment('image_quota', $amount);

        Log::info('ImageQuotaService: refund', [
            'user_id' => $user->id,
            'amount' => $amount,
            'remaining_before' => $user->image_quota - $amount,
            'remaining_after' => $user->image_quota,
        ]);
    }

    /**
     * Mendapatkan sisa kuota user.
     */
    public function getRemainingQuota(User $user): int
    {
        return $user->image_quota;
    }
}
