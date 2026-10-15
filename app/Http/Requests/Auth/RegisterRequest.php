<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserType;
use App\Enums\VehicleType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', new Enum(UserType::class)],
            'fcm_token' => ['nullable', 'string'],

            // Merchant specific fields
            'store_name' => ['required_if:role,merchant', 'string', 'max:255'],
            'commercial_registration_number' => ['required_if:role,merchant', 'string', 'max:100', 'unique:merchants,commercial_register_number'],
            'address_text' => ['required_if:role,merchant', 'string', 'max:500'],
            'latitude' => ['required_if:role,merchant', 'numeric', 'between:-90,90'],
            'longitude' => ['required_if:role,merchant', 'numeric', 'between:-180,180'],

            // Courier specific fields
            'vehicle_type' => ['required_if:role,courier', new Enum(VehicleType::class)],
            'max_load_capacity' => ['nullable', 'numeric', 'min:1'],
            'max_volume_capacity' => ['nullable', 'numeric', 'min:0.001'],
            'max_cod_limit' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
