<?php

namespace App\Filament\Resources;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationGroup = 'Operations & Logistics';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'order_code';

    public static function getGloballySearchableAttributes(): array
    {
        return ['order_code', 'customer.name', 'customer.email', 'customer.phone'];
    }

    public static function getGlobalSearchResultDetails(\Illuminate\Database\Eloquent\Model $record): array
    {
        return [
            'Customer' => $record->customer?->name,
            'Status'   => $record->order_status?->getLabel(),
            'Total'    => 'EGP ' . number_format($record->total_amount, 2),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        $count = static::getModel()::where('order_status', OrderStatus::PENDING->value)->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'warning';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Section::make('Order Reference & Parties')
                            ->schema([
                                Forms\Components\Grid::make(2)
                                    ->schema([
                                        Forms\Components\TextInput::make('order_code')
                                            ->label('Order Reference Code')
                                            ->disabled()
                                            ->dehydrated(false)
                                            ->placeholder('Auto-generated (e.g. ORD-20261029-XXXX)'),

                                        Forms\Components\Select::make('order_status')
                                            ->options(OrderStatus::class)
                                            ->required()
                                            ->native(false)
                                            ->label('Current Order State'),
                                    ]),

                                Forms\Components\Grid::make(3)
                                    ->schema([
                                        Forms\Components\Select::make('customer_id')
                                            ->relationship('customer', 'name')
                                            ->searchable()
                                            ->preload()
                                            ->required()
                                            ->label('Customer'),

                                        Forms\Components\Select::make('merchant_id')
                                            ->relationship('merchant', 'store_name')
                                            ->searchable()
                                            ->preload()
                                            ->label('Fulfilling Merchant'),

                                        Forms\Components\Select::make('courier_id')
                                            ->relationship('courier', 'id')
                                            ->searchable()
                                            ->preload()
                                            ->label('Assigned Courier Profile'),
                                    ]),
                            ]),

                        Forms\Components\Section::make('Delivery Destination & Verification')
                            ->schema([
                                Forms\Components\Grid::make(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('delivery_otp')
                                            ->label('Delivery OTP')
                                            ->disabled()
                                            ->dehydrated(false)
                                            ->helperText('Required by courier upon customer handover'),

                                        Forms\Components\TextInput::make('delivery_lat')
                                            ->label('Drop-off Latitude')
                                            ->numeric(),

                                        Forms\Components\TextInput::make('delivery_lng')
                                            ->label('Drop-off Longitude')
                                            ->numeric(),
                                    ]),
                            ]),
                    ])
                    ->columnSpan(['lg' => 2]),

                Forms\Components\Group::make()
                    ->schema([
                        Forms\Components\Section::make('Financial & Payment Settlement')
                            ->schema([
                                Forms\Components\Select::make('payment_type')
                                    ->options(PaymentType::class)
                                    ->required()
                                    ->native(false)
                                    ->label('Payment Method'),

                                Forms\Components\Select::make('payment_status')
                                    ->options(PaymentStatus::class)
                                    ->required()
                                    ->native(false)
                                    ->label('Payment Status'),

                                Forms\Components\TextInput::make('subtotal')
                                    ->label('Items Subtotal')
                                    ->numeric()
                                    ->prefix('EGP')
                                    ->required(),

                                Forms\Components\TextInput::make('delivery_fee')
                                    ->label('Courier Delivery Fee')
                                    ->numeric()
                                    ->prefix('EGP')
                                    ->required(),

                                Forms\Components\TextInput::make('service_fee')
                                    ->label('Platform Service Fee')
                                    ->numeric()
                                    ->prefix('EGP')
                                    ->required(),

                                Forms\Components\TextInput::make('total_amount')
                                    ->label('Grand Total')
                                    ->numeric()
                                    ->prefix('EGP')
                                    ->required()
                                    ->extraInputAttributes(['style' => 'font-size: 1.25rem; font-weight: bold;']),

                                Forms\Components\Toggle::make('courier_paid_merchant_cash')
                                    ->label('Courier Settled Merchant Cash')
                                    ->helperText('Cash collected at merchant pick-up for COD orders'),
                            ]),
                    ])
                    ->columnSpan(['lg' => 1]),
            ])
            ->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_code')
                    ->label('Order #')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->copyable(),

                Tables\Columns\TextColumn::make('customer.name')
                    ->label('Customer')
                    ->searchable()
                    ->description(fn (Order $record): string => (string) ($record->customer?->phone ?? '')),

                Tables\Columns\TextColumn::make('merchant.store_name')
                    ->label('Merchant')
                    ->searchable()
                    ->badge()
                    ->color('info')
                    ->placeholder('Multi-Merchant Split'),

                Tables\Columns\TextColumn::make('total_amount')
                    ->label('Total')
                    ->money('EGP')
                    ->sortable()
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('order_status')
                    ->label('Order Status')
                    ->badge(),

                Tables\Columns\TextColumn::make('payment_status')
                    ->label('Payment')
                    ->badge(),

                Tables\Columns\TextColumn::make('payment_type')
                    ->label('Method')
                    ->badge(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Placed At')
                    ->dateTime('M d, H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('order_status')
                    ->options(OrderStatus::class)
                    ->label('Order State'),

                Tables\Filters\SelectFilter::make('payment_status')
                    ->options(PaymentStatus::class)
                    ->label('Payment State'),

                Tables\Filters\SelectFilter::make('payment_type')
                    ->options(PaymentType::class)
                    ->label('Payment Type'),
            ])
            ->actions([
                Tables\Actions\Action::make('advance_status')
                    ->label('Advance Status')
                    ->icon('heroicon-m-arrow-right-circle')
                    ->color('primary')
                    ->visible(fn (Order $record): bool => ! empty($record->order_status?->allowedTransitions()))
                    ->form(fn (Order $record): array => [
                        Forms\Components\Select::make('new_status')
                            ->label("Next Status (Current: {$record->order_status?->label()})")
                            ->options(
                                collect($record->order_status?->allowedTransitions() ?? [])
                                    ->mapWithKeys(fn (OrderStatus $status) => [$status->value => $status->label()])
                                    ->toArray()
                            )
                            ->required()
                            ->native(false),
                    ])
                    ->action(function (Order $record, array $data): void {
                        $newStatus = OrderStatus::from($data['new_status']);
                        $record->order_status = $newStatus;
                        $record->save();

                        Notification::make()
                            ->title("Order status updated to {$newStatus->label()}")
                            ->success()
                            ->send();
                    }),

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
            RelationManagers\ItemsRelationManager::class,
            RelationManagers\SubOrdersRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }
}
