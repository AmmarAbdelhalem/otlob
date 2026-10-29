<?php

namespace App\Http\Controllers\Api\v1;

use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Enums\WalletType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateFcmTokenRequest;
use App\Models\CourierProfile;
use App\Models\Merchant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * User registration with multi-role onboarding (Customer, Merchant, Courier).
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $role = $validated['role'] instanceof UserType ? $validated['role']->value : $validated['role'];

        return DB::transaction(function () use ($validated, $role) {
            // 1. Create Base User with pending verification for merchants and couriers
            $initialStatus = match ($role) {
                UserType::MERCHANT->value, UserType::COURIER->value => UserStatus::PENDING,
                default => UserStatus::ACTIVE,
            };

            $user = User::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'] ?? null,
                'password' => $validated['password'], // hashed via model cast
                'role' => $role,
                'status' => $initialStatus,
                'fcm_token' => $validated['fcm_token'] ?? null,
            ]);

            // 2. Role-specific profile initialization
            if ($role === UserType::MERCHANT->value) {
                Merchant::create([
                    'user_id' => $user->id,
                    'store_name' => $validated['store_name'],
                    'commercial_register_number' => $validated['commercial_registration_number'],
                    'address_text' => $validated['address_text'],
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'is_active' => false, // Requires admin approval
                ]);

                // Create Merchant Wallet
                $user->getWallet(WalletType::MERCHANT);
            } elseif ($role === UserType::COURIER->value) {
                CourierProfile::create([
                    'user_id' => $user->id,
                    'vehicle_type' => $validated['vehicle_type'],
                    'max_load_capacity' => $validated['max_load_capacity'] ?? 20.0,
                    'max_volume_capacity' => $validated['max_volume_capacity'] ?? 0.1,
                    'max_cod_limit' => $validated['max_cod_limit'] ?? 2000.0,
                    'collected_cash_in_hand' => 0.0,
                    'is_cod_suspended' => false,
                    'is_online' => false,
                ]);

                // Create Courier Wallet
                $user->getWallet(WalletType::COURIER);
            } else {
                // Customer Wallet
                $user->getWallet(WalletType::CUSTOMER);
            }

            // 3. Issue Sanctum token with role ability
            $token = $user->createToken('auth-token', ['role:' . $role])->plainTextToken;

            return $this->successResponse([
                'user' => $user->load(['merchant', 'courierProfile', 'wallets']),
                'token' => $token,
            ], 'Registration successful.', Response::HTTP_CREATED);
        });
    }

    /**
     * User authentication & Sanctum token issue.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $login = $request->input('login');
        $password = $request->input('password');

        $user = User::where('phone', $login)
            ->orWhere('email', $login)
            ->orWhere('username', $login)
            ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return $this->errorResponse('Invalid credentials.', Response::HTTP_UNAUTHORIZED);
        }

        if ($user->status === UserStatus::SUSPENDED) {
            return $this->errorResponse('Your account has been suspended. Please contact support.', Response::HTTP_FORBIDDEN);
        }

        $role = $user->role instanceof UserType ? $user->role->value : (string) $user->role;
        $deviceName = $request->input('device_name', 'mobile-app');
        $token = $user->createToken($deviceName, ['role:' . $role])->plainTextToken;

        return $this->successResponse([
            'user' => $user->load(['merchant', 'courierProfile', 'wallets']),
            'token' => $token,
        ], 'Login successful.');
    }

    /**
     * Revoke active access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Logged out successfully.');
    }

    /**
     * Update device FCM push notification token.
     */
    public function updateFcmToken(UpdateFcmTokenRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $request->user()->update([
            'fcm_token' => $validated['fcm_token'],
        ]);

        return $this->successResponse(null, 'FCM token updated successfully.');
    }

    /**
     * Get authenticated user profile with active role relations.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->successResponse(
            $request->user()->load(['merchant', 'courierProfile', 'vehicles', 'wallets'])
        );
    }
}
