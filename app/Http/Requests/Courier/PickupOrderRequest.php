<?php

namespace App\Http\Requests\Courier;

use Illuminate\Foundation\Http\FormRequest;

class PickupOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->courierProfile !== null;
    }

    public function rules(): array
    {
        return [
            'courier_paid_merchant_cash' => ['nullable', 'boolean'],
        ];
    }
}
