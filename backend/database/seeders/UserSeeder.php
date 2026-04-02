<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        // Admin user
        User::create([
            'tenant_id' => $tenant->id,
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@vivaxai.com',
            'password' => Hash::make('password'),
            'role' => UserRole::OWNER,
            'timezone' => 'America/New_York',
            'language' => 'en',
            'email_verified_at' => now(),
        ]);

        // Team member
        User::create([
            'tenant_id' => $tenant->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@vivaxai.com',
            'password' => Hash::make('password'),
            'role' => UserRole::ADMIN,
            'timezone' => 'America/New_York',
            'language' => 'en',
            'email_verified_at' => now(),
        ]);

        // Agent user
        User::create([
            'tenant_id' => $tenant->id,
            'first_name' => 'Sarah',
            'last_name' => 'Smith',
            'email' => 'sarah@vivaxai.com',
            'password' => Hash::make('password'),
            'role' => UserRole::AGENT,
            'timezone' => 'America/Los_Angeles',
            'language' => 'en',
            'email_verified_at' => now(),
        ]);
    }
}
