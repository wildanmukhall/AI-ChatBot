<?php

namespace App\Services\Payment;

use App\Exceptions\PaymentGatewayException;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PricingPlan;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentService
{
    protected MidtransService $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    public function checkout(User $user, int $pricingPlanId): array
    {
        $plan = PricingPlan::find($pricingPlanId);

        if (!$plan || !$plan->is_active) {
            throw new PaymentGatewayException('Pricing plan tidak tersedia.');
        }

        DB::beginTransaction();
        try {
            $orderCode = 'ORDER-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            $order = Order::create([
                'user_id' => $user->id,
                'pricing_plan_id' => $plan->id,
                'order_code' => $orderCode,
                'amount' => $plan->price,
                'image_quota' => $plan->image_quota,
                'status' => 'pending',
            ]);

            $midtransResponse = $this->midtransService->createSnapTransaction($order, $user, $plan);

            $payment = Payment::create([
                'order_id' => $order->id,
                'provider' => 'midtrans',
                'transaction_status' => 'pending',
                'gross_amount' => $order->amount,
            ]);

            DB::commit();

            return [
                'order' => [
                    'id' => $order->id,
                    'order_code' => $order->order_code,
                    'status' => $order->status,
                    'amount' => $order->amount,
                    'image_quota' => $order->image_quota,
                ],
                'payment' => [
                    'provider' => 'midtrans',
                    'snap_token' => $midtransResponse['token'],
                    'redirect_url' => $midtransResponse['redirect_url'],
                ]
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout Failed', ['message' => $e->getMessage()]);
            throw new PaymentGatewayException($e->getMessage() ?: 'Gagal melakukan checkout.');
        }
    }

    public function handleMidtransNotification(array $payload): void
    {
        if (!$this->midtransService->verifySignature($payload)) {
            Log::warning('Midtrans Invalid Signature', ['payload' => $payload]);
            throw new PaymentGatewayException('Invalid payment signature.');
        }

        $orderCode = $payload['order_id'] ?? null;
        if (!$orderCode) {
            throw new PaymentGatewayException('Order ID tidak ditemukan dalam payload.');
        }

        $order = Order::where('order_code', $orderCode)->first();
        if (!$order) {
            Log::error('Midtrans Webhook Order Not Found', ['order_code' => $orderCode]);
            throw new PaymentGatewayException('Order tidak ditemukan.');
        }

        $internalStatus = $this->midtransService->mapStatus($payload);
        
        DB::beginTransaction();
        try {
            $this->updatePayment($order, $payload);
            
            // Idempotency: Jika order sudah final (paid, failed, cancelled, denied, refunded, expired)
            // Kita tidak perlu mengubah statusnya lagi kecuali ke status yang valid.
            // Di PRD: Jika order sudah paid, jangan downgrade.
            if ($order->status !== 'paid') {
                $order->status = $internalStatus;
                if ($internalStatus === 'paid') {
                    $order->paid_at = now();
                    // Kuota otomatis bertambah karena dihitung secara dinamis:
                    // remaining = sum(paid orders' image_quota) - count(completed images)
                    Log::info('Payment successful, quota added', [
                        'order_id' => $order->id,
                        'user_id' => $order->user_id,
                        'image_quota' => $order->image_quota,
                    ]);
                } elseif ($internalStatus === 'expired') {
                    $order->expired_at = now();
                }
                $order->save();
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update order from webhook', ['message' => $e->getMessage()]);
            throw new PaymentGatewayException('Gagal mengupdate status pesanan.');
        }
    }

    public function getUserOrder(User $user, int $orderId): Order
    {
        $order = Order::with('payment')->where('user_id', $user->id)->find($orderId);
        
        if (!$order) {
            throw new PaymentGatewayException('Order tidak ditemukan.', 404);
        }

        // Auto-sync status from Midtrans if still pending
        if ($order->status === 'pending') {
            $this->syncOrder($order);
        }

        return $order;
    }

    public function syncOrder(Order $order): void
    {
        $statusData = $this->midtransService->syncStatus($order);
        if (!empty($statusData)) {
            // Re-use notification logic but without signature verification
            // since we fetched it directly from Midtrans API
            $internalStatus = $this->midtransService->mapStatus($statusData);
            
            DB::beginTransaction();
            try {
                $this->updatePayment($order, $statusData);
                
                if ($order->status !== 'paid') {
                    $order->status = $internalStatus;
                    if ($internalStatus === 'paid') {
                        $order->paid_at = now();
                        Log::info('Payment successful (synced manually), quota added', [
                            'order_id' => $order->id,
                            'user_id' => $order->user_id,
                            'image_quota' => $order->image_quota,
                        ]);
                    } elseif ($internalStatus === 'expired') {
                        $order->expired_at = now();
                    }
                    $order->save();
                }
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Failed to sync order', ['message' => $e->getMessage()]);
            }
        }
    }

    protected function updatePayment(Order $order, array $payload): Payment
    {
        $payment = $order->payment ?? new Payment(['order_id' => $order->id, 'provider' => 'midtrans']);
        
        $payment->transaction_id = $payload['transaction_id'] ?? $payment->transaction_id;
        $payment->payment_type = $payload['payment_type'] ?? $payment->payment_type;
        $payment->transaction_status = $payload['transaction_status'] ?? $payment->transaction_status;
        $payment->fraud_status = $payload['fraud_status'] ?? $payment->fraud_status;
        
        if (isset($payload['gross_amount'])) {
            $payment->gross_amount = $payload['gross_amount'];
        } else {
            $payment->gross_amount = $payment->gross_amount ?? $order->amount;
        }

        $payment->signature_key = $payload['signature_key'] ?? $payment->signature_key;
        $payment->raw_response = $payload;

        $internalStatus = $this->midtransService->mapStatus($payload);
        if ($internalStatus === 'paid') {
            $payment->paid_at = $payment->paid_at ?? now();
        }

        $payment->save();

        return $payment;
    }
}
