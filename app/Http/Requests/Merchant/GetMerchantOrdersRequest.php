<?php

namespace App\Http\Requests\Merchant;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class GetMerchantOrdersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->merchant !== null;
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', new Enum(OrderStatus::class)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
