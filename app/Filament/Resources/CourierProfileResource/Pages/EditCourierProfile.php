<?php

namespace App\Filament\Resources\CourierProfileResource\Pages;

use App\Filament\Resources\CourierProfileResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCourierProfile extends EditRecord
{
    protected static string $resource = CourierProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
