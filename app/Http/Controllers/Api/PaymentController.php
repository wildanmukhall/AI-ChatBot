<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\CheckoutRequest;
use App\Models\Order;
use App\Services\Payment\PaymentService;
use App\Exceptions\PaymentGatewayException;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * GET /api/v1/payments
     * Riwayat order milik user yang sedang login.
     */
    public function index(\Illuminate\Http\Request $request)
    {
        try {
            $user   = $request->user();
            $orders = \App\Models\Order::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get(['id', 'order_code', 'amount', 'image_quota', 'status', 'paid_at', 'created_at']);

            return response()->json([
                'success' => true,
                'message' => 'Riwayat order berhasil diambil.',
                'data'    => $orders,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada sistem.',
                'errors'  => null,
            ], 500);
        }
    }

    public function checkout(CheckoutRequest $request)

    {
        try {
            $user = $request->user();
            $result = $this->paymentService->checkout($user, $request->pricing_plan_id);

            return response()->json([
                'success' => true,
                'message' => 'Snap token berhasil dibuat.',
                'data' => $result
            ]);
        } catch (PaymentGatewayException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => null
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada sistem.',
                'errors' => null
            ], 500);
        }
    }

    public function show(Request $request, $orderId)
    {
        try {
            $user = $request->user();
            $order = $this->paymentService->getUserOrder($user, $orderId);

            return response()->json([
                'success' => true,
                'message' => 'Detail payment berhasil diambil.',
                'data' => [
                    'order' => [
                        'id' => $order->id,
                        'order_code' => $order->order_code,
                        'amount' => $order->amount,
                        'image_quota' => $order->image_quota,
                        'status' => $order->status,
                        'paid_at' => $order->paid_at,
                    ],
                    'payment' => $order->payment ? [
                        'provider' => $order->payment->provider,
                        'transaction_id' => $order->payment->transaction_id,
                        'payment_type' => $order->payment->payment_type,
                        'transaction_status' => $order->payment->transaction_status,
                        'fraud_status' => $order->payment->fraud_status,
                    ] : null,
                ]
            ]);
        } catch (PaymentGatewayException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => null
            ], $e->getCode() ?: 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada sistem.',
                'errors' => null
            ], 500);
        }
    }

    public function notification(Request $request)
    {
        try {
            $payload = $request->all();
            $this->paymentService->handleMidtransNotification($payload);

            return response()->json([
                'success' => true,
                'message' => 'Notification processed.',
                'data' => null
            ]);
        } catch (PaymentGatewayException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => null
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada sistem.',
                'errors' => null
            ], 500);
        }
    }

    public function sync(Request $request, $id)
    {
        try {
            $user = $request->user();
            $order = Order::where('user_id', $user->id)->findOrFail($id);
            
            $syncedOrder = $this->paymentService->syncOrder($order);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil sinkronisasi status pesanan.',
                'data' => [
                    'order' => [
                        'id' => $syncedOrder->id,
                        'order_code' => $syncedOrder->order_code,
                        'status' => $syncedOrder->status,
                        'amount' => $syncedOrder->amount,
                        'image_quota' => $syncedOrder->image_quota,
                        'created_at' => $syncedOrder->created_at,
                        'paid_at' => $syncedOrder->paid_at,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal sinkronisasi pesanan.',
                'errors' => null
            ], 500);
        }
    }
}
