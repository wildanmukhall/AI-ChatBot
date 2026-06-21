<?php

namespace App\Services\Image;

use App\Models\User;
use App\Models\GeneratedImage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ImageGalleryService
{
    /**
     * Mengambil daftar generated images milik user.
     */
    public function getUserImages(User $user, array $filters = [])
    {
        $query = GeneratedImage::where('user_id', $user->id);

        if (!empty($filters['search'])) {
            $query->where('prompt', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        $query->orderBy($sortBy, $sortOrder);

        $perPage = $filters['per_page'] ?? 12;
        $perPage = min((int) $perPage, 50);

        return $query->paginate($perPage);
    }

    /**
     * Mengambil detail gambar.
     */
    public function getImageDetail(User $user, int $imageId): GeneratedImage
    {
        return GeneratedImage::where('user_id', $user->id)->findOrFail($imageId);
    }

    /**
     * Menghapus gambar dan file storage.
     */
    public function deleteImage(User $user, int $imageId): void
    {
        $image = GeneratedImage::where('user_id', $user->id)->findOrFail($imageId);

        if ($image->image_path) {
            try {
                if (Storage::disk('public')->exists($image->image_path)) {
                    Storage::disk('public')->delete($image->image_path);
                }
            } catch (\Exception $e) {
                Log::error('Gagal menghapus file gambar', [
                    'user_id' => $user->id,
                    'generated_image_id' => $image->id,
                    'image_path' => $image->image_path,
                    'error_message' => $e->getMessage(),
                ]);
            }
        }

        $image->delete();
    }
}
