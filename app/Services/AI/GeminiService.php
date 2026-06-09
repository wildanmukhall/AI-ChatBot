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
 * - GEMINI_TIMEOUT
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
    protected int $timeout;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', '');
        $this->baseUrl = config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');
        $this->model = config('services.gemini.model', 'gemini-1.5-flash');
        $this->timeout = (int) config('services.gemini.timeout', 30);
    }

    /**
     * Generate teks menggunakan Gemini API.
     *
     * Method ini menerima prompt string dan mengembalikan
     * teks jawaban AI yang sudah diekstrak dari response Gemini.
     *
     * @param string $prompt Prompt dari user
     * @param array $options Opsi tambahan (model override, dll)
     * @return string Teks jawaban AI
     *
     * @throws ExternalApiException Jika API key kosong, Gemini gagal, atau response kosong
     */
    public function generateText(string $prompt, array $options = []): string
    {
        // Validasi API key
        if (empty($this->apiKey)) {
            Log::error('Gemini API key is not configured.');
            throw new ExternalApiException(
                'Layanan AI belum dikonfigurasi. Silakan hubungi administrator.',
                'gemini',
                503
            );
        }

        try {
            $model = $options['model'] ?? $this->model;
            $url = "{$this->baseUrl}/models/{$model}:generateContent";

            $response = $this->client()
                ->timeout($this->timeout)
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
                    'model' => $model,
                ]);

                throw new ExternalApiException(
                    'Layanan AI sedang mengalami gangguan. Silakan coba beberapa saat lagi.',
                    'gemini',
                    502
                );
            }

            // Ekstrak teks jawaban dari response Gemini
            $text = $this->extractText($response->json());

            if (empty($text)) {
                Log::warning('Gemini API returned empty response', [
                    'model' => $model,
                    'prompt_length' => strlen($prompt),
                ]);

                return 'Maaf, saya tidak dapat memberikan jawaban saat ini. Silakan coba lagi.';
            }

            return $text;

        } catch (ExternalApiException $e) {
            throw $e;
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Gemini API Timeout', [
                'message' => $e->getMessage(),
                'timeout' => $this->timeout,
            ]);

            throw new ExternalApiException(
                'Layanan AI tidak merespons. Silakan coba beberapa saat lagi.',
                'gemini',
                504,
                0,
                $e
            );
        } catch (\Exception $e) {
            Log::error('Gemini Service Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new ExternalApiException(
                'Layanan AI sedang mengalami gangguan. Silakan coba beberapa saat lagi.',
                'gemini',
                502,
                0,
                $e
            );
        }
    }

    /**
     * Ekstrak teks jawaban dari response JSON Gemini.
     *
     * Struktur response Gemini:
     * {
     *   "candidates": [
     *     {
     *       "content": {
     *         "parts": [
     *           { "text": "Jawaban AI" }
     *         ]
     *       }
     *     }
     *   ]
     * }
     */
    protected function extractText(array $response): ?string
    {
        return $response['candidates'][0]['content']['parts'][0]['text'] ?? null;
    }

    /**
     * Mendapatkan nama model yang sedang digunakan.
     */
    public function getModel(): string
    {
        return $this->model;
    }
}
