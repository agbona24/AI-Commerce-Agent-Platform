<?php

namespace App\Http\Controllers\Api\V1\Voice;

use App\Http\Controllers\Api\V1\BaseController;
use App\Models\PhoneNumber;
use App\Models\Integration;
use App\Enums\PhoneNumberStatus;
use App\Services\Voice\VoiceProviderFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PhoneNumberController extends BaseController
{
    public function __construct(
        protected VoiceProviderFactory $providerFactory
    ) {}

    /**
     * Get available voice providers
     */
    public function providers(): JsonResponse
    {
        return $this->success($this->providerFactory->getAvailableProviders());
    }

    /**
     * List all phone numbers for the tenant
     */
    public function index(Request $request): JsonResponse
    {
        $query = PhoneNumber::where('tenant_id', $request->user()->tenant_id)
            ->with('agent:id,name,type');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by provider
        if ($request->has('provider')) {
            $query->where('provider', $request->provider);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('phone_number', 'like', "%{$search}%")
                  ->orWhere('friendly_name', 'like', "%{$search}%");
            });
        }

        $phoneNumbers = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($phoneNumbers);
    }

    /**
     * Search for available phone numbers from a provider
     */
    public function searchAvailable(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string|in:twilio,callhippo',
            'country' => 'required|string|size:2',
            'area_code' => 'nullable|string|max:10',
            'contains' => 'nullable|string|max:10',
            'type' => 'nullable|in:local,toll_free,mobile',
        ]);

        $credentials = $this->getProviderCredentials($request->user()->tenant_id, $request->provider);
        
        if (!$credentials) {
            // Return mock data if no credentials configured
            $provider = $this->providerFactory->make($request->provider);
            $numbers = $provider->searchAvailableNumbers([], [
                'country' => $request->country,
                'area_code' => $request->area_code,
                'contains' => $request->contains,
                'type' => $request->type,
            ]);
        } else {
            $provider = $this->providerFactory->make($request->provider);
            $numbers = $provider->searchAvailableNumbers($credentials, [
                'country' => $request->country,
                'area_code' => $request->area_code,
                'contains' => $request->contains,
                'type' => $request->type,
            ]);
        }

        return $this->success([
            'provider' => $request->provider,
            'numbers' => $numbers,
            'total' => count($numbers),
        ]);
    }

    /**
     * Test provider connection
     */
    public function testConnection(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string|in:twilio,callhippo',
            'credentials' => 'required|array',
        ]);

        $provider = $this->providerFactory->make($request->provider);
        $isConnected = $provider->testConnection($request->credentials);

        return $this->success([
            'provider' => $request->provider,
            'connected' => $isConnected,
        ]);
    }

    /**
     * Purchase a new phone number
     */
    public function purchase(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string|in:twilio,callhippo',
            'phone_number' => 'required|string',
            'friendly_name' => 'nullable|string|max:255',
            'agent_id' => 'nullable|exists:agents,id',
        ]);

        $providerName = $request->provider;
        $credentials = $this->getProviderCredentials($request->user()->tenant_id, $providerName);
        
        $provider = $this->providerFactory->make($providerName);
        $result = $provider->purchaseNumber($credentials ?? [], $request->phone_number);

        if (!$result['success']) {
            return $this->error('Failed to purchase phone number', 400);
        }

        // Configure webhooks
        if ($credentials && $result['number_id']) {
            $provider->configureWebhooks($credentials, $result['number_id'], [
                'voice_url' => url('/api/v1/webhooks/voice/incoming'),
                'status_url' => url('/api/v1/webhooks/voice/status'),
            ]);
        }

        $phoneNumber = PhoneNumber::create([
            'tenant_id' => $request->user()->tenant_id,
            'agent_id' => $request->agent_id,
            'phone_number' => $result['phone_number'],
            'friendly_name' => $request->friendly_name ?? $this->formatPhoneNumber($result['phone_number']),
            'provider' => $providerName,
            'provider_id' => $result['number_id'],
            'country_code' => substr($result['phone_number'], 0, 2) === '+1' ? 'US' : 'XX',
            'area_code' => $this->extractAreaCode($result['phone_number']),
            'status' => PhoneNumberStatus::ACTIVE,
            'capabilities' => ['voice' => true, 'sms' => true, 'mms' => true],
            'monthly_cost' => $providerName === 'twilio' ? 1.50 : 2.00,
            'webhook_url' => url('/api/v1/webhooks/voice/incoming'),
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        return $this->created($phoneNumber, 'Phone number purchased successfully');
    }

    /**
     * Connect an existing phone number from user's provider account
     */
    public function connect(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string|in:twilio,callhippo',
            'phone_number' => 'required|string',
            'credentials' => 'required|array',
            'friendly_name' => 'nullable|string|max:255',
            'agent_id' => 'nullable|exists:agents,id',
        ]);

        $providerName = $request->provider;
        $credentials = $request->credentials;

        // Test connection first
        $provider = $this->providerFactory->make($providerName);
        $isConnected = $provider->testConnection($credentials);

        if (!$isConnected) {
            return $this->error('Invalid credentials. Please check and try again.', 400);
        }

        // Store integration for future use
        Integration::updateOrCreate(
            [
                'tenant_id' => $request->user()->tenant_id,
                'type' => 'voice',
                'provider' => $providerName,
            ],
            [
                'status' => 'connected',
                'credentials' => $credentials,
                'settings' => ['connected_at' => now()->toISOString()],
            ]
        );

        $phoneNumber = PhoneNumber::create([
            'tenant_id' => $request->user()->tenant_id,
            'agent_id' => $request->agent_id,
            'phone_number' => $request->phone_number,
            'friendly_name' => $request->friendly_name ?? $this->formatPhoneNumber($request->phone_number),
            'provider' => $providerName,
            'provider_id' => 'EXT_' . bin2hex(random_bytes(8)),
            'country_code' => substr($request->phone_number, 0, 2) === '+1' ? 'US' : 'XX',
            'area_code' => $this->extractAreaCode($request->phone_number),
            'status' => PhoneNumberStatus::PENDING,
            'capabilities' => ['voice' => true, 'sms' => true],
            'monthly_cost' => 0,
            'webhook_url' => url('/api/v1/webhooks/voice/incoming'),
            'is_verified' => false,
            'settings' => [
                'external' => true,
            ],
        ]);

        return $this->created($phoneNumber, 'Phone number connected successfully. Verification pending.');
    }

    /**
     * Show a specific phone number
     */
    public function show(Request $request, PhoneNumber $phoneNumber): JsonResponse
    {
        if ($phoneNumber->tenant_id !== $request->user()->tenant_id) {
            return $this->notFound();
        }

        $phoneNumber->load('agent:id,name,type', 'callLogs');

        return $this->success($phoneNumber);
    }

    /**
     * Update a phone number
     */
    public function update(Request $request, PhoneNumber $phoneNumber): JsonResponse
    {
        if ($phoneNumber->tenant_id !== $request->user()->tenant_id) {
            return $this->notFound();
        }

        $request->validate([
            'friendly_name' => 'nullable|string|max:255',
            'agent_id' => 'nullable|exists:agents,id',
            'settings' => 'nullable|array',
        ]);

        $phoneNumber->update($request->only(['friendly_name', 'agent_id', 'settings']));

        return $this->success($phoneNumber);
    }

    /**
     * Delete/release a phone number
     */
    public function destroy(Request $request, PhoneNumber $phoneNumber): JsonResponse
    {
        if ($phoneNumber->tenant_id !== $request->user()->tenant_id) {
            return $this->notFound();
        }

        // In production, this would:
        // 1. Release the number via Twilio API (if purchased through us)
        // 2. Remove webhook configurations

        $phoneNumber->delete();

        return $this->success(null, 'Phone number released successfully');
    }

    /**
     * Verify a connected phone number
     */
    public function verify(Request $request, PhoneNumber $phoneNumber): JsonResponse
    {
        if ($phoneNumber->tenant_id !== $request->user()->tenant_id) {
            return $this->notFound();
        }

        // In production, this would verify the number is configured correctly
        // and webhooks are properly set up

        $phoneNumber->update([
            'status' => PhoneNumberStatus::ACTIVE,
            'is_verified' => true,
            'verified_at' => now(),
        ]);

        return $this->success($phoneNumber, 'Phone number verified successfully');
    }

    /**
     * Get call statistics for a phone number
     */
    public function stats(Request $request, PhoneNumber $phoneNumber): JsonResponse
    {
        if ($phoneNumber->tenant_id !== $request->user()->tenant_id) {
            return $this->notFound();
        }

        $stats = [
            'total_calls' => $phoneNumber->callLogs()->count(),
            'inbound_calls' => $phoneNumber->callLogs()->where('direction', 'inbound')->count(),
            'outbound_calls' => $phoneNumber->callLogs()->where('direction', 'outbound')->count(),
            'completed_calls' => $phoneNumber->callLogs()->where('status', 'completed')->count(),
            'missed_calls' => $phoneNumber->callLogs()->where('status', 'no_answer')->count(),
            'average_duration' => $phoneNumber->callLogs()->avg('duration') ?? 0,
            'total_duration' => $phoneNumber->callLogs()->sum('duration'),
        ];

        return $this->success($stats);
    }

    /**
     * Format phone number for display
     */
    private function formatPhoneNumber(string $number): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $number);
        
        if (strlen($cleaned) === 11 && $cleaned[0] === '1') {
            return sprintf('(%s) %s-%s', 
                substr($cleaned, 1, 3), 
                substr($cleaned, 4, 3), 
                substr($cleaned, 7)
            );
        }
        
        return $number;
    }

    /**
     * Extract area code from phone number
     */
    private function extractAreaCode(string $number): ?string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $number);
        
        if (strlen($cleaned) >= 10) {
            // Remove country code if present
            if (strlen($cleaned) === 11 && $cleaned[0] === '1') {
                $cleaned = substr($cleaned, 1);
            }
            return substr($cleaned, 0, 3);
        }
        
        return null;
    }

    /**
     * Get provider credentials from integration or config
     */
    private function getProviderCredentials(int $tenantId, string $provider): ?array
    {
        // Check tenant-specific integration first
        $integration = Integration::where('tenant_id', $tenantId)
            ->where('type', 'voice')
            ->where('provider', $provider)
            ->where('status', 'connected')
            ->first();

        if ($integration && !empty($integration->credentials)) {
            return $integration->credentials;
        }

        // Fall back to system config
        $config = config("services.{$provider}");
        
        if ($provider === 'twilio' && !empty($config['account_sid']) && !empty($config['auth_token'])) {
            return [
                'account_sid' => $config['account_sid'],
                'auth_token' => $config['auth_token'],
            ];
        }

        if ($provider === 'callhippo' && !empty($config['api_key'])) {
            return [
                'api_key' => $config['api_key'],
            ];
        }

        return null;
    }
}
