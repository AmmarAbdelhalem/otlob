<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(\App\Http\Middleware\SecurityHeadersMiddleware::class);
        $middleware->append(\App\Http\Middleware\SetLocaleMiddleware::class);
        $middleware->redirectGuestsTo(function ($request) {
            if ($request->is('admin*')) {
                return route('filament.admin.auth.login');
            }
            return null;
        });
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $redirectTo = $e->redirectTo($request);
            if ($redirectTo) {
                return redirect()->guest($redirectTo);
            }

            if ($request->is('admin*')) {
                return redirect()->guest(route('filament.admin.auth.login'));
            }

            return null;
        });
    })->create();
