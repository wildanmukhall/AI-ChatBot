<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$url = 'https://dark-mouse-667e.dandysultana3.workers.dev/generate';

$response1 = Http::timeout(120)->acceptJson()->post($url, ['prompt' => 'A beautiful orange cat sitting on a blue sofa']);
file_put_contents('test_cat.png', $response1->body());
echo "Cat size: " . strlen($response1->body()) . "\n";
