<?php

namespace App\Services\AI;

use App\Exceptions\ExternalApiException;
use App\Services\AI\Contracts\ImageGeneratorInterface;
use App\Services\Shared\ExternalApiService;
use Illuminate\Support\Facades\Log;

/**
 * CloudflareImageService
 *
 * Service untuk berkomunikasi dengan Cloudflare Workers AI API.
 * Menangani generate gambar berbasis AI.
 *
 * Konfigurasi diambil dari config/services.php -> cloudflare
 * yang nilainya berasal dari file .env:
 * - CLOUDFLARE_API_TOKEN
 * - CLOUDFLARE_ACCOUNT_ID
 * - CLOUDFLARE_IMAGE_ENDPOINT
 *
 * Contoh penggunaan melalui Facade:
 *   CloudflareAI::generateImage('A cat sitting on a chair')
 *
 * Contoh penggunaan melalui DI:
 *   $cloudflareService->generateImage('A cat sitting on a chair')
 */
class CloudflareImageService extends ExternalApiService implements ImageGeneratorInterface
{
    protected string $apiToken;
    protected string $accountId;
    protected string $imageEndpoint;

    public function __construct()
    {
        $this->apiToken = config('services.cloudflare.api_token', '');
        $this->accountId = config('services.cloudflare.account_id', '');
        $this->imageEndpoint = config('services.cloudflare.image_endpoint', '');
    }

    /**
     * Generate gambar menggunakan Cloudflare Workers AI.
     *
     * @param string $prompt Deskripsi gambar yang diinginkan
     * @param array $options Opsi tambahan (size, style, dll)
     * @return array Response dari Cloudflare API
     *
     * @throws ExternalApiException Jika Cloudflare API gagal
     */
    public function generateImage(string $prompt, array $options = []): array
    {
        try {
            $url = $this->imageEndpoint
                ?: "https://api.cloudflare.com/client/v4/accounts/{$this->accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0";

            $response = $this->client()
                ->withToken($this->apiToken)
                ->post($url, array_merge([
                    'prompt' => $prompt,
                ], $options));

            if ($response->failed()) {
                Log::error('Cloudflare AI Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new ExternalApiException(
                    'Gagal menghubungi Cloudflare AI.',
                    'cloudflare',
                    502
                );
            }

            return $response->json();
        } catch (ExternalApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Cloudflare Service Exception', [
                'message' => $e->getMessage(),
            ]);

            throw new ExternalApiException(
                'Terjadi kesalahan saat menghubungi Cloudflare AI.',
                'cloudflare',
                502,
                0,
                $e
            );
        }
    }
}
