<?php
use Illuminate\Support\Facades\Http;

$apiKey = config('services.gemini.api_key');
$url = "https://generativelanguage.googleapis.com/v1beta/models";

$response = Http::withQueryParameters(['key' => $apiKey])->get($url);

$data = $response->json();
foreach ($data['models'] as $model) {
    if (strpos($model['name'], 'gemini') !== false) {
        echo $model['name'] . " - " . implode(", ", $model['supportedGenerationMethods']) . "\n";
    }
}
