<?php

namespace App\Services\AI;

use App\Exceptions\ExternalApiException;
use App\Services\AI\Contracts\TextGeneratorInterface;
use App\Services\Shared\ExternalApiService;
use Illuminate\Support\Facades\Log;

/**
 * GeminiService
 *
 * Service untuk berkomunikasi dengan Google Gemini API.
 * Menangani generate teks berbasis AI.
 *
 * Konfigurasi diambil dari config/services.php -> gemini
 * yang nilainya berasal dari file .env:
 * - GEMINI_API_KEY
 * - GEMINI_BASE_URL
 * - GEMINI_MODEL
 *
 * Contoh penggunaan melalui Facade:
 *   Gemini::generateText('Jelaskan tentang AI')
 *
 * Contoh penggunaan melalui DI:
 *   $geminiService->generateText('Jelaskan tentang AI')
 */
class GeminiService extends ExternalApiService implements TextGeneratorInterface
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', '');
        $this->baseUrl = config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');
        $this->model = config('services.gemini.model', 'gemini-1.5-flash');
    }

    /**
     * Generate teks menggunakan Gemini API.
     *
     * @param string $prompt Prompt dari user
     * @param array $options Opsi tambahan
     * @return array Response dari Gemini API
     *
     * @throws ExternalApiException Jika Gemini API gagal
     */
    public function generateText(string $prompt, array $options = []): array
    {
        try {
            $model = $options['model'] ?? $this->model;
            $url = "{$this->baseUrl}/models/{$model}:generateContent";

            $response = $this->client()
                ->withQueryParameters(['key' => $this->apiKey])
                ->post($url, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::error('Gemini API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new ExternalApiException(
                    'Gagal menghubungi Gemini API.',
                    'gemini',
                    502
                );
            }

            return $response->json();
        } catch (ExternalApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Gemini Service Exception', [
                'message' => $e->getMessage(),
            ]);

            throw new ExternalApiException(
                'Terjadi kesalahan saat menghubungi Gemini API.',
                'gemini',
                502,
                0,
                $e
            );
        }
    }
}
