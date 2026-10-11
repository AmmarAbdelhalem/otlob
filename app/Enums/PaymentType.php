<?php

namespace App\Enums;

enum PaymentType: string
{
    case COD = 'cod';
    case CARD = 'card';
    case WALLET = 'wallet';
}
