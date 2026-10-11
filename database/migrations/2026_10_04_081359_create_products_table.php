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
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('merchant_id')->constrained('merchants')->cascadeOnUpdate();
            $table->string('name');
            $table->string('sku');
            $table->string('oem_number');
            $table->string('description');
            $table->decimal('price');
            $table->integer('stock_quantity');
            $table->decimal('weight_kg');
            $table->decimal('length_cm');
            $table->decimal('width_cm');
            $table->decimal('height_cm');
            $table->enum('condition', ['new', 'used', 'refurbished']);
            $table->boolean('is_active')->default(false);
            $table->index(['sku', 'oem_number']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
