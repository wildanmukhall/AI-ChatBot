<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreChatMessageRequest
 *
 * Validasi request untuk mengirim pesan ke chat session.
 * Message wajib diisi, minimal 2 karakter, maksimal 5000 karakter.
 */
class StoreChatMessageRequest extends FormRequest
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
            'message' => ['required', 'string', 'min:2', 'max:5000'],
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'message.required' => 'Pesan wajib diisi.',
            'message.string' => 'Pesan harus berupa teks.',
            'message.min' => 'Pesan minimal 2 karakter.',
            'message.max' => 'Pesan maksimal 5000 karakter.',
        ];
    }
}
