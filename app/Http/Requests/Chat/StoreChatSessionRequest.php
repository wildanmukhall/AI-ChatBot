<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreChatSessionRequest
 *
 * Validasi request untuk membuat chat session baru.
 * Title bersifat opsional — jika tidak dikirim,
 * ChatService akan menggunakan default "Percakapan Baru".
 */
class StoreChatSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Auth ditangani oleh middleware auth:sanctum
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'title.string' => 'Judul harus berupa teks.',
            'title.max' => 'Judul maksimal 255 karakter.',
        ];
    }
}
