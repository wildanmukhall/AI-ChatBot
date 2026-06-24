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
     * Kuota berkurang secara otomatis karena dihitung dari jumlah GeneratedImage.
     * Method ini hanya untuk logging.
     */
    public function consume(User $user, int $amount = 1, array $context = []): void
    {
        Log::info('ImageQuotaService: consume', [
            'user_id' => $user->id,
            'amount' => $amount,
            'remaining_before' => $this->getRemainingQuota($user),
        ]);
    }

    /**
     * Mengembalikan kuota user.
     * Kuota otomatis kembali jika GeneratedImage dihapus atau statusnya bukan 'completed'.
     */
    public function refund(User $user, int $amount = 1, array $context = []): void
    {
        Log::info('ImageQuotaService: refund', [
            'user_id' => $user->id,
            'amount' => $amount,
            'remaining_after' => $this->getRemainingQuota($user),
        ]);
    }

    /**
     * Mendapatkan sisa kuota user.
     * Dihitung: total kuota dari order paid - total gambar completed.
     */
    public function getRemainingQuota(User $user): int
    {
        $purchasedQuota = Order::where('user_id', $user->id)
            ->where('status', 'paid')
            ->sum('image_quota');

        $usedImageQuota = GeneratedImage::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();
            
        $usedChatQuota = \App\Models\ChatMessage::whereHas('chatSession', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('role', 'user')->count();

        return max(0, (int) $purchasedQuota - $usedImageQuota - $usedChatQuota);
    }
}
