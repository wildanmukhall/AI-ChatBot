<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use App\Exceptions\ExternalApiException;

class CloudflareWorkerImageService
{
    protected string $url;
    protected ?string $token;
    protected int $timeout;
    protected int $retryTimes;
    protected int $retrySleep;

    public function __construct()
    {
        $this->url = config('services.cloudflare_image_worker.url', '');
        $this->token = config('services.cloudflare_image_worker.token');
        $this->timeout = config('services.cloudflare_image_worker.timeout', 120);
        $this->retryTimes = config('services.cloudflare_image_worker.retry_times', 1);
        $this->retrySleep = config('services.cloudflare_image_worker.retry_sleep', 500);
    }

    /**
     * Generate image from text prompt via Cloudflare Worker
     */
    public function generate(string $prompt, array $options = []): string
    {
        if (empty($this->url)) {
            throw new ExternalApiException('Cloudflare Worker URL is missing.');
        }

        $payload = [
            'prompt' => $prompt,
        ];

        $request = Http::timeout($this->timeout)
            ->connectTimeout(30)
            ->retry($this->retryTimes, $this->retrySleep);

        if (!empty($this->token)) {
            $request = $request->withToken($this->token);
        }

        $response = $request->post($this->url, $payload);

        if ($response->failed()) {
            throw new ExternalApiException('Cloudflare Worker request failed: ' . $response->body(), $response->status());
        }

        $contentType = $response->header('Content-Type');
        if (strpos($contentType, 'image/') === false && strpos($contentType, 'application/octet-stream') === false) {
             throw new ExternalApiException('Invalid response from Cloudflare Worker (expected image): ' . $response->body());
        }

        return $response->body();
    }
}
