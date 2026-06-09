<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * MidtransPayment Facade
 *
 * Menyediakan akses sederhana ke MidtransService
 * melalui Service Container Laravel.
 *
 * Contoh penggunaan:
 *   MidtransPayment::createTransaction($params)
 *   MidtransPayment::getClientKey()
 *
 * @method static array createTransaction(array $params)
 * @method static string getClientKey()
 * @method static bool isProduction()
 *
 * @see \App\Services\Payment\MidtransService
 */
class MidtransPayment extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'midtrans-payment';
    }
}
