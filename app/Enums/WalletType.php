<?php

namespace App\Enums;

enum WalletType: string
{
    case CUSTOMER = 'customer';
    case MERCHANT = 'merchant';
    case COURIER = 'courier';
    case PLATFORM_ESCROW = 'platform_escrow';
    case PLATFORM_EARNINGS = 'platform_earnings';
}
