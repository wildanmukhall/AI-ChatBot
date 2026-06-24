<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$url = 'https://dark-mouse-667e.dandysultana3.workers.dev/generate';

$response1 = Http::timeout(120)->acceptJson()->post($url, ['prompt' => 'kucing makan nasi']);
file_put_contents('test_kucing.png', $response1->body());
echo "Kucing size: " . strlen($response1->body()) . "\n";
