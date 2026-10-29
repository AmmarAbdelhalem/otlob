<?php

namespace App\Filament\Widgets;

use App\Enums\OrderStatus;
use App\Models\CourierProfile;
use App\Models\Merchant;
use App\Models\Order;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $totalRevenue = Order::query()
            ->whereIn('order_status', [OrderStatus::DELIVERED->value, OrderStatus::IN_TRANSIT->value])
            ->sum('total_amount');

        $pendingOrders = Order::query()
            ->whereIn('order_status', [
                OrderStatus::PENDING->value,
                OrderStatus::ACCEPTED_BY_MERCHANT->value,
                OrderStatus::PREPARING->value,
                OrderStatus::READY_FOR_PICKUP->value,
            ])
            ->count();

        $activeCouriers = CourierProfile::query()
            ->where('is_online', true)
            ->count();

        $totalCodInHand = CourierProfile::query()
            ->sum('collected_cash_in_hand');

        $activeMerchants = Merchant::query()
            ->where('is_active', true)
            ->count();

        return [
            Stat::make('Platform GMV', number_format($totalRevenue, 2) . ' EGP')
                ->description('Total delivered & in-transit volume')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success')
                ->chart([7, 12, 18, 24, 30, 45, 50]),

            Stat::make('Pending Dispatch', (string) $pendingOrders)
                ->description('Orders awaiting merchant or driver')
                ->descriptionIcon('heroicon-m-clock')
                ->color($pendingOrders > 0 ? 'warning' : 'gray'),

            Stat::make('Online Couriers', "{$activeCouriers} Active")
                ->description('Drivers currently on shift')
                ->descriptionIcon('heroicon-m-truck')
                ->color('primary'),

            Stat::make('Cash In-Hand (COD)', number_format($totalCodInHand, 2) . ' EGP')
                ->description("{$activeMerchants} active merchant stores")
                ->descriptionIcon('heroicon-m-banknotes')
                ->color($totalCodInHand > 10000 ? 'danger' : 'info'),
        ];
    }
}
