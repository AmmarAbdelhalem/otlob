<?php

return [
    'required' => 'The :attribute field is required.',
    'string' => 'The :attribute must be a string.',
    'max' => [
        'string' => 'The :attribute must not exceed :max characters.',
    ],
    'min' => [
        'string' => 'The :attribute must be at least :min characters.',
    ],
    'unique' => 'The :attribute has already been taken.',
    'email' => 'The :attribute must be a valid email address.',
    'confirmed' => 'The :attribute confirmation does not match.',
    'attributes' => [
        'name' => 'Name',
        'phone' => 'Phone',
        'email' => 'Email',
        'password' => 'Password',
        'role' => 'Account Role',
        'store_name' => 'Store Name',
        'commercial_registration_number' => 'Commercial Registration Number',
        'address_text' => 'Address',
        'vehicle_type' => 'Vehicle Type',
    ],
    'custom' => [
        'commercial_registration_number' => [
            'required_if' => 'The Commercial Registration number is required for merchant onboarding.',
            'unique' => 'This Commercial Registration number is already registered.',
        ],
    ],
];
