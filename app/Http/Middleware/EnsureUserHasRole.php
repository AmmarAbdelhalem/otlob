<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles Allowed role names (e.g. 'customer', 'merchant', 'courier', 'admin')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $userRole = $user->role instanceof UserType ? $user->role->value : (string) $user->role;

        // Admin has superuser access to all endpoints
        if ($userRole === UserType::ADMIN->value) {
            return $next($request);
        }

        if (! in_array($userRole, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: You do not have the required permissions to access this resource.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
