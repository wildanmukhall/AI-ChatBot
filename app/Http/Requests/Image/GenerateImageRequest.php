<?php

namespace App\Http\Requests\Image;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GenerateImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'prompt' => ['required', 'string', 'min:3', 'max:1000'],
            'negative_prompt' => ['nullable', 'string', 'max:1000'],
            'width' => ['nullable', 'integer', 'in:512,768,1024'],
            'height' => ['nullable', 'integer', 'in:512,768,1024'],
        ];
    }
}
