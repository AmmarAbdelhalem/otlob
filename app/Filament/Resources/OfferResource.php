<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OfferResource\Pages;
use App\Models\Offer;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OfferResource extends Resource
{
    protected static ?string $model = Offer::class;

    protected static ?string $navigationIcon = 'heroicon-o-ticket';

    protected static ?string $navigationGroup = 'Marketing & CMS';

    protected static ?int $navigationSort = 2;

    protected static ?string $recordTitleAttribute = 'code';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Coupon & Promotion Setup')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('code')
                                    ->label('Coupon Code')
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->extraInputAttributes(['style' => 'text-transform: uppercase; font-weight: bold;'])
                                    ->dehydrateStateUsing(fn ($state) => strtoupper($state)),
                                Forms\Components\TextInput::make('title')
                                    ->label('Campaign Title')
                                    ->required(),
                            ]),

                        Forms\Components\RichEditor::make('description')
                            ->label('Terms & Promotional Conditions')
                            ->fileAttachmentsDisk('public')
                            ->fileAttachmentsDirectory('offers/editor')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Discount Rules & Limits')
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\Select::make('discount_type')
                                    ->label('Discount Type')
                                    ->options([
                                        'percentage' => 'Percentage (%)',
                                        'fixed' => 'Fixed Amount (EGP)',
                                    ])
                                    ->required()
                                    ->native(false)
                                    ->default('percentage'),
                                Forms\Components\TextInput::make('discount_value')
                                    ->label('Discount Value')
                                    ->required()
                                    ->numeric()
                                    ->minValue(1),
                                Forms\Components\TextInput::make('max_discount_amount')
                                    ->label('Max Discount Cap')
                                    ->numeric()
                                    ->prefix('EGP')
                                    ->helperText('Maximum discount cap for percentage offers'),
                            ]),

                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\TextInput::make('min_order_amount')
                                    ->label('Minimum Order Value')
                                    ->required()
                                    ->numeric()
                                    ->default(0)
                                    ->prefix('EGP'),
                                Forms\Components\TextInput::make('usage_limit')
                                    ->label('Global Usage Limit')
                                    ->numeric()
                                    ->placeholder('Unlimited'),
                                Forms\Components\TextInput::make('used_count')
                                    ->label('Total Times Claimed')
                                    ->numeric()
                                    ->default(0)
                                    ->disabled()
                                    ->dehydrated(false),
                            ]),

                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\DateTimePicker::make('start_date')
                                    ->label('Campaign Start Date')
                                    ->native(false),
                                Forms\Components\DateTimePicker::make('end_date')
                                    ->label('Campaign End Date')
                                    ->native(false),
                            ]),

                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\Toggle::make('is_active')
                                    ->label('Active Campaign')
                                    ->default(true)
                                    ->required(),
                                Forms\Components\Toggle::make('is_coupon_only')
                                    ->label('Requires Promo Code at Checkout')
                                    ->helperText('If false, applies automatically as an active discount banner')
                                    ->default(true)
                                    ->required(),
                            ]),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')
                    ->label('Code')
                    ->badge()
                    ->color('primary')
                    ->searchable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('title')
                    ->label('Campaign')
                    ->searchable(),
                Tables\Columns\TextColumn::make('discount_value')
                    ->label('Discount')
                    ->formatStateUsing(fn ($record) => $record->discount_type === 'percentage'
                        ? "{$record->discount_value}%"
                        : "{$record->discount_value} EGP")
                    ->sortable(),
                Tables\Columns\TextColumn::make('min_order_amount')
                    ->label('Min Order')
                    ->money('EGP')
                    ->sortable(),
                Tables\Columns\TextColumn::make('used_count')
                    ->label('Redemptions')
                    ->formatStateUsing(fn ($record) => $record->usage_limit
                        ? "{$record->used_count} / {$record->usage_limit}"
                        : "{$record->used_count}")
                    ->sortable(),
                Tables\Columns\TextColumn::make('end_date')
                    ->label('Expires')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->placeholder('Never'),
                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Active'),
                Tables\Columns\IconColumn::make('is_coupon_only')
                    ->label('Coupon Code Only')
                    ->boolean(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
                    ->boolean(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            'index' => Pages\ListOffers::route('/'),
            'create' => Pages\CreateOffer::route('/create'),
            'edit' => Pages\EditOffer::route('/{record}/edit'),
        ];
    }
}
