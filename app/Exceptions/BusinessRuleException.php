<?php

namespace App\Exceptions;

use Exception;

/**
 * BusinessRuleException
 *
 * Exception untuk error yang terjadi karena
 * pelanggaran aturan bisnis, misalnya:
 * - Kuota generate gambar habis
 * - Plan tidak aktif
 * - Aksi tidak diizinkan berdasarkan plan
 *
 * Contoh penggunaan:
 * throw new BusinessRuleException('Kuota generate gambar habis.');
 */
class BusinessRuleException extends Exception
{
    /**
     * HTTP status code untuk business rule error.
     */
    protected int $statusCode;

    public function __construct(string $message = 'Pelanggaran aturan bisnis.', int $statusCode = 422, int $code = 0, ?\Throwable $previous = null)
    {
        $this->statusCode = $statusCode;
        parent::__construct($message, $code, $previous);
    }

    /**
     * Mendapatkan HTTP status code.
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}
