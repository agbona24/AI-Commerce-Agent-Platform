<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Models\Tenant;
use App\Enums\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends BaseController
{
    /**
     * Register a new user and tenant
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Create tenant
        $tenant = Tenant::create([
            'name' => $request->business_name ?? $request->first_name . "'s Business",
            'slug' => Str::slug($request->business_name ?? $request->email),
            'subscription_plan' => 'free',
            'subscription_status' => 'trial',
            'trial_ends_at' => now()->addDays(14),
        ]);

        // Create user
        $user = User::create([
            'tenant_id' => $tenant->id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => UserRole::OWNER,
        ]);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->created([
            'user' => $user,
            'tenant' => $tenant,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Registration successful');
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->unauthorized('Invalid credentials');
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'user' => $user->load('tenant'),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Login successful');
    }

    /**
     * Get authenticated user
     */
    public function me(): JsonResponse
    {
        $user = auth()->user()->load('tenant');
        
        return $this->success($user);
    }

    /**
     * Logout user
     */
    public function logout(): JsonResponse
    {
        auth()->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }

    /**
     * Refresh token
     */
    public function refresh(): JsonResponse
    {
        $user = auth()->user();
        
        // Delete current token
        $user->currentAccessToken()->delete();
        
        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Token refreshed');
    }
}
