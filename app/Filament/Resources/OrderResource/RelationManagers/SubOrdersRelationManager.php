<?php

namespace App\Filament\Resources\OrderResource\RelationManagers;

use App\Enums\OrderStatus;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class SubOrdersRelationManager extends RelationManager
{
    protected static string $relationship = 'subOrders';

    protected static ?string $title = 'Sub-Orders (by Merchant)';

    protected static ?string $modelLabel = 'Sub-Order';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('order_code')
                    ->disabled(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('order_code')
            ->columns([
                Tables\Columns\TextColumn::make('order_code')
                    ->label('Code')
                    ->fontFamily('mono')
                    ->searchable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('merchant.store_name')
                    ->label('Merchant')
                    ->searchable(),

                Tables\Columns\TextColumn::make('order_status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (OrderStatus $state) => $state->getLabel())
                    ->color(fn (OrderStatus $state) => $state->getColor()),

                Tables\Columns\TextColumn::make('total_amount')
                    ->label('Total')
                    ->money('EGP')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->since()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('order_status')
                    ->options(OrderStatus::class)
                    ->label('Status'),
            ])
            ->headerActions([
                // Sub-orders are created by the system
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                //
            ])
            ->emptyStateHeading('No Sub-Orders')
            ->emptyStateDescription('This parent order has no merchant sub-orders yet.')
            ->emptyStateIcon('heroicon-o-building-storefront');
    }
}

