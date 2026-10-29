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
        Schema::create('courier_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('vehicle_type', ['bike', 'car', 'van', 'truck']);
            $table->decimal('max_load_capacity', 10, 2)->nullable();
            $table->decimal('max_volume_capacity', 10, 4)->nullable();
            $table->decimal('max_cod_limit', 12, 2)->nullable();
            $table->decimal('collected_cash_in_hand', 12, 2)->default(0.00);
            $table->boolean('is_cod_suspended')->default(false);
            $table->boolean('is_online')->default(false);
            $table->decimal('current_lat', 10, 7)->nullable();
            $table->decimal('current_lng', 10, 7)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_profiles');
    }
};
