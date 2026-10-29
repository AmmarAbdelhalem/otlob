<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleMiddleware
{
    /**
     * Handle an incoming request and set application locale based on headers.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('X-Locale', $request->header('Accept-Language', 'ar'));
        $cleanLocale = strtolower(substr(trim($locale), 0, 2));

        if (in_array($cleanLocale, ['ar', 'en'], true)) {
            App::setLocale($cleanLocale);
        } else {
            App::setLocale('ar');
        }

        return $next($request);
    }
}
