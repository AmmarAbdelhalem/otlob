<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\OrderResource;
use App\Models\Order;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LatestOrdersWidget extends BaseWidget
{
    protected static ?int $sort = 3;

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Order::query()->latest()->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('order_code')
                    ->label('Order #')
                    ->weight('bold')
                    ->searchable(),

                Tables\Columns\TextColumn::make('customer.name')
                    ->label('Customer')
                    ->description(fn (Order $record): string => (string) ($record->customer?->phone ?? '')),

                Tables\Columns\TextColumn::make('merchant.store_name')
                    ->label('Merchant')
                    ->badge()
                    ->color('info')
                    ->placeholder('Split Order'),

                Tables\Columns\TextColumn::make('total_amount')
                    ->label('Total')
                    ->money('EGP')
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('order_status')
                    ->label('Status')
                    ->badge(),

                Tables\Columns\TextColumn::make('payment_type')
                    ->label('Method')
                    ->badge(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Placed At')
                    ->dateTime('M d, H:i'),
            ])
            ->actions([
                Tables\Actions\Action::make('open')
                    ->label('View')
                    ->icon('heroicon-m-eye')
                    ->url(fn (Order $record): string => OrderResource::getUrl('edit', ['record' => $record])),
            ])
            ->paginated(false);
    }
}
