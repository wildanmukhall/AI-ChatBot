<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Services\Chat\ChatService;
use App\Services\AI\GeminiService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ChatServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_chat_session()
    {
        $user = User::factory()->create();

        $geminiMock = $this->createMock(GeminiService::class);

        $chatService = new ChatService($geminiMock);

        $session = $chatService->createSession($user);

        $this->assertDatabaseHas('chat_sessions', [
            'id' => $session->id,
            'user_id' => $user->id,
        ]);

        $this->assertEquals('Percakapan Baru', $session->title);
    }
    public function test_user_can_get_own_session(): void
{
    $user = User::factory()->create();

    $geminiMock = $this->createMock(GeminiService::class);

    $chatService = new ChatService($geminiMock);

    $createdSession = $chatService->createSession($user);

    $foundSession = $chatService->getSession(
        $user,
        $createdSession->id
    );

    $this->assertEquals(
        $createdSession->id,
        $foundSession->id
    );
}
public function test_user_can_delete_chat_session(): void
{
    $user = User::factory()->create();

    $geminiMock = $this->createMock(GeminiService::class);

    $chatService = new ChatService($geminiMock);

    $session = $chatService->createSession($user);

    $chatService->deleteSession(
        $user,
        $session->id
    );

    $this->assertDatabaseMissing('chat_sessions', [
        'id' => $session->id,
    ]);
}
}