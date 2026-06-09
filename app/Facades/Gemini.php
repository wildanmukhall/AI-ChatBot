<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * Gemini Facade
 *
 * Menyediakan akses sederhana ke GeminiService
 * melalui Service Container Laravel.
 *
 * Contoh penggunaan:
 *   Gemini::generateText('Jelaskan tentang AI')
 *
 * @method static string generateText(string $prompt, array $options = [])
 *
 * @see \App\Services\AI\GeminiService
 */
class Gemini extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'gemini';
    }
}
