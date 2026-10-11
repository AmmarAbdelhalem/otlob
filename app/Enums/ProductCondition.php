<?php

namespace App\Enums;

enum ProductCondition: string
{
    case NEW = 'new';
    case USED = 'used';
    case REFURBISHED = 'refurbished';
}
