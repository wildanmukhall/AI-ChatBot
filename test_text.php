<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$url = 'https://dark-mouse-667e.dandysultana3.workers.dev/generate';

$response = Http::timeout(120)->acceptJson()->post($url, ['text' => 'A futuristic dark city at sunset with flying cars and neon lights']);
file_put_contents('test_text.png', $response->body());
echo "Test text size: " . strlen($response->body()) . "\n";
