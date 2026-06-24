<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Image\GenerateImageRequest;
use App\Services\Image\ImageGenerationService;
use Exception;

class ImageGenerationController extends Controller
{
    protected ImageGenerationService $imageGenerationService;

    public function __construct(ImageGenerationService $imageGenerationService)
    {
        $this->imageGenerationService = $imageGenerationService;
    }

    public function generate(GenerateImageRequest $request)
    {
        try {
            $user = $request->user();
            $image = $this->imageGenerationService->requestGeneration($user, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Generate gambar sedang diproses.',
                'data' => [
                    'id' => $image->id,
                    'prompt' => $image->prompt,
                    'negative_prompt' => $image->negative_prompt,
                    'status' => $image->status,
                    'provider' => $image->provider,
                    'width' => $image->width,
                    'height' => $image->height,
                    'image_url' => $image->image_url,
                    'created_at' => $image->created_at,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => null
            ], $e->getCode() ?: 400);
        }
    }

    public function status($id)
    {
        try {
            $user = request()->user();
            $image = $this->imageGenerationService->getStatus($user, $id);

            return response()->json([
                'success' => true,
                'message' => 'Status generate gambar berhasil diambil.',
                'data' => [
                    'id' => $image->id,
                    'status' => $image->status,
                    'image_url' => $image->image_url,
                    'error_message' => $image->error_message,
                    'created_at' => $image->created_at,
                    'completed_at' => $image->completed_at,
                    'failed_at' => $image->failed_at,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => null
            ], $e->getCode() ?: 404);
        }
    }

    public function quota()
    {
        try {
            $user = request()->user();
            $quotaService = app(\App\Services\Quota\ImageQuotaService::class);
            $remaining = $quotaService->getRemainingQuota($user);

            return response()->json([
                'success' => true,
                'message' => 'Kuota berhasil diambil.',
                'data' => [
                    'remaining' => $remaining,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => null
            ], 500);
        }
    }
}
