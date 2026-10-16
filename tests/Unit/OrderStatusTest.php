<?php

namespace Tests\Unit;

use App\Enums\OrderStatus;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class OrderStatusTest extends TestCase
{
    public function test_valid_order_status_transitions(): void
    {
        $status = OrderStatus::PENDING;

        $this->assertTrue($status->canTransitionTo(OrderStatus::ACCEPTED_BY_MERCHANT));
        $this->assertTrue($status->canTransitionTo(OrderStatus::CANCELLED));
        $this->assertFalse($status->canTransitionTo(OrderStatus::DELIVERED));
        $this->assertFalse($status->canTransitionTo(OrderStatus::IN_TRANSIT));

        $next = $status->transitionTo(OrderStatus::ACCEPTED_BY_MERCHANT);
        $this->assertEquals(OrderStatus::ACCEPTED_BY_MERCHANT, $next);

        $preparing = $next->transitionTo(OrderStatus::PREPARING);
        $this->assertEquals(OrderStatus::PREPARING, $preparing);

        $ready = $preparing->transitionTo(OrderStatus::READY_FOR_PICKUP);
        $this->assertEquals(OrderStatus::READY_FOR_PICKUP, $ready);

        $assigned = $ready->transitionTo(OrderStatus::ASSIGNED_TO_COURIER);
        $this->assertEquals(OrderStatus::ASSIGNED_TO_COURIER, $assigned);

        $transit = $assigned->transitionTo(OrderStatus::IN_TRANSIT);
        $this->assertEquals(OrderStatus::IN_TRANSIT, $transit);

        $delivered = $transit->transitionTo(OrderStatus::DELIVERED);
        $this->assertEquals(OrderStatus::DELIVERED, $delivered);

        $this->assertTrue($delivered->isTerminal());
    }

    public function test_invalid_order_status_transition_throws_exception(): void
    {
        $status = OrderStatus::PENDING;

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid order status transition from [pending] to [delivered].');

        $status->transitionTo(OrderStatus::DELIVERED);
    }

    public function test_terminal_status_has_no_allowed_transitions(): void
    {
        $this->assertEmpty(OrderStatus::DELIVERED->allowedTransitions());
        $this->assertEmpty(OrderStatus::CANCELLED->allowedTransitions());
        $this->assertFalse(OrderStatus::DELIVERED->canTransitionTo(OrderStatus::PENDING));
    }
}
