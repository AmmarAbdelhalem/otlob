<?php

namespace App\Filament\Resources\CourierProfileResource\Pages;

use App\Filament\Resources\CourierProfileResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCourierProfiles extends ListRecords
{
    protected static string $resource = CourierProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
