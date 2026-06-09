<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\AI\GeminiService;
use App\Services\AI\CloudflareImageService;
use App\Services\AI\Contracts\TextGeneratorInterface;
use App\Services\AI\Contracts\ImageGeneratorInterface;

/**
 * AIServiceProvider
 *
 * Mendaftarkan service AI ke dalam Laravel Service Container.
 * Service yang didaftarkan:
 * - GeminiService (singleton, key: 'gemini')
 * - CloudflareImageService (singleton, key: 'cloudflare-ai')
 *
 * Provider ini juga mengikat interface ke implementasi konkret
 * agar bisa digunakan melalui dependency injection.
 */
class AIServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Daftarkan GeminiService sebagai singleton
        $this->app->singleton('gemini', function () {
            return new GeminiService();
        });

        // Daftarkan CloudflareImageService sebagai singleton
        $this->app->singleton('cloudflare-ai', function () {
            return new CloudflareImageService();
        });

        // Bind interface ke implementasi
        $this->app->bind(TextGeneratorInterface::class, function ($app) {
            return $app->make('gemini');
        });

        $this->app->bind(ImageGeneratorInterface::class, function ($app) {
            return $app->make('cloudflare-ai');
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
