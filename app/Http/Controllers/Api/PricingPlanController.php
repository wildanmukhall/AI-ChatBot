<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PricingPlan;

class PricingPlanController extends Controller
{
    /**
     * GET /api/v1/pricing-plans
     * Return all active pricing plans.
     */
    public function index()
    {
        $plans = PricingPlan::where('is_active', true)
            ->orderBy('price', 'asc')
            ->get(['id', 'name', 'price', 'image_quota']);

        return response()->json([
            'success' => true,
            'message' => 'Daftar pricing plan berhasil diambil.',
            'data'    => $plans,
        ]);
    }
}
