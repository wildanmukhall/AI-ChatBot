<?php

namespace App\Services\Image;

use App\Models\User;
use App\Models\GeneratedImage;
use App\Services\Quota\ImageQuotaService;
use App\Jobs\GenerateImageJob;
use Exception;

class ImageGenerationService
{
    protected ImageQuotaService $quotaService;

    public function __construct(ImageQuotaService $quotaService)
    {
        $this->quotaService = $quotaService;
    }

    public function requestGeneration(User $user, array $data): GeneratedImage
    {
        if (!$this->quotaService->hasQuota($user)) {
            throw new Exception('Kuota generate gambar habis. Silakan pilih paket untuk melanjutkan.', 403);
        }

        $this->quotaService->consume($user);

        $image = GeneratedImage::create([
            'user_id' => $user->id,
            'prompt' => $data['prompt'],
            'negative_prompt' => $data['negative_prompt'] ?? null,
            'width' => $data['width'] ?? 512,
            'height' => $data['height'] ?? 512,
            'provider' => 'cloudflare_worker',
            'model' => '@cf/bytedance/stable-diffusion-xl-lightning',
            'status' => 'processing',
        ]);

        GenerateImageJob::dispatch($image);

        return $image;
    }

    public function getStatus(User $user, int $id): GeneratedImage
    {
        $image = GeneratedImage::where('id', $id)->where('user_id', $user->id)->first();

        if (!$image) {
            throw new Exception('Data generate gambar tidak ditemukan.', 404);
        }

        return $image;
    }

    public function complete(GeneratedImage $image, string $path, string $url, array $metadata = []): GeneratedImage
    {
        $image->update([
            'status' => 'completed',
            'image_path' => $path,
            'image_url' => $url,
            'metadata' => $metadata,
            'completed_at' => now(),
        ]);

        return $image;
    }

    public function fail(GeneratedImage $image, string $message): GeneratedImage
    {
        $image->update([
            'status' => 'failed',
            'error_message' => $message,
            'failed_at' => now(),
        ]);

        if (!$image->quota_refunded) {
            $this->quotaService->refund($image->user);
            $image->update(['quota_refunded' => true]);
        }

        return $image;
    }
}
