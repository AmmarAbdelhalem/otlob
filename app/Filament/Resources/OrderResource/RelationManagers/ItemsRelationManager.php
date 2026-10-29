<?php

namespace App\Filament\Resources\OrderResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    protected static ?string $title = 'Order Items';

    protected static ?string $modelLabel = 'Item';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('quantity')
                    ->numeric()
                    ->required(),
                Forms\Components\TextInput::make('unit_price')
                    ->numeric()
                    ->prefix('EGP')
                    ->required(),
                Forms\Components\TextInput::make('total_price')
                    ->numeric()
                    ->prefix('EGP')
                    ->required(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                Tables\Columns\TextColumn::make('product.name')
                    ->label('Product')
                    ->searchable()
                    ->limit(40),

                Tables\Columns\TextColumn::make('product.sku')
                    ->label('SKU')
                    ->fontFamily('mono')
                    ->badge()
                    ->color('gray'),

                Tables\Columns\TextColumn::make('quantity')
                    ->label('Qty')
                    ->numeric()
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('unit_price')
                    ->label('Unit Price')
                    ->money('EGP')
                    ->sortable(),

                Tables\Columns\TextColumn::make('total_price')
                    ->label('Total')
                    ->money('EGP')
                    ->sortable()
                    ->weight(\Filament\Support\Enums\FontWeight::Bold),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                // Items are managed through checkout — no create action
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                //
            ])
            ->emptyStateHeading('No Items')
            ->emptyStateDescription('This order has no items yet.')
            ->emptyStateIcon('heroicon-o-shopping-bag');
    }
}

