<?php

namespace App\Enums;

enum UserType: string
{
    case CUSTOMER = 'customer';
    case MERCHANT = 'merchant';
    case COURIER = 'courier';
    case ADMIN = 'admin';
}
