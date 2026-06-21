<?php

namespace App\Services\Payment;

use App\Exceptions\PaymentGatewayException;
use App\Models\Order;
use App\Models\User;
use App\Models\PricingPlan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    protected string $serverKey;
    protected string $clientKey;
    protected bool $isProduction;
    protected string $snapUrl;
    protected string $apiBaseUrl;

    public function __construct()
    {
        $this->serverKey = config('services.midtrans.server_key', '');
        $this->clientKey = config('services.midtrans.client_key', '');
        $this->isProduction = (bool) config('services.midtrans.is_production', false);
        $this->snapUrl = config('services.midtrans.snap_url', 'https://app.sandbox.midtrans.com/snap/v1/transactions');
        $this->apiBaseUrl = config('services.midtrans.api_base_url', 'https://api.sandbox.midtrans.com');
        
        if ($this->isProduction) {
            $this->snapUrl = 'https://app.midtrans.com/snap/v1/transactions';
            $this->apiBaseUrl = 'https://api.midtrans.com';
        }
    }

    public function createSnapTransaction(Order $order, User $user, PricingPlan $plan): array
    {
        if (empty($this->serverKey)) {
            throw new PaymentGatewayException('Midtrans server key is not configured.');
        }

        $payload = [
            'transaction_details' => [
                'order_id' => $order->order_code,
                'gross_amount' => $order->amount,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
            ],
            'item_details' => [
                [
                    'id' => 'PLAN-' . $plan->id,
                    'price' => $order->amount,
                    'quantity' => 1,
                    'name' => $plan->name,
                ]
            ],
        ];

        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($this->snapUrl, $payload);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Midtrans Snap API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload' => $payload
            ]);

            throw new PaymentGatewayException('Gagal membuat transaksi pembayaran. Silakan coba lagi.');
        } catch (PaymentGatewayException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Midtrans Service Exception', [
                'message' => $e->getMessage(),
            ]);

            throw new PaymentGatewayException('Terjadi kesalahan saat menghubungi Midtrans.');
        }
    }

    public function verifySignature(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $signatureKey = $payload['signature_key'] ?? '';

        $serverKey = $this->serverKey;

        $generatedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        return $generatedSignature === $signatureKey;
    }

    public function mapStatus(array $payload): string
    {
        $transactionStatus = $payload['transaction_status'] ?? 'pending';
        $fraudStatus = $payload['fraud_status'] ?? null;

        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'accept') {
                return 'paid';
            }
            return 'pending'; // challenge
        } elseif ($transactionStatus == 'settlement') {
            return 'paid';
        } elseif ($transactionStatus == 'cancel') {
            return 'cancelled';
        } elseif ($transactionStatus == 'deny') {
            return 'denied';
        } elseif ($transactionStatus == 'expire') {
            return 'expired';
        } elseif ($transactionStatus == 'failure') {
            return 'failed';
        } elseif ($transactionStatus == 'refund' || $transactionStatus == 'partial_refund') {
            return 'refunded';
        }

        return 'pending';
    }
}
