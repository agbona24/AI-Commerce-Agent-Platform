<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Api\V1\BaseController;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Integration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingsController extends BaseController
{
    /**
     * Get all settings
     */
    public function index(): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        $user = auth()->user();

        return $this->success([
            'profile' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
                'timezone' => $user->timezone,
                'language' => $user->language,
            ],
            'business' => [
                'name' => $tenant->name,
                'logo_url' => $tenant->logo_url,
                'primary_color' => $tenant->primary_color,
                'industry' => $tenant->industry,
                'website' => $tenant->website,
                'business_email' => $tenant->business_email,
                'business_phone' => $tenant->business_phone,
            ],
            'billing' => [
                'plan' => $tenant->subscription_plan,
                'status' => $tenant->subscription_status,
                'trial_ends_at' => $tenant->trial_ends_at,
            ],
        ]);
    }

    /**
     * Update profile settings
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar_url' => 'nullable|string|url',
            'timezone' => 'nullable|string|max:100',
            'language' => 'nullable|string|max:10',
        ]);

        auth()->user()->update($data);

        return $this->success(auth()->user(), 'Profile updated');
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->error('Current password is incorrect', 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return $this->success(null, 'Password updated');
    }

    /**
     * Update business settings
     */
    public function updateBusiness(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'business_name' => 'sometimes|string|max:255',
            'logo_url' => 'nullable|string|url',
            'primary_color' => 'nullable|string|max:7',
            'industry' => 'nullable|string|max:100',
            'company_size' => 'nullable|string|max:50',
            'team_size' => 'nullable|string|max:50',
            'website' => 'nullable|string|url',
            'business_email' => 'nullable|email',
            'business_phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'country' => 'nullable|string',
            'zip_code' => 'nullable|string',
            'tax_id' => 'nullable|string',
            // Onboarding fields
            'ai_tasks' => 'nullable|array',
            'ai_tone' => 'nullable|string',
            'channels' => 'nullable|array',
            // Voice integration credentials
            'twilio_credentials' => 'nullable|array',
            'twilio_credentials.account_sid' => 'required_with:twilio_credentials|string',
            'twilio_credentials.auth_token' => 'required_with:twilio_credentials|string',
            'twilio_credentials.phone_number' => 'required_with:twilio_credentials|string',
            'openai_credentials' => 'nullable|array',
            'openai_credentials.api_key' => 'required_with:openai_credentials|string',
        ]);

        $tenant = auth()->user()->tenant;
        
        // Handle business name from onboarding
        if (isset($data['business_name'])) {
            $data['name'] = $data['business_name'];
            unset($data['business_name']);
        }
        
        // Handle team_size as company_size
        if (isset($data['team_size'])) {
            $data['company_size'] = $data['team_size'];
            unset($data['team_size']);
        }
        
        // Store AI and channel settings
        $settings = $tenant->settings ?? [];
        if (isset($data['ai_tasks'])) {
            $settings['ai_tasks'] = $data['ai_tasks'];
            unset($data['ai_tasks']);
        }
        if (isset($data['ai_tone'])) {
            $settings['ai_tone'] = $data['ai_tone'];
            unset($data['ai_tone']);
        }
        if (isset($data['channels'])) {
            $settings['channels'] = $data['channels'];
            unset($data['channels']);
        }
        $data['settings'] = $settings;
        
        // Handle Twilio integration
        if (isset($data['twilio_credentials'])) {
            $twilioCredentials = $data['twilio_credentials'];
            unset($data['twilio_credentials']);
            
            // Create or update Twilio integration
            Integration::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'type' => 'twilio',
                ],
                [
                    'name' => 'Twilio Voice',
                    'provider' => 'twilio',
                    'status' => \App\Enums\IntegrationStatus::CONNECTED,
                    'credentials' => $twilioCredentials,
                    'settings' => ['phone_number' => $twilioCredentials['phone_number']],
                ]
            );
        }
        
        // Handle OpenAI integration
        if (isset($data['openai_credentials'])) {
            $openaiCredentials = $data['openai_credentials'];
            unset($data['openai_credentials']);
            
            // Create or update OpenAI integration
            Integration::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'type' => 'openai',
                ],
                [
                    'name' => 'OpenAI',
                    'provider' => 'openai',
                    'status' => \App\Enums\IntegrationStatus::CONNECTED,
                    'credentials' => $openaiCredentials,
                    'settings' => ['model' => 'gpt-4o'],
                ]
            );
        }
        
        // Mark onboarding as complete
        $settings = $data['settings'] ?? [];
        $settings['onboarding_completed'] = true;
        $settings['onboarding_completed_at'] = now()->toIso8601String();
        $data['settings'] = $settings;

        $tenant->update($data);

        return $this->success(auth()->user()->tenant, 'Business settings updated');
    }

    /**
     * Get notification settings
     */
    public function notifications(): JsonResponse
    {
        $settings = auth()->user()->settings['notifications'] ?? [
            'email_new_conversation' => true,
            'email_conversation_assigned' => true,
            'email_daily_summary' => true,
            'push_new_message' => true,
            'push_escalation' => true,
        ];

        return $this->success($settings);
    }

    /**
     * Update notification settings
     */
    public function updateNotifications(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email_new_conversation' => 'boolean',
            'email_conversation_assigned' => 'boolean',
            'email_daily_summary' => 'boolean',
            'push_new_message' => 'boolean',
            'push_escalation' => 'boolean',
        ]);

        $user = auth()->user();
        $settings = $user->settings ?? [];
        $settings['notifications'] = array_merge($settings['notifications'] ?? [], $data);
        $user->update(['settings' => $settings]);

        return $this->success($settings['notifications'], 'Notification settings updated');
    }

    /**
     * Get AI settings
     */
    public function aiSettings(): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings['ai'] ?? [
            'default_model' => 'gpt-4',
            'temperature' => 0.7,
            'max_tokens' => 1024,
            'auto_escalate' => true,
            'escalation_threshold' => 3,
        ];

        return $this->success($settings);
    }

    /**
     * Update AI settings
     */
    public function updateAiSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'default_model' => 'in:gpt-4,gpt-3.5-turbo,claude-3',
            'temperature' => 'numeric|min:0|max:2',
            'max_tokens' => 'integer|min:100|max:4096',
            'auto_escalate' => 'boolean',
            'escalation_threshold' => 'integer|min:1|max:10',
        ]);

        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        $settings['ai'] = array_merge($settings['ai'] ?? [], $data);
        $tenant->update(['settings' => $settings]);

        return $this->success($settings['ai'], 'AI settings updated');
    }

    /**
     * Get API keys
     */
    public function apiKeys(): JsonResponse
    {
        $tokens = auth()->user()->tokens()->get(['id', 'name', 'created_at', 'last_used_at']);

        return $this->success($tokens);
    }

    /**
     * Create API key
     */
    public function createApiKey(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $token = auth()->user()->createToken($request->name);

        return $this->created([
            'id' => $token->accessToken->id,
            'name' => $request->name,
            'token' => $token->plainTextToken,
        ], 'API key created. Make sure to copy it now!');
    }

    /**
     * Revoke API key
     */
    public function revokeApiKey(Request $request, $id): JsonResponse
    {
        auth()->user()->tokens()->where('id', $id)->delete();

        return $this->success(null, 'API key revoked');
    }

    /**
     * Get 2FA status
     */
    public function twoFactorStatus(): JsonResponse
    {
        $user = auth()->user();
        $settings = $user->settings ?? [];
        
        return $this->success([
            'enabled' => $settings['two_factor_enabled'] ?? false,
            'method' => $settings['two_factor_method'] ?? 'app', // app, sms, email
            'phone_verified' => !empty($user->phone),
            'backup_codes_count' => count($settings['two_factor_backup_codes'] ?? []),
        ]);
    }

    /**
     * Enable 2FA - Generate setup data
     */
    public function enableTwoFactor(Request $request): JsonResponse
    {
        $request->validate([
            'method' => 'required|in:app,sms,email',
        ]);
        
        $user = auth()->user();
        $settings = $user->settings ?? [];
        
        if ($request->method === 'sms' && empty($user->phone)) {
            return $this->error('Phone number required for SMS 2FA', 422);
        }
        
        // Generate a secret for app-based 2FA
        $secret = base64_encode(random_bytes(20));
        
        // Generate backup codes
        $backupCodes = [];
        for ($i = 0; $i < 10; $i++) {
            $backupCodes[] = strtoupper(bin2hex(random_bytes(4)));
        }
        
        // Store pending 2FA setup
        $settings['two_factor_pending'] = [
            'method' => $request->method,
            'secret' => $secret,
            'backup_codes' => $backupCodes,
        ];
        
        $user->update(['settings' => $settings]);
        
        // Generate OTP-style QR code URL for authenticator apps
        $issuer = config('app.name', 'VivaxAI');
        $otpAuthUrl = "otpauth://totp/{$issuer}:{$user->email}?secret={$secret}&issuer={$issuer}";
        
        return $this->success([
            'method' => $request->method,
            'secret' => $secret,
            'qr_url' => $otpAuthUrl,
            'backup_codes' => $backupCodes,
        ], 'Please verify with code to complete setup');
    }

    /**
     * Verify and complete 2FA setup
     */
    public function verifyTwoFactor(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);
        
        $user = auth()->user();
        $settings = $user->settings ?? [];
        $pending = $settings['two_factor_pending'] ?? null;
        
        if (!$pending) {
            return $this->error('No pending 2FA setup found', 400);
        }
        
        // In production, validate TOTP code against secret
        // For now, accept any 6-digit code for testing
        if (!preg_match('/^\d{6}$/', $request->code)) {
            return $this->error('Invalid verification code', 422);
        }
        
        // Enable 2FA
        $settings['two_factor_enabled'] = true;
        $settings['two_factor_method'] = $pending['method'];
        $settings['two_factor_secret'] = $pending['secret'];
        $settings['two_factor_backup_codes'] = $pending['backup_codes'];
        unset($settings['two_factor_pending']);
        
        $user->update(['settings' => $settings]);
        
        return $this->success([
            'enabled' => true,
            'method' => $pending['method'],
        ], 'Two-factor authentication enabled');
    }

    /**
     * Disable 2FA
     */
    public function disableTwoFactor(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);
        
        $user = auth()->user();
        
        if (!Hash::check($request->password, $user->password)) {
            return $this->error('Invalid password', 422);
        }
        
        $settings = $user->settings ?? [];
        $settings['two_factor_enabled'] = false;
        unset($settings['two_factor_secret']);
        unset($settings['two_factor_backup_codes']);
        unset($settings['two_factor_method']);
        
        $user->update(['settings' => $settings]);
        
        return $this->success(null, 'Two-factor authentication disabled');
    }

    /**
     * Regenerate backup codes
     */
    public function regenerateBackupCodes(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);
        
        $user = auth()->user();
        $settings = $user->settings ?? [];
        
        if (!($settings['two_factor_enabled'] ?? false)) {
            return $this->error('Two-factor authentication is not enabled', 400);
        }
        
        if (!Hash::check($request->password, $user->password)) {
            return $this->error('Invalid password', 422);
        }
        
        // Generate new backup codes
        $backupCodes = [];
        for ($i = 0; $i < 10; $i++) {
            $backupCodes[] = strtoupper(bin2hex(random_bytes(4)));
        }
        
        $settings['two_factor_backup_codes'] = $backupCodes;
        $user->update(['settings' => $settings]);
        
        return $this->success([
            'backup_codes' => $backupCodes,
        ], 'Backup codes regenerated');
    }
}
