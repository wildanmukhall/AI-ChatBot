<?php

$user = \App\Models\User::first();
if (!$user) {
    $user = \App\Models\User::factory()->create();
}
echo "User ID: " . $user->id . "\n";

$chatService = app(\App\Services\Chat\ChatService::class);

echo "1. Menguji Pembuatan Session...\n";
$session = $chatService->createSession($user, 'QA Test Session');
echo "✅ Session berhasil dibuat dengan ID: " . $session->id . "\n";

echo "2. Menguji Pengiriman Pesan ke AI (Gemini)...\n";
try {
    $response = $chatService->sendMessage($user, $session->id, 'Hello AI, ini QA test. Jawab "OK" jika kamu online.');
    echo "✅ Response diterima dari AI!\n";
    echo "  >> Role: " . $response['assistant_message']['role'] . "\n";
    echo "  >> Model: " . $response['assistant_message']['model'] . "\n";
    echo "  >> Content: " . $response['assistant_message']['content'] . "\n";
} catch (\Exception $e) {
    echo "❌ Gagal mengirim pesan. Error: " . $e->getMessage() . "\n";
}

echo "QA Testing Selesai.\n";
