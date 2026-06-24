<?php

namespace App\Services\Profile;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileService
{
    /**
     * Get user profile.
     *
     * @param User $user
     * @return array
     */
    public function getProfile(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? 'user',
            'image_quota' => $user->image_quota,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }

    /**
     * Update user name.
     *
     * @param User $user
     * @param array $data
     * @return array
     */
    public function updateProfile(User $user, array $data): array
    {
        $user->name = $data['name'];
        $user->save();

        return $this->getProfile($user);
    }

    /**
     * Update user password.
     *
     * @param User $user
     * @param string $currentPassword
     * @param string $newPassword
     * @return void
     * @throws ValidationException
     */
    public function updatePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama tidak sesuai.'],
            ]);
        }

        $user->password = Hash::make($newPassword);
        $user->save();
    }

    /**
     * Get user basic statistics.
     *
     * @param User $user
     * @return array
     */
    public function getStats(User $user): array
    {
        // ── Chat stats ────────────────────────────────────────────────
        $totalSessions = 0;
        $totalMessages = 0;
        $totalUserMessages = 0;
        $totalAssistantMessages = 0;

        if (method_exists($user, 'chatSessions')) {
            $totalSessions = $user->chatSessions()->count();

            try {
                $sessionIds = $user->chatSessions()->pluck('id');
                if ($sessionIds->isNotEmpty()) {
                    $messages = \App\Models\ChatMessage::whereIn('chat_session_id', $sessionIds);
                    $totalMessages       = (clone $messages)->count();
                    $totalUserMessages   = (clone $messages)->where('role', 'user')->count();
                    $totalAssistantMessages = (clone $messages)->where('role', 'assistant')->count();
                }
            } catch (\Exception $e) {
                // Table doesn't exist yet, ignore
            }
        }

        // ── Image stats ───────────────────────────────────────────────
        $totalImages    = 0;
        $completedImages = 0;
        $remainingQuota = 0;
        $totalUsedQuota = 0;

        try {
            $totalImages     = \App\Models\GeneratedImage::where('user_id', $user->id)->count();
            $completedImages = \App\Models\GeneratedImage::where('user_id', $user->id)
                ->where('status', 'completed')
                ->count();
            $totalUsedQuota  = $completedImages;

            $remainingQuota = $user->image_quota;
        } catch (\Exception $e) {
            // Tables may not exist yet
        }

        // ── Payment stats ─────────────────────────────────────────────
        $totalOrders     = 0;
        $totalPaidOrders = 0;

        try {
            $totalOrders     = \App\Models\Order::where('user_id', $user->id)->count();
            $totalPaidOrders = \App\Models\Order::where('user_id', $user->id)->where('status', 'paid')->count();
        } catch (\Exception $e) {
            // Table may not exist yet
        }

        return [
            'total_chat_sessions'   => $totalSessions,
            'total_messages'        => $totalMessages,
            'total_images'          => $totalImages,
            'completed_images'      => $completedImages,
            'remaining_quota'       => $remainingQuota,
            'total_used_quota'      => $totalUsedQuota,
            'total_orders'          => $totalOrders,
            'total_paid_orders'     => $totalPaidOrders,
        ];
    }
}
