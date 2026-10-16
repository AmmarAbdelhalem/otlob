<?php

use Illuminate\Support\Facades\Route;

// 1. Platform Hub & Unified Launchpad
Route::get('/', function () {
    return view('hub');
})->name('hub');

// 2. Normal User / Customer Storefront & Garage App
Route::get('/customer', function () {
    return view('customer');
})->name('portal.customer');

// 3. Merchant Store Manager & Fulfillment Portal
Route::get('/merchant', function () {
    return view('merchant');
})->name('portal.merchant');

// 4. Courier Delivery Fleet Web App
Route::get('/courier', function () {
    return view('courier');
})->name('portal.courier');

// 5. Admin Platform Operations & Financial Governance
Route::get('/admin', function () {
    return view('admin');
})->name('portal.admin');