<?php

return [
    'required' => 'حقل :attribute مطلوب.',
    'string' => 'حقل :attribute يجب أن يكون نصاً.',
    'max' => [
        'string' => 'حقل :attribute يجب ألا يتجاوز :max حرفاً.',
    ],
    'min' => [
        'string' => 'حقل :attribute يجب ألا يقل عن :min أحرف.',
    ],
    'unique' => 'قيمة :attribute مسجلة بالفعل في النظام.',
    'email' => 'حقل :attribute يجب أن يكون بريداً إلكترونياً صحيحاً.',
    'confirmed' => 'تأكيد :attribute غير متطابق.',
    'attributes' => [
        'name' => 'الاسم',
        'phone' => 'رقم الهاتف',
        'email' => 'البريد الإلكتروني',
        'password' => 'كلمة المرور',
        'role' => 'نوع الحساب',
        'store_name' => 'اسم المتجر',
        'commercial_registration_number' => 'رقم السجل التجاري',
        'address_text' => 'العنوان بالتفصيل',
        'vehicle_type' => 'نوع مركبة التوصيل',
    ],
    'custom' => [
        'commercial_registration_number' => [
            'required_if' => 'رقم السجل التجاري مطلوب لتسجيل حساب التاجر.',
            'unique' => 'رقم السجل التجاري مسجل بالفعل لدى متجر آخر.',
            'min' => 'رقم السجل التجاري يجب ألا يقل عن 5 أرقام.',
        ],
        'phone' => [
            'unique' => 'رقم الهاتف المحمول مسجل لدينا بالفعل.',
            'regex' => 'رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقماً.',
        ],
        'store_name' => [
            'required_if' => 'اسم المتجر مطلوب لحسابات التجار.',
        ],
    ],
];
