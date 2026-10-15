<?php

namespace App\Http\Requests\Courier;

use App\Enums\RemittanceMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class CreateRemittanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1'],
            'method' => ['required', new Enum(RemittanceMethod::class)],
            'proof_receipt' => ['nullable', 'file', 'image', 'max:5120'], // Max 5MB
        ];
    }
}
