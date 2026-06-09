<?php

namespace App\Services\Shared;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

/**
 * ExternalApiService (Base Class)
 *
 * Base service untuk seluruh service yang
 * berkomunikasi dengan API eksternal.
 *
 * Menyediakan HTTP client standar dengan:
 * - Timeout 30 detik
 * - Retry 2x dengan jeda 500ms
 * - Accept JSON
 *
 * Service seperti GeminiService, CloudflareImageService,
 * dan MidtransService mewarisi class ini.
 */
class ExternalApiService
{
    /**
     * Membuat HTTP client standar untuk request ke API eksternal.
     *
     * Semua request API eksternal menggunakan client ini
     * agar memiliki standar timeout, retry, dan format yang sama.
     */
    protected function client(): PendingRequest
    {
        return Http::timeout(30)
            ->retry(2, 500)
            ->acceptJson();
    }
}
