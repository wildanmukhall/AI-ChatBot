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
        // Check if chat sessions relation/table exists
        $totalSessions = 0;
        $totalUserMessages = 0;
        $totalAssistantMessages = 0;
        $totalMessages = 0;

        if (method_exists($user, 'chatSessions')) {
            $totalSessions = $user->chatSessions()->count();
            
            // Assuming ChatMessage model exists and we can get stats from chat sessions
            // Since chat_messages has a chat_session_id, we can query them.
            // Let's check if the table/relation is accessible
            try {
                $sessionsIds = $user->chatSessions()->pluck('id');
                if ($sessionsIds->isNotEmpty()) {
                    // Check if chat_messages table exists by querying
                    $messages = \App\Models\ChatMessage::whereIn('chat_session_id', $sessionsIds);
                    $totalMessages = (clone $messages)->count();
                    $totalUserMessages = (clone $messages)->where('role', 'user')->count();
                    $totalAssistantMessages = (clone $messages)->where('role', 'assistant')->count();
                }
            } catch (\Exception $e) {
                // Table doesn't exist yet, ignore
            }
        }

        return [
            'chat' => [
                'total_sessions' => $totalSessions,
                'total_user_messages' => $totalUserMessages,
                'total_assistant_messages' => $totalAssistantMessages,
                'total_messages' => $totalMessages,
            ],
            'image' => [
                'total_generated_images' => 0,
                'remaining_quota' => 0,
                'total_used_quota' => 0,
            ],
            'payment' => [
                'total_orders' => 0,
                'total_paid_orders' => 0,
            ],
        ];
    }
}
