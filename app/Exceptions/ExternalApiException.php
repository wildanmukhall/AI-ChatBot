<?php

namespace App\Exceptions;

use Exception;

/**
 * ExternalApiException
 *
 * Exception untuk error yang terjadi saat
 * berkomunikasi dengan API eksternal, misalnya:
 * - Gemini API tidak merespons
 * - Cloudflare AI gagal generate gambar
 * - Midtrans timeout
 *
 * Contoh penggunaan:
 * throw new ExternalApiException('Gagal menghubungi Gemini API.');
 */
class ExternalApiException extends Exception
{
    /**
     * Nama service yang gagal.
     */
    protected string $serviceName;

    /**
     * HTTP status code untuk external API error.
     */
    protected int $statusCode;

    public function __construct(
        string $message = 'Gagal menghubungi layanan eksternal.',
        string $serviceName = 'unknown',
        int $statusCode = 502,
        int $code = 0,
        ?\Throwable $previous = null
    ) {
        $this->serviceName = $serviceName;
        $this->statusCode = $statusCode;
        parent::__construct($message, $code, $previous);
    }

    /**
     * Mendapatkan nama service yang gagal.
     */
    public function getServiceName(): string
    {
        return $this->serviceName;
    }

    /**
     * Mendapatkan HTTP status code.
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}
