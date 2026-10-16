<?php

namespace Tests\Feature;

use App\Enums\ProductCondition;
use App\Enums\UserType;
use App\Enums\VehicleType;
use App\Models\Merchant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_registration_and_login(): void
    {
        // 1. Register Customer
        $regResponse = $this->postJson('/api/v1/auth/register', [
            'name' => 'Sara Customer',
            'phone' => '01012345679',
            'email' => 'sara@example.com',
            'password' => 'Password123!',
            'role' => 'customer',
        ]);

        $regResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'phone'],
                    'token',
                ],
            ]);

        // 2. Login Customer
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'login' => '01012345679',
            'password' => 'Password123!',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.phone', '01012345679');

        $token = $loginResponse->json('data.token');

        // 3. Authenticated me endpoint
        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.phone', '01012345679');
    }

    public function test_merchant_registration_creates_store_profile_and_wallet(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Kareem Merchant',
            'phone' => '01098765432',
            'email' => 'kareem@parts.com',
            'password' => 'Password123!',
            'role' => 'merchant',
            'store_name' => 'Kareem Auto Hub',
            'commercial_registration_number' => 'CR-889900',
            'address_text' => 'El Dokki, Giza',
            'latitude' => 30.0382,
            'longitude' => 31.2118,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('merchants', [
            'store_name' => 'Kareem Auto Hub',
            'commercial_register_number' => 'CR-889900',
        ]);

        $this->assertDatabaseHas('wallets', [
            'type' => 'merchant',
        ]);
    }

    public function test_customer_can_manage_vehicles_and_search_products(): void
    {
        $customer = User::create([
            'name' => 'Omar',
            'phone' => '01055554444',
            'role' => UserType::CUSTOMER,
            'password' => 'secret123',
        ]);

        $token = $customer->createToken('test', ['role:customer'])->plainTextToken;

        // 1. Add Vehicle to Garage
        $addVehicleResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/customer/vehicles', [
                'make' => 'Toyota',
                'model' => 'Corolla',
                'year' => 2020,
                'vin' => 'JTDBR32E220000000',
                'is_default' => true,
            ]);

        $addVehicleResponse->assertStatus(201)
            ->assertJsonPath('data.make', 'Toyota')
            ->assertJsonPath('data.year', 2020);

        // 2. List Garage Vehicles
        $listResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/customer/vehicles');

        $listResponse->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // 3. Search Products (Public endpoint)
        $searchResponse = $this->getJson('/api/v1/products/search?q=corolla');
        $searchResponse->assertStatus(200)
            ->assertJsonStructure(['data', 'meta']);
    }

    public function test_role_based_access_control_protects_restricted_endpoints(): void
    {
        // Customer attempting to upload a product (merchant route)
        $customer = User::create([
            'name' => 'Unauthorized User',
            'phone' => '01099990000',
            'role' => UserType::CUSTOMER,
            'password' => 'secret123',
        ]);

        $token = $customer->createToken('test', ['role:customer'])->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/merchant/products', [
                'name' => 'Suspicious Product',
                'sku' => 'SUSP-01',
                'oem_number' => 'OEM-01',
                'description' => 'Test',
                'price' => 100,
                'stock_quantity' => 1,
                'weight_kg' => 1,
                'length_cm' => 10,
                'width_cm' => 10,
                'height_cm' => 10,
                'condition' => 'new',
            ]);

        // Must be rejected with 403 Forbidden!
        $response->assertStatus(403);
    }

    public function test_merchant_can_create_products_and_update_stock(): void
    {
        $merchantUser = User::create([
            'name' => 'Auto Shop Owner',
            'phone' => '01033332222',
            'role' => UserType::MERCHANT,
            'password' => 'secret123',
        ]);

        $merchant = Merchant::create([
            'user_id' => $merchantUser->id,
            'store_name' => 'Speedy Parts',
            'commercial_register_number' => 'CR-112233',
            'address_text' => 'Nasr City',
            'latitude' => 30.05,
            'longitude' => 31.33,
            'is_active' => true,
        ]);

        $token = $merchantUser->createToken('test', ['role:merchant'])->plainTextToken;

        // Create product with vehicle fitments
        $createProdResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/merchant/products', [
                'name' => 'Oil Filter Premium',
                'sku' => 'OF-999',
                'oem_number' => 'OEM-OF999',
                'description' => 'High filtration oil filter',
                'price' => 180.00,
                'stock_quantity' => 50,
                'weight_kg' => 0.4,
                'length_cm' => 12.0,
                'width_cm' => 12.0,
                'height_cm' => 15.0,
                'condition' => 'new',
                'compatibilities' => [
                    [
                        'make' => 'Hyundai',
                        'model' => 'Elantra',
                        'year_from' => 2016,
                        'year_to' => 2022,
                    ],
                ],
            ]);

        $createProdResponse->assertStatus(201)
            ->assertJsonPath('data.name', 'Oil Filter Premium')
            ->assertJsonCount(1, 'data.compatibilities');

        $productId = $createProdResponse->json('data.id');

        // Update Stock
        $updateStockResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->patchJson("/api/v1/merchant/products/{$productId}/stock", [
                'stock_quantity' => 45,
            ]);

        $updateStockResponse->assertStatus(200)
            ->assertJsonPath('data.stock_quantity', 45);
    }
}
