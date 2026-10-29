<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class CompatibilitiesRelationManager extends RelationManager
{
    protected static string $relationship = 'compatibilities';

    protected static ?string $title = 'Vehicle Compatibilities';

    protected static ?string $modelLabel = 'Compatibility';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Grid::make(2)
                    ->schema([
                        Forms\Components\TextInput::make('make')
                            ->label('Make')
                            ->placeholder('Toyota')
                            ->required()
                            ->maxLength(100),

                        Forms\Components\TextInput::make('model')
                            ->label('Model')
                            ->placeholder('Camry')
                            ->required()
                            ->maxLength(100),

                        Forms\Components\TextInput::make('year_from')
                            ->label('Year From')
                            ->numeric()
                            ->minValue(1960)
                            ->maxValue((int) date('Y') + 2)
                            ->required(),

                        Forms\Components\TextInput::make('year_to')
                            ->label('Year To')
                            ->numeric()
                            ->minValue(1960)
                            ->maxValue((int) date('Y') + 2)
                            ->required(),
                    ]),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('make')
            ->columns([
                Tables\Columns\TextColumn::make('make')
                    ->label('Make')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('model')
                    ->label('Model')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('year_from')
                    ->label('Year Range')
                    ->state(fn ($record) => "{$record->year_from} – {$record->year_to}")
                    ->badge()
                    ->color('info'),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No Compatibilities')
            ->emptyStateDescription('Add vehicle fitment data to help customers find compatible parts.')
            ->emptyStateIcon('heroicon-o-truck');
    }
}
