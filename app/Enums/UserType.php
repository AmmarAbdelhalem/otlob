<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum UserType: string implements HasLabel, HasColor, HasIcon
{
    case CUSTOMER = 'customer';
    case MERCHANT = 'merchant';
    case COURIER = 'courier';
    case ADMIN = 'admin';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::CUSTOMER => 'Customer',
            self::MERCHANT => 'Merchant',
            self::COURIER => 'Courier / Driver',
            self::ADMIN => 'System Admin',
        };
    }

    public function getColor(): string | array | null
    {
        return match ($this) {
            self::CUSTOMER => 'gray',
            self::MERCHANT => 'info',
            self::COURIER => 'warning',
            self::ADMIN => 'danger',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::CUSTOMER => 'heroicon-m-user',
            self::MERCHANT => 'heroicon-m-building-storefront',
            self::COURIER => 'heroicon-m-truck',
            self::ADMIN => 'heroicon-m-shield-check',
        };
    }
}
