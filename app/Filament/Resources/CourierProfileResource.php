<?php

namespace App\Filament\Resources;

use App\Enums\VehicleType;
use App\Filament\Resources\CourierProfileResource\Pages;
use App\Models\CourierProfile;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CourierProfileResource extends Resource
{
    protected static ?string $model = CourierProfile::class;

    protected static ?string $navigationIcon = 'heroicon-o-truck';

    protected static ?string $navigationGroup = 'Operations & Logistics';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Driver & Vehicle Profile')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\Select::make('user_id')
                                    ->relationship('user', 'name', fn ($query) => $query->where('role', 'courier'))
                                    ->searchable()
                                    ->preload()
                                    ->required()
                                    ->label('Courier Account'),
                                Forms\Components\Select::make('vehicle_type')
                                    ->options(VehicleType::class)
                                    ->required()
                                    ->native(false)
                                    ->label('Vehicle Class'),
                            ]),
                    ]),

                Forms\Components\Section::make('Capacity Limits & Delivery Volume')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('max_load_capacity')
                                    ->label('Max Weight Capacity')
                                    ->numeric()
                                    ->suffix('kg')
                                    ->default(25),
                                Forms\Components\TextInput::make('max_volume_capacity')
                                    ->label('Max Volume')
                                    ->numeric()
                                    ->suffix('m³')
                                    ->default(0.5),
                            ]),
                    ]),

                Forms\Components\Section::make('Cash on Delivery (COD) & Risk Management')
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\TextInput::make('max_cod_limit')
                                    ->label('Max Allowed COD Limit')
                                    ->numeric()
                                    ->prefix('EGP')
                                    ->default(5000),
                                Forms\Components\TextInput::make('collected_cash_in_hand')
                                    ->label('Current Cash In-Hand')
                                    ->required()
                                    ->numeric()
                                    ->prefix('EGP')
                                    ->default(0),
                                Forms\Components\Toggle::make('is_cod_suspended')
                                    ->label('Suspend COD (Risk Alert)')
                                    ->helperText('Prevents assigning new COD orders to this courier')
                                    ->default(false),
                            ]),
                        Forms\Components\Toggle::make('is_online')
                            ->label('Active On Duty / Online')
                            ->default(false),
                    ]),

                Forms\Components\Section::make('Real-Time Location')
                    ->collapsed()
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('current_lat')
                                    ->label('Current Latitude')
                                    ->numeric(),
                                Forms\Components\TextInput::make('current_lng')
                                    ->label('Current Longitude')
                                    ->numeric(),
                            ]),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Courier Name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn (CourierProfile $record): string => (string) ($record->user?->phone ?? '')),

                Tables\Columns\TextColumn::make('vehicle_type')
                    ->label('Vehicle')
                    ->badge(),

                Tables\Columns\TextColumn::make('collected_cash_in_hand')
                    ->label('Cash in Hand')
                    ->money('EGP')
                    ->sortable()
                    ->badge()
                    ->color(fn (CourierProfile $record): string => ($record->max_cod_limit && $record->collected_cash_in_hand >= $record->max_cod_limit * 0.8)
                        ? 'danger'
                        : 'success'),

                Tables\Columns\TextColumn::make('max_cod_limit')
                    ->label('COD Limit')
                    ->money('EGP')
                    ->sortable(),

                Tables\Columns\ToggleColumn::make('is_online')
                    ->label('Online'),

                Tables\Columns\ToggleColumn::make('is_cod_suspended')
                    ->label('COD Suspended'),

                Tables\Columns\TextColumn::make('location')
                    ->label('Map')
                    ->state(fn (CourierProfile $record): string => $record->current_lat && $record->current_lng ? 'View on Maps' : 'No GPS')
                    ->badge()
                    ->color(fn (CourierProfile $record) => $record->current_lat && $record->current_lng ? 'info' : 'gray')
                    ->url(fn (CourierProfile $record): ?string => $record->current_lat && $record->current_lng
                        ? "https://www.google.com/maps?q={$record->current_lat},{$record->current_lng}"
                        : null, shouldOpenInNewTab: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_online')
                    ->label('Duty Status')
                    ->boolean()
                    ->trueLabel('Online Only')
                    ->falseLabel('Offline Only'),
                Tables\Filters\TernaryFilter::make('is_cod_suspended')
                    ->label('COD Risk Suspension')
                    ->boolean(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCourierProfiles::route('/'),
            'create' => Pages\CreateCourierProfile::route('/create'),
            'edit' => Pages\EditCourierProfile::route('/{record}/edit'),
        ];
    }
}
