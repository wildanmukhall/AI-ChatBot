<?php

namespace App\Services\AI\Contracts;

/**
 * TextGeneratorInterface
 *
 * Contract interface untuk service yang melakukan
 * generate teks menggunakan AI.
 *
 * Diimplementasikan oleh GeminiService.
 */
interface TextGeneratorInterface
{
    /**
     * Generate teks berdasarkan prompt.
     *
     * @param string $prompt Prompt dari user
     * @param array $options Opsi tambahan (model, temperature, dll)
     * @return string Teks hasil generate AI
     */
    public function generateText(string $prompt, array $options = []): string;
}
