<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum ProductCondition: string implements HasLabel, HasColor, HasIcon
{
    case NEW = 'new';
    case USED = 'used';
    case REFURBISHED = 'refurbished';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::NEW => 'Brand New',
            self::USED => 'Used',
            self::REFURBISHED => 'Refurbished',
        };
    }

    public function getColor(): string | array | null
    {
        return match ($this) {
            self::NEW => 'success',
            self::USED => 'warning',
            self::REFURBISHED => 'info',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::NEW => 'heroicon-m-sparkles',
            self::USED => 'heroicon-m-wrench-screwdriver',
            self::REFURBISHED => 'heroicon-m-arrow-path-rounded-square',
        };
    }
}
