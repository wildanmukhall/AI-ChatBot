<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use App\Exceptions\ExternalApiException;

class CloudflareImageService
{
    protected string $accountId;
    protected string $apiToken;
    protected string $baseUrl;
    protected string $model;
    protected int $timeout;
    protected int $retryTimes;
    protected int $retrySleep;

    public function __construct()
    {
        $this->accountId = config('services.cloudflare_ai.account_id', '');
        $this->apiToken = config('services.cloudflare_ai.api_token', '');
        $this->baseUrl = config('services.cloudflare_ai.base_url', 'https://api.cloudflare.com/client/v4');
        $this->model = config('services.cloudflare_ai.image_model', '@cf/bytedance/stable-diffusion-xl-lightning');
        $this->timeout = config('services.cloudflare_ai.timeout', 60);
        $this->retryTimes = config('services.cloudflare_ai.retry_times', 1);
        $this->retrySleep = config('services.cloudflare_ai.retry_sleep', 500);
    }

    /**
     * Generate image from text prompt via Cloudflare Workers AI
     */
    public function generateImage(string $prompt, array $options = []): string
    {
        if (empty($this->accountId) || empty($this->apiToken)) {
            throw new ExternalApiException('Cloudflare AI configuration is missing.');
        }

        $endpoint = "{$this->baseUrl}/accounts/{$this->accountId}/ai/run/{$this->model}";

        $payload = ['prompt' => $prompt];

        $response = Http::withToken($this->apiToken)
            ->timeout($this->timeout)
            ->retry($this->retryTimes, $this->retrySleep)
            ->post($endpoint, $payload);

        if ($response->failed()) {
            throw new ExternalApiException('Cloudflare AI request failed: ' . $response->body(), $response->status());
        }

        $contentType = $response->header('Content-Type');
        if (strpos($contentType, 'image/') === false && strpos($contentType, 'application/octet-stream') === false) {
             throw new ExternalApiException('Invalid response from Cloudflare AI: ' . $response->body());
        }

        return $response->body();
    }
}
