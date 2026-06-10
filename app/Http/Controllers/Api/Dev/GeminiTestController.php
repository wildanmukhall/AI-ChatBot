<?php

namespace App\Http\Controllers\Api\Dev;

use App\Http\Controllers\Controller;
use App\Facades\Gemini;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GeminiTestController extends Controller
{
    /**
     * FR-12 — Endpoint Testing Internal Opsional
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function test(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => 'required|string|min:2'
        ]);

        $prompt = $request->input('prompt');
        $text = Gemini::generateText($prompt);

        return response()->json([
            'success' => true,
            'message' => 'Gemini berhasil merespons.',
            'data' => [
                'text' => $text
            ]
        ]);
    }
}
