<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class AddVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'make' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'year' => ['required', 'integer', 'min:1970', 'max:' . (date('Y') + 2)],
            'vin' => ['nullable', 'string', 'size:17'],
            'is_default' => ['nullable', 'boolean'],
        ];
    }
}
