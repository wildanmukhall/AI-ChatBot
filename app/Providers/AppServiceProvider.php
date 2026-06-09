<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Konfigurasi rate limiting untuk API.
     *
     * Pembagian rate limit:
     * - api           : 60 request / menit (public)
     * - auth          : 120 request / menit (authenticated)
     * - ai-generate   : 10 request / menit (AI generate)
     * - payment       : 20 request / menit (payment)
     */
    protected function configureRateLimiting(): void
    {
        // Rate limit default untuk public API
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(
                $request->user()?->id ?: $request->ip()
            );
        });

        // Rate limit untuk endpoint autentikasi
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(120)->by(
                $request->user()?->id ?: $request->ip()
            );
        });

        // Rate limit khusus untuk AI generate (lebih ketat)
        RateLimiter::for('ai-generate', function (Request $request) {
            return Limit::perMinute(10)->by(
                $request->user()?->id ?: $request->ip()
            );
        });

        // Rate limit untuk payment endpoint
        RateLimiter::for('payment', function (Request $request) {
            return Limit::perMinute(20)->by(
                $request->user()?->id ?: $request->ip()
            );
        });
    }
}
