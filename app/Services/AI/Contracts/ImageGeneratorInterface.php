<?php

namespace App\Services\AI\Contracts;

/**
 * ImageGeneratorInterface
 *
 * Contract interface untuk service yang melakukan
 * generate gambar menggunakan AI.
 *
 * Diimplementasikan oleh CloudflareImageService.
 */
interface ImageGeneratorInterface
{
    /**
     * Generate gambar berdasarkan prompt.
     *
     * @param string $prompt Prompt deskripsi gambar
     * @param array $options Opsi tambahan (size, style, dll)
     * @return array Hasil generate gambar (URL, base64, dll)
     */
    public function generateImage(string $prompt, array $options = []): array;
}
