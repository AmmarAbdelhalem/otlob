<?php

namespace App\Filament\Resources;

use App\Enums\ProductCondition;
use App\Filament\Resources\ProductResource\Pages;
use App\Filament\Resources\ProductResource\RelationManagers;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-cube';

    protected static ?string $navigationGroup = 'Auto Parts Catalog';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'name';

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'sku', 'oem_number'];
    }

    public static function getGlobalSearchResultDetails(\Illuminate\Database\Eloquent\Model $record): array
    {
        return [
            'SKU'      => $record->sku,
            'OEM'      => $record->oem_number,
            'Merchant' => $record->merchant?->store_name,
        ];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Section::make('General Information')
                            ->description('Basic auto part details, merchant assignment, and codes')
                            ->schema([
                                Forms\Components\TextInput::make('name')
                                    ->label('Product Name')
                                    ->required()
                                    ->maxLength(255)
                                    ->columnSpanFull(),

                                Forms\Components\Select::make('merchant_id')
                                    ->relationship('merchant', 'store_name')
                                    ->searchable()
                                    ->preload()
                                    ->required()
                                    ->label('Merchant / Store'),

                                Forms\Components\Select::make('condition')
                                    ->options(ProductCondition::class)
                                    ->required()
                                    ->native(false)
                                    ->default(ProductCondition::NEW->value)
                                    ->label('Part Condition'),

                                Forms\Components\TextInput::make('sku')
                                    ->label('SKU')
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->placeholder('e.g. BRK-PAD-TOY-01'),

                                Forms\Components\TextInput::make('oem_number')
                                    ->label('OEM Number')
                                    ->required()
                                    ->placeholder('Original Equipment Manufacturer #'),
                            ])
                            ->columns(2),

                        Forms\Components\Section::make('Product Overview & Specifications')
                            ->description('Detailed part descriptions, compatibility notes, and instructions')
                            ->schema([
                                Forms\Components\RichEditor::make('description')
                                    ->label('Embedded Part Description')
                                    ->required()
                                    ->fileAttachmentsDisk('public')
                                    ->fileAttachmentsDirectory('products/editor')
                                    ->fileAttachmentsVisibility('public')
                                    ->toolbarButtons([
                                        'attachFiles',
                                        'blockquote',
                                        'bold',
                                        'bulletList',
                                        'codeBlock',
                                        'h2',
                                        'h3',
                                        'italic',
                                        'link',
                                        'orderedList',
                                        'redo',
                                        'strike',
                                        'underline',
                                        'undo',
                                    ])
                                    ->columnSpanFull(),
                            ]),
                    ])
                    ->columnSpan(['lg' => 2]),

                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Section::make('Pricing & Inventory')
                            ->schema([
                                Forms\Components\TextInput::make('price')
                                    ->label('Price')
                                    ->required()
                                    ->numeric()
                                    ->prefix('EGP')
                                    ->minValue(0),

                                Forms\Components\TextInput::make('stock_quantity')
                                    ->label('Available Stock')
                                    ->required()
                                    ->numeric()
                                    ->default(0)
                                    ->minValue(0)
                                    ->helperText('Stock will decrement automatically on order creation'),

                                Forms\Components\Toggle::make('is_active')
                                    ->label('Visible in Marketplace')
                                    ->default(true)
                                    ->required(),
                            ]),

                        Forms\Components\Section::make('Weight & Dimensions')
                            ->description('For courier vehicle load calculation (Motorcycle/Car/Van)')
                            ->collapsed()
                            ->schema([
                                Forms\Components\TextInput::make('weight_kg')
                                    ->label('Weight')
                                    ->required()
                                    ->numeric()
                                    ->suffix('kg')
                                    ->default(1.0),

                                Forms\Components\TextInput::make('length_cm')
                                    ->label('Length')
                                    ->required()
                                    ->numeric()
                                    ->suffix('cm')
                                    ->default(10.0),

                                Forms\Components\TextInput::make('width_cm')
                                    ->label('Width')
                                    ->required()
                                    ->numeric()
                                    ->suffix('cm')
                                    ->default(10.0),

                                Forms\Components\TextInput::make('height_cm')
                                    ->label('Height')
                                    ->required()
                                    ->numeric()
                                    ->suffix('cm')
                                    ->default(10.0),
                            ])
                            ->columns(2),
                    ])
                    ->columnSpan(['lg' => 1]),
            ])
            ->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Part Name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn (Product $record): string => "SKU: {$record->sku} | OEM: {$record->oem_number}"),

                Tables\Columns\TextColumn::make('merchant.store_name')
                    ->label('Merchant')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('info'),

                Tables\Columns\TextColumn::make('price')
                    ->label('Price')
                    ->money('EGP')
                    ->sortable(),

                Tables\Columns\TextColumn::make('stock_quantity')
                    ->label('Stock')
                    ->sortable()
                    ->badge()
                    ->color(fn (int $state): string => match (true) {
                        $state <= 0 => 'danger',
                        $state <= 5 => 'warning',
                        default => 'success',
                    }),

                Tables\Columns\TextColumn::make('condition')
                    ->label('Condition')
                    ->badge(),

                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Active'),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Updated')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('merchant_id')
                    ->relationship('merchant', 'store_name')
                    ->label('Filter by Merchant')
                    ->searchable()
                    ->preload(),

                Tables\Filters\SelectFilter::make('condition')
                    ->options(ProductCondition::class)
                    ->label('Condition'),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueLabel('Active Only')
                    ->falseLabel('Inactive Only'),

                Tables\Filters\Filter::make('low_stock')
                    ->label('Low Stock (≤ 5)')
                    ->query(fn (Builder $query): Builder => $query->where('stock_quantity', '<=', 5)),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
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
            RelationManagers\CompatibilitiesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
