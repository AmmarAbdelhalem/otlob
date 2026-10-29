<?php

use App\Http\Controllers\Api\v1\AdminController;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\CartController;
use App\Http\Controllers\Api\v1\CmsController;
use App\Http\Controllers\Api\v1\CourierController;
use App\Http\Controllers\Api\v1\CustomerController;
use App\Http\Controllers\Api\v1\MerchantController;
use App\Http\Controllers\Api\v1\OfferController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Otlob Auto Parts Marketplace API',
        'version' => '1.0.0',
        'status' => 'operational',
    ]);
});

Route::prefix('v1')->group(function () {
    // ------------------------------------------------------------------------
    // 1. Authentication & Common Endpoints
    // ------------------------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/fcm-token', [AuthController::class, 'updateFcmToken']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });

    // ------------------------------------------------------------------------
    // 2. Public Catalog Search, Merchants, Offers & CMS Content
    // ------------------------------------------------------------------------
    Route::get('/products/search', [CustomerController::class, 'searchProducts'])->middleware('throttle:api');
    Route::get('/merchants', [MerchantController::class, 'getPublicMerchants']);
    Route::get('/offers', [OfferController::class, 'getPublicOffers']);
    Route::post('/offers/validate', [OfferController::class, 'validateCoupon']);

    Route::prefix('cms')->group(function () {
        Route::get('/banners', [CmsController::class, 'getBanners']);
        Route::get('/categories', [CmsController::class, 'getCategories']);
        Route::get('/pages/{slug}', [CmsController::class, 'getPageBySlug']);
    });

    // ------------------------------------------------------------------------
    // 3. Customer Module
    // ------------------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'role:customer'])->prefix('customer')->group(function () {
        Route::get('/vehicles', [CustomerController::class, 'getVehicles']);
        Route::post('/vehicles', [CustomerController::class, 'addVehicle']);

        // Database-backed Shopping Cart
        Route::prefix('cart')->group(function () {
            Route::get('/', [CartController::class, 'getCart']);
            Route::post('/sync', [CartController::class, 'syncCart']);
            Route::post('/items', [CartController::class, 'addItem']);
            Route::delete('/items/{productId}', [CartController::class, 'removeItem']);
            Route::delete('/', [CartController::class, 'clearCart']);
        });
    });

    Route::middleware(['auth:sanctum', 'role:customer'])->prefix('orders')->group(function () {
        Route::get('/', [CustomerController::class, 'getOrders']);
        Route::post('/checkout', [CustomerController::class, 'checkout']);
        Route::get('/{id}', [CustomerController::class, 'getOrderDetails']);
        Route::get('/{id}/track', [CustomerController::class, 'trackOrder']);
    });

    // ------------------------------------------------------------------------
    // 4. Merchant Module
    // ------------------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'role:merchant'])->prefix('merchant')->group(function () {
        Route::post('/products', [MerchantController::class, 'createProduct']);
        Route::patch('/products/{id}/stock', [MerchantController::class, 'updateStock']);
        Route::get('/orders', [MerchantController::class, 'getOrders']);
        Route::patch('/orders/{id}/status', [MerchantController::class, 'updateOrderStatus']);
        Route::get('/wallet', [MerchantController::class, 'getWallet']);
    });

    // ------------------------------------------------------------------------
    // 5. Courier Module
    // ------------------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'role:courier'])->prefix('courier')->group(function () {
        Route::get('/orders', [CourierController::class, 'getOrders']);
        Route::post('/location', [CourierController::class, 'updateLocation'])->middleware('throttle:tracking');
        Route::post('/status', [CourierController::class, 'toggleStatus']);
        Route::post('/orders/{id}/accept', [CourierController::class, 'acceptOrder']);
        Route::post('/orders/{id}/pickup', [CourierController::class, 'pickupOrder']);
        Route::post('/orders/{id}/verify-otp', [CourierController::class, 'verifyOtp']);
        Route::post('/remittances', [CourierController::class, 'submitRemittance']);
        Route::get('/wallet', [CourierController::class, 'getWallet']);
    });

    // ------------------------------------------------------------------------
    // 6. Admin Module
    // ------------------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard/stats', [AdminController::class, 'getDashboardStats']);
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::get('/products', [AdminController::class, 'getProducts']);
        Route::patch('/products/{id}/toggle-status', [AdminController::class, 'toggleProductStatus']);
        Route::get('/activity-logs', [AdminController::class, 'getActivityLogs']);

        Route::apiResource('offers', OfferController::class);
        Route::patch('/offers/{id}/toggle-status', [OfferController::class, 'toggleStatus']);

        Route::get('/merchants/pending', [AdminController::class, 'getPendingMerchants']);
        Route::patch('/merchants/{id}/approve', [AdminController::class, 'approveMerchant']);
        Route::get('/couriers/pending', [AdminController::class, 'getPendingCouriers']);
        Route::patch('/couriers/{id}/approve', [AdminController::class, 'approveCourier']);
        Route::get('/orders', [AdminController::class, 'getAllOrders']);
        Route::get('/remittances', [AdminController::class, 'getPendingRemittances']);
        Route::post('/remittances/{id}/approve', [AdminController::class, 'approveRemittance']);
        Route::get('/reports/financials', [AdminController::class, 'getFinancialReports']);
    });
});
