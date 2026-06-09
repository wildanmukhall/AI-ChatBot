<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * CloudflareAI Facade
 *
 * Menyediakan akses sederhana ke CloudflareImageService
 * melalui Service Container Laravel.
 *
 * Contoh penggunaan:
 *   CloudflareAI::generateImage('A cat sitting on a chair')
 *
 * @method static array generateImage(string $prompt, array $options = [])
 *
 * @see \App\Services\AI\CloudflareImageService
 */
class CloudflareAI extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'cloudflare-ai';
    }
}
