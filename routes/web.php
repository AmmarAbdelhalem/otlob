<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web / Health / Root Routes (Backend API Only)
|--------------------------------------------------------------------------
|
| This project is a dedicated headless backend API for the Otlob Auto Parts
| Marketplace. All client apps communicate via RESTful /api/v1 endpoints.
| Interactive OpenAPI & Swagger UI is provided at /docs for developers.
|
*/

Route::get('/', function (Request $request) {
    if (! $request->wantsJson()) {
        return redirect()->to('/admin');
    }

    return response()->json([
        'name' => 'Otlob Auto Parts Marketplace Backend API',
        'version' => '1.0.0',
        'status' => 'operational',
        'admin_panel' => url('/admin'),
        'admin_login' => url('/admin/login'),
        'documentation_ui' => url('/docs'),
        'endpoints' => [
            'api_root' => url('/api/v1'),
            'health_check' => url('/up'),
            'openapi_spec' => url('/docs/openapi.json'),
            'postman_collection' => url('/docs/otlob_postman_collection.json'),
        ],
    ]);
})->name('api.index');

/*
|--------------------------------------------------------------------------
| Filament Admin & CMS Livewire Portal
|--------------------------------------------------------------------------
| The Full Admin & CMS Panel (Livewire 3 + Filament v3) is registered
| dynamically by App\Providers\Filament\AdminPanelProvider at /admin.
| Below routes provide convenient web aliases and redirects.
*/
Route::get('/admin-panel', function () {
    return redirect()->to('/admin');
})->name('admin.redirect');

// Interactive Swagger UI & OpenAPI Specification Routes
Route::get('/docs', function (Request $request) {
    if ($request->wantsJson() || $request->query('format') === 'json') {
        return response()->file(public_path('docs/openapi.json'), [
            'Content-Type' => 'application/json; charset=UTF-8',
        ]);
    }

    return view('docs');
})->name('api.docs');

Route::get('/docs/openapi.json', function () {
    return response()->file(public_path('docs/openapi.json'), [
        'Content-Type' => 'application/json; charset=UTF-8',
    ]);
});

Route::get('/docs/otlob_postman_collection.json', function () {
    return response()->file(public_path('docs/otlob_postman_collection.json'), [
        'Content-Type' => 'application/json; charset=UTF-8',
    ]);
});

Route::get('/api/documentation', function () {
    return redirect()->route('api.docs');
});