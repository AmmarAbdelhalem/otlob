<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MerchantResource\Pages;
use App\Models\Merchant;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MerchantResource extends Resource
{
    protected static ?string $model = Merchant::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-storefront';

    protected static ?string $navigationGroup = 'Vendors & Fleet';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'store_name';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Store Identity')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('store_name')
                                    ->label('Store / Workshop Name')
                                    ->required(),
                                Forms\Components\Select::make('user_id')
                                    ->relationship('user', 'name')
                                    ->label('Merchant Owner Account')
                                    ->searchable()
                                    ->preload()
                                    ->required(),
                                Forms\Components\TextInput::make('commercial_register_number')
                                    ->label('Commercial Registration Number (CRN)')
                                    ->required(),
                                Forms\Components\Toggle::make('is_active')
                                    ->label('Store Verified & Active')
                                    ->default(true)
                                    ->required(),
                            ]),
                    ]),

                Forms\Components\Section::make('Location & Workshop Address')
                    ->schema([
                        Forms\Components\TextInput::make('address_text')
                            ->label('Physical Street Address')
                            ->required()
                            ->columnSpanFull(),
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('latitude')
                                    ->label('GPS Latitude')
                                    ->required()
                                    ->numeric(),
                                Forms\Components\TextInput::make('longitude')
                                    ->label('GPS Longitude')
                                    ->required()
                                    ->numeric(),
                            ]),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('store_name')
                    ->label('Store Name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn (Merchant $record): string => "CRN: {$record->commercial_register_number}"),

                Tables\Columns\TextColumn::make('user.name')
                    ->label('Owner')
                    ->searchable()
                    ->description(fn (Merchant $record): string => (string) ($record->user?->phone ?? '')),

                Tables\Columns\TextColumn::make('products_count')
                    ->label('Products')
                    ->counts('products')
                    ->badge()
                    ->color('info')
                    ->sortable(),

                Tables\Columns\TextColumn::make('address_text')
                    ->label('Address')
                    ->limit(35)
                    ->searchable(),

                Tables\Columns\TextColumn::make('location')
                    ->label('Map')
                    ->state(fn (Merchant $record): string => 'Open Map')
                    ->badge()
                    ->color('gray')
                    ->url(fn (Merchant $record): string => "https://www.google.com/maps?q={$record->latitude},{$record->longitude}", shouldOpenInNewTab: true),

                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Active'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Registered')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
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
            'index' => Pages\ListMerchants::route('/'),
            'create' => Pages\CreateMerchant::route('/create'),
            'edit' => Pages\EditMerchant::route('/{record}/edit'),
        ];
    }
}
