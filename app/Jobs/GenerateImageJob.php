<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\GeneratedImage;
use App\Services\AI\CloudflareImageService;
use App\Services\Image\ImageGenerationService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Exception;

class GenerateImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public GeneratedImage $image;

    /**
     * Create a new job instance.
     */
    public function __construct(GeneratedImage $image)
    {
        $this->image = $image;
    }

    /**
     * Execute the job.
     */
    public function handle(CloudflareImageService $cloudflareService, ImageGenerationService $generationService): void
    {
        try {
            $this->image->update(['started_at' => now()]);

            $binaryImage = $cloudflareService->generateImage($this->image->prompt, [
                'width' => $this->image->width,
                'height' => $this->image->height,
            ]);

            $filename = $this->image->id . '.png';
            $path = 'generated-images/' . $this->image->user_id . '/' . $filename;

            Storage::disk('public')->put($path, $binaryImage);

            $url = Storage::url($path);

            $generationService->complete($this->image, $path, url($url));

        } catch (Exception $e) {
            Log::error('GenerateImageJob failed: ' . $e->getMessage(), [
                'generated_image_id' => $this->image->id,
                'user_id' => $this->image->user_id,
            ]);

            $generationService->fail($this->image, $e->getMessage());
        }
    }
}
