<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum PaymentType: string implements HasLabel, HasColor, HasIcon
{
    case COD = 'cod';
    case CARD = 'card';
    case WALLET = 'wallet';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::COD => 'Cash On Delivery',
            self::CARD => 'Credit / Debit Card',
            self::WALLET => 'In-App Wallet',
        };
    }

    public function getColor(): string | array | null
    {
        return match ($this) {
            self::COD => 'warning',
            self::CARD => 'info',
            self::WALLET => 'success',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::COD => 'heroicon-m-banknotes',
            self::CARD => 'heroicon-m-credit-card',
            self::WALLET => 'heroicon-m-wallet',
        };
    }
}
