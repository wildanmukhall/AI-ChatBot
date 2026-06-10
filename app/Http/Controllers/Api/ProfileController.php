<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Services\Profile\ProfileService;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    protected ProfileService $profileService;

    public function __construct(ProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    /**
     * FR-01 — Lihat Profile User
     *
     * @return JsonResponse
     */
    public function show(): JsonResponse
    {
        $user = auth()->user();
        $data = $this->profileService->getProfile($user);

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diambil.',
            'data' => $data,
        ]);
    }

    /**
     * FR-02 — Update Nama User
     *
     * @param UpdateProfileRequest $request
     * @return JsonResponse
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = auth()->user();
        $data = $this->profileService->updateProfile($user, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diperbarui.',
            'data' => $data,
        ]);
    }

    /**
     * FR-03 — Update Password User
     *
     * @param UpdatePasswordRequest $request
     * @return JsonResponse
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = auth()->user();
        $this->profileService->updatePassword(
            $user,
            $request->validated('current_password'),
            $request->validated('password')
        );

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui.',
            'data' => null,
        ]);
    }

    /**
     * FR-04 — Menampilkan Statistik Dasar User
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        $user = auth()->user();
        $data = $this->profileService->getStats($user);

        return response()->json([
            'success' => true,
            'message' => 'Statistik profile berhasil diambil.',
            'data' => $data,
        ]);
    }
}
