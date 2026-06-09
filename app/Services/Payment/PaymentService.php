<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Log;

/**
 * PaymentService
 *
 * Service layer untuk mengelola logika bisnis pembayaran.
 * Menjadi perantara antara controller dan MidtransService.
 *
 * Implementasi lengkap akan dilakukan pada modul Payment.
 */
class PaymentService
{
    protected MidtransService $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Proses pembayaran baru (stub).
     *
     * Akan diimplementasikan pada modul Payment.
     *
     * @param array $data Data pembayaran
     * @return array Hasil proses pembayaran
     */
    public function processPayment(array $data): array
    {
        Log::info('PaymentService: processPayment dipanggil', ['data' => $data]);

        // Stub: implementasi pada modul berikutnya
        return [
            'status' => 'pending',
            'message' => 'Fitur payment belum diimplementasikan pada modul fondasi.',
        ];
    }
}
