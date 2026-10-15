<?php

namespace App\Http\Requests\Merchant;

use App\Enums\ProductCondition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class CreateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100'],
            'oem_number' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'weight_kg' => ['required', 'numeric', 'min:0.01'],
            'length_cm' => ['required', 'numeric', 'min:0.1'],
            'width_cm' => ['required', 'numeric', 'min:0.1'],
            'height_cm' => ['required', 'numeric', 'min:0.1'],
            'condition' => ['required', new Enum(ProductCondition::class)],
            'is_active' => ['nullable', 'boolean'],

            // Compatibilities array
            'compatibilities' => ['nullable', 'array'],
            'compatibilities.*.make' => ['required_with:compatibilities', 'string', 'max:100'],
            'compatibilities.*.model' => ['required_with:compatibilities', 'string', 'max:100'],
            'compatibilities.*.year_from' => ['required_with:compatibilities', 'integer', 'min:1970'],
            'compatibilities.*.year_to' => ['required_with:compatibilities', 'integer', 'gte:compatibilities.*.year_from'],
        ];
    }
}
