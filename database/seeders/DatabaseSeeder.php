<?php

namespace Database\Seeders;

use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Contains exclusively the single system administrator. Zero mock data.
     */
    public function run(): void
    {
        // 1. Create single authorized Administrator
        User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Ammar Abdelhalem',
            'username' => 'aabdelhalem',
            'email' => 'ammar@otlobparts.com',
            'phone' => '01000000000',
            'password' => Hash::make('13579wry#Aa'),
            'role' => UserType::ADMIN,
            'status' => UserStatus::ACTIVE,
            'email_verified_at' => now(),
        ]);

        // 2. Initialize essential platform accounting wallets
        Wallet::platformEscrow();
        Wallet::platformEarnings();
    }
}
