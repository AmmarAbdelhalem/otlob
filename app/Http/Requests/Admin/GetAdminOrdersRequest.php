<?php

namespace App\Http\Requests\Admin;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class GetAdminOrdersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === \App\Enums\UserType::ADMIN || $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', new Enum(OrderStatus::class)],
            'parent_only' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
