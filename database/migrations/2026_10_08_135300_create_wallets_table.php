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
        Schema::create('wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable(true)->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['customer', 'merchant', 'courier', 'platform_escrow', 'platform_earnings']);
            $table->string('currency')->default('EGP');
            $table->decimal('balance');

            $table->unique(['user_id','type']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
