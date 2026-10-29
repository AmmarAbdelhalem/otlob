<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Carbon\Carbon;
use Filament\Widgets\ChartWidget;

class OrdersChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Daily Orders (Last 14 Days)';

    protected static ?int $sort = 2;

    protected int | string | array $columnSpan = 'full';

    protected function getData(): array
    {
        $days = collect(range(13, 0))->map(fn ($daysAgo) => Carbon::now()->subDays($daysAgo)->format('Y-m-d'));

        $ordersPerDay = Order::query()
            ->where('created_at', '>=', Carbon::now()->subDays(13)->startOfDay())
            ->get()
            ->groupBy(fn ($order) => $order->created_at->format('Y-m-d'))
            ->map(fn ($orders) => $orders->count());

        $data = $days->map(fn ($day) => $ordersPerDay->get($day, 0))->toArray();
        $labels = $days->map(fn ($day) => Carbon::parse($day)->format('M d'))->toArray();

        return [
            'datasets' => [
                [
                    'label' => 'Total Orders',
                    'data' => $data,
                    'fill' => 'start',
                    'borderColor' => '#10b981',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.1)',
                    'tension' => 0.3,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
