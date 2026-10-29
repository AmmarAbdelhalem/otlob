<?php

namespace App\Http\Requests\Courier;

use Illuminate\Foundation\Http\FormRequest;

class ToggleStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->courierProfile !== null;
    }

    public function rules(): array
    {
        return [
            'is_online' => ['nullable', 'boolean'],
        ];
    }
}
