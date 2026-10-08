<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('parent_id')->nullable(true)->constrained('orders')->cascadeOnDelete();
            $table->string('order_code')->unique(true);
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('merchant_id')->nullable(true)->constrained('merchants')->cascadeOnDelete();
            $table->foreignId('courier_id')->nullable(true)->constrained('couriers')->cascadeOnDelete();
            $table->decimal('subtotal');
            $table->decimal('delivery_fee'); // <- This will be for the courier
            $table->decimal('service_fee'); // <- This will be for Otolb parts
            $table->decimal('total_amount');
            $table->enum('payment_type', ['cod', 'card', 'wallet']);
            $table->enum('payment_status', ['pending','paid', 'failed', 'refunded']);
            $table->enum('order_status', ['pending','accepted_by_merchant', 'preparing', 'ready_for_pickup', 'assigned_to_courier', 'in_transit', 'delivered', 'cancelled']);
            $table->boolean('courier_paid_merchant_cash')->default(false);
            $table->decimal('delivery_lat', 10, 7);
            $table->decimal('delivery_lng', 10, 7);
            $table->char('delivery_otp', 6);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
