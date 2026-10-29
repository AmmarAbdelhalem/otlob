<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentType;
use App\Enums\VehicleType;
use App\Events\NewOrderAvailableEvent;
use App\Jobs\DispatchOrderToCouriersJob;
use App\Jobs\SendOrderPushNotificationJob;
use App\Models\CourierProfile;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class RefactoringAndIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatch_job_broadcasts_event_and_enqueues_push_notifications(): void
    {
        Event::fake([NewOrderAvailableEvent::class]);
        Queue::fake([SendOrderPushNotificationJob::class]);

        $courierUser = User::create([
            'name' => 'Fast Rider',
            'phone' => '01011122233',
            'role' => 'courier',
            'password' => 'secret123',
            'fcm_token' => 'sample_fcm_token_123',
        ]);

        $courier = CourierProfile::create([
            'user_id' => $courierUser->id,
            'vehicle_type' => VehicleType::BIKE,
            'max_load_capacity' => 20.0,
            'max_volume_capacity' => 0.1,
            'max_cod_limit' => 3000.0,
            'collected_cash_in_hand' => 0.0,
            'is_cod_suspended' => false,
            'is_online' => true,
            'current_lat' => 30.0444,
            'current_lng' => 31.2357,
        ]);

        $merchantUser = User::create([
            'name' => 'Part Store',
            'phone' => '01044455566',
            'role' => 'merchant',
            'password' => 'secret123',
        ]);

        $merchant = Merchant::create([
            'user_id' => $merchantUser->id,
            'store_name' => 'City Parts',
            'commercial_register_number' => 'CR-554433',
            'address_text' => 'Downtown',
            'latitude' => 30.0440,
            'longitude' => 31.2350,
            'is_active' => true,
        ]);

        $customer = User::create([
            'name' => 'Buyer',
            'phone' => '01077788899',
            'role' => 'customer',
            'password' => 'secret123',
        ]);

        $order = Order::create([
            'order_code' => 'ORD-DISPATCH-TEST',
            'customer_id' => $customer->id,
            'merchant_id' => $merchant->id,
            'subtotal' => 100.0,
            'delivery_fee' => 25.0,
            'service_fee' => 15.0,
            'total_amount' => 140.0,
            'payment_type' => PaymentType::CARD,
            'payment_status' => 'pending',
            'order_status' => OrderStatus::READY_FOR_PICKUP,
            'delivery_lat' => 30.05,
            'delivery_lng' => 31.24,
            'delivery_otp' => '998877',
        ]);

        // Run the job synchronously
        $job = new DispatchOrderToCouriersJob($order, 25.0);
        $job->handle(app(\App\Services\DispatchService::class));

        // Assert event broadcasted
        Event::assertDispatched(NewOrderAvailableEvent::class, function ($event) use ($order, $courierUser) {
            return $event->order->id === $order->id && $event->courierUserId === $courierUser->id;
        });

        // Assert push notification job dispatched
        Queue::assertPushed(SendOrderPushNotificationJob::class, function ($job) use ($courierUser) {
            return $job->user->id === $courierUser->id && str_contains($job->title, 'New Order');
        });
    }

    public function test_order_scope_by_status_handles_both_enum_and_string(): void
    {
        $customer = User::create([
            'name' => 'Buyer 2',
            'phone' => '01099900011',
            'role' => 'customer',
            'password' => 'secret123',
        ]);

        $order = Order::create([
            'order_code' => 'ORD-SCOPE-TEST',
            'customer_id' => $customer->id,
            'subtotal' => 50.0,
            'delivery_fee' => 20.0,
            'service_fee' => 10.0,
            'total_amount' => 80.0,
            'payment_type' => PaymentType::CARD,
            'payment_status' => 'pending',
            'order_status' => OrderStatus::DELIVERED,
            'delivery_lat' => 30.05,
            'delivery_lng' => 31.24,
            'delivery_otp' => '112233',
        ]);

        // Query with Enum
        $countEnum = Order::byStatus(OrderStatus::DELIVERED)->count();
        $this->assertEquals(1, $countEnum);

        // Query with string
        $countString = Order::byStatus('delivered')->count();
        $this->assertEquals(1, $countString);
    }
}
