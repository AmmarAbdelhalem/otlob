<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum VehicleType: string implements HasLabel, HasColor, HasIcon
{
    case BIKE = 'bike';
    case CAR = 'car';
    case VAN = 'van';
    case TRUCK = 'truck';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::BIKE => 'Motorcycle / Bike',
            self::CAR => 'Sedan / Car',
            self::VAN => 'Delivery Van',
            self::TRUCK => 'Heavy Truck',
        };
    }

    public function getColor(): string | array | null
    {
        return match ($this) {
            self::BIKE => 'info',
            self::CAR => 'primary',
            self::VAN => 'warning',
            self::TRUCK => 'danger',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::BIKE => 'heroicon-m-bolt',
            self::CAR => 'heroicon-m-truck',
            self::VAN => 'heroicon-m-archive-box',
            self::TRUCK => 'heroicon-m-cube',
        };
    }
}
