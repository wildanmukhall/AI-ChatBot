<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Payment\MidtransService;
use App\Services\Payment\PaymentService;

/**
 * PaymentServiceProvider
 *
 * Mendaftarkan service Payment ke dalam Laravel Service Container.
 * Service yang didaftarkan:
 * - MidtransService (singleton, key: 'midtrans-payment')
 * - PaymentService
 */
class PaymentServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Daftarkan MidtransService sebagai singleton
        $this->app->singleton('midtrans-payment', function () {
            return new MidtransService();
        });

        // Daftarkan PaymentService
        $this->app->singleton(PaymentService::class, function ($app) {
            return new PaymentService($app->make('midtrans-payment'));
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
