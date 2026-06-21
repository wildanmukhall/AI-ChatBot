<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Image\ImageGalleryIndexRequest;
use App\Services\Image\ImageGalleryService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class ImageGalleryController extends Controller
{
    protected ImageGalleryService $galleryService;

    public function __construct(ImageGalleryService $galleryService)
    {
        $this->galleryService = $galleryService;
    }

    public function index(ImageGalleryIndexRequest $request)
    {
        try {
            $user = $request->user();
            $filters = $request->validated();

            $images = $this->galleryService->getUserImages($user, $filters);

            // Mapping to hide verbose fields in list
            $data = $images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'prompt' => $image->prompt,
                    'image_url' => $image->image_url,
                    'provider' => $image->provider,
                    'model' => $image->model,
                    'status' => $image->status,
                    'width' => $image->width,
                    'height' => $image->height,
                    'created_at' => $image->created_at,
                    'completed_at' => $image->completed_at,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Daftar gambar berhasil diambil.',
                'data' => $data,
                'meta' => [
                    'current_page' => $images->currentPage(),
                    'last_page' => $images->lastPage(),
                    'per_page' => $images->perPage(),
                    'total' => $images->total(),
                ],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan.',
                'errors' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = request()->user();
            $image = $this->galleryService->getImageDetail($user, $id);

            return response()->json([
                'success' => true,
                'message' => 'Detail gambar berhasil diambil.',
                'data' => [
                    'id' => $image->id,
                    'prompt' => $image->prompt,
                    'negative_prompt' => $image->negative_prompt,
                    'image_path' => $image->image_path,
                    'image_url' => $image->image_url,
                    'provider' => $image->provider,
                    'model' => $image->model,
                    'status' => $image->status,
                    'width' => $image->width,
                    'height' => $image->height,
                    'seed' => $image->seed,
                    'error_message' => $image->error_message,
                    'metadata' => $image->metadata,
                    'started_at' => $image->started_at,
                    'completed_at' => $image->completed_at,
                    'failed_at' => $image->failed_at,
                    'created_at' => $image->created_at,
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gambar tidak ditemukan.',
                'errors' => null,
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan.',
                'errors' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = request()->user();
            $this->galleryService->deleteImage($user, $id);

            return response()->json([
                'success' => true,
                'message' => 'Gambar berhasil dihapus.',
                'data' => null,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gambar tidak ditemukan.',
                'errors' => null,
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus file gambar. Silakan coba lagi.',
                'errors' => $e->getMessage()
            ], 500);
        }
    }
}
