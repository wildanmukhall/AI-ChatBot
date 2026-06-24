<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$payload = [
    'prompt' => 'A futuristic dark city at sunset with flying cars and neon lights',
    'negative_prompt' => '',
    'width' => 512,
    'height' => 512,
];

$url = 'https://dark-mouse-667e.dandysultana3.workers.dev/generate';

$response = Http::timeout(120)->acceptJson()->post($url, $payload);

echo "Status: " . $response->status() . "\n";
echo "Content-Type: " . $response->header('Content-Type') . "\n";
echo "Body Length: " . strlen($response->body()) . "\n";

// Save first few bytes to check if it's an image
file_put_contents('test_output.png', $response->body());
echo "Saved to test_output.png\n";
