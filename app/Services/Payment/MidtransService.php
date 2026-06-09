<?php

namespace App\Services\Payment;

use App\Exceptions\ExternalApiException;
use App\Services\Shared\ExternalApiService;
use Illuminate\Support\Facades\Log;

/**
 * MidtransService
 *
 * Service untuk berkomunikasi dengan Midtrans Payment Gateway.
 * Menangani pembuatan transaksi dan verifikasi pembayaran.
 *
 * Konfigurasi diambil dari config/services.php -> midtrans
 * yang nilainya berasal dari file .env:
 * - MIDTRANS_SERVER_KEY
 * - MIDTRANS_CLIENT_KEY
 * - MIDTRANS_IS_PRODUCTION
 *
 * Contoh penggunaan melalui Facade:
 *   MidtransPayment::createTransaction($params)
 *
 * Contoh penggunaan melalui DI:
 *   $midtransService->createTransaction($params)
 */
class MidtransService extends ExternalApiService
{
    protected string $serverKey;
    protected string $clientKey;
    protected bool $isProduction;
    protected string $baseUrl;

    public function __construct()
    {
        $this->serverKey = config('services.midtrans.server_key', '');
        $this->clientKey = config('services.midtrans.client_key', '');
        $this->isProduction = (bool) config('services.midtrans.is_production', false);
        $this->baseUrl = $this->isProduction
            ? 'https://app.midtrans.com/snap/v1'
            : 'https://app.sandbox.midtrans.com/snap/v1';
    }

    /**
     * Membuat transaksi baru di Midtrans (stub).
     *
     * Implementasi lengkap akan dilakukan pada modul Payment.
     *
     * @param array $params Parameter transaksi
     * @return array Response dari Midtrans
     *
     * @throws ExternalApiException Jika Midtrans API gagal
     */
    public function createTransaction(array $params): array
    {
        try {
            $response = $this->client()
                ->withBasicAuth($this->serverKey, '')
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("{$this->baseUrl}/transactions", $params);

            if ($response->failed()) {
                Log::error('Midtrans API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new ExternalApiException(
                    'Gagal menghubungi Midtrans.',
                    'midtrans',
                    502
                );
            }

            return $response->json();
        } catch (ExternalApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Midtrans Service Exception', [
                'message' => $e->getMessage(),
            ]);

            throw new ExternalApiException(
                'Terjadi kesalahan saat menghubungi Midtrans.',
                'midtrans',
                502,
                0,
                $e
            );
        }
    }

    /**
     * Mendapatkan client key untuk frontend.
     */
    public function getClientKey(): string
    {
        return $this->clientKey;
    }

    /**
     * Mengecek apakah menggunakan mode production.
     */
    public function isProduction(): bool
    {
        return $this->isProduction;
    }
}
