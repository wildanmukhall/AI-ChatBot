<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$prompt = 'A futuristic dark city at sunset with flying cars and neon lights';

$url = 'https://dark-mouse-667e.dandysultana3.workers.dev/generate';

// Test 1: Just prompt
$payload1 = ['prompt' => $prompt];
$response1 = Http::timeout(120)->acceptJson()->post($url, $payload1);
file_put_contents('test_output1.png', $response1->body());
echo "Test 1 size: " . strlen($response1->body()) . "\n";

// Test 2: With width and height
$payload2 = [
    'prompt' => $prompt,
    'width' => 512,
    'height' => 512,
];
$response2 = Http::timeout(120)->acceptJson()->post($url, $payload2);
file_put_contents('test_output2.png', $response2->body());
echo "Test 2 size: " . strlen($response2->body()) . "\n";

// Test 3: With negative_prompt
$payload3 = [
    'prompt' => $prompt,
    'negative_prompt' => 'blurry',
];
$response3 = Http::timeout(120)->acceptJson()->post($url, $payload3);
file_put_contents('test_output3.png', $response3->body());
echo "Test 3 size: " . strlen($response3->body()) . "\n";
