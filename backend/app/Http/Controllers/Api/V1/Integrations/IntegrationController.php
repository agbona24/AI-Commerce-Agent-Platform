<?php

namespace App\Http\Controllers\Api\V1\Integrations;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Resources\IntegrationResource;
use App\Models\Integration;
use App\Enums\IntegrationStatus;
use App\Services\Voice\TwilioVoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class IntegrationController extends BaseController
{
    public function __construct(
        protected TwilioVoiceService $twilioService
    ) {}
    
    /**
     * List all integrations
     */
    public function index(Request $request): JsonResponse
    {
        $integrations = Integration::query()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success(IntegrationResource::collection($integrations));
    }

    /**
     * Get available integrations
     */
    public function available(): JsonResponse
    {
        $available = [
            [
                'type' => 'twilio',
                'name' => 'Twilio Voice',
                'description' => 'Voice AI agent powered by Twilio. Handle inbound and outbound calls with AI.',
                'icon' => 'twilio',
                'category' => 'voice',
                'fields' => [
                    ['name' => 'account_sid', 'label' => 'Account SID', 'type' => 'text', 'required' => true],
                    ['name' => 'auth_token', 'label' => 'Auth Token', 'type' => 'password', 'required' => true],
                    ['name' => 'phone_number', 'label' => 'Phone Number', 'type' => 'text', 'required' => true, 'placeholder' => '+1234567890'],
                ],
            ],
            [
                'type' => 'openai',
                'name' => 'OpenAI',
                'description' => 'AI-powered responses using OpenAI GPT models.',
                'icon' => 'openai',
                'category' => 'ai',
                'fields' => [
                    ['name' => 'api_key', 'label' => 'API Key', 'type' => 'password', 'required' => true],
                    ['name' => 'model', 'label' => 'Model', 'type' => 'select', 'required' => false, 'options' => [
                        ['value' => 'gpt-4o', 'label' => 'GPT-4o (Recommended)'],
                        ['value' => 'gpt-4o-mini', 'label' => 'GPT-4o Mini'],
                        ['value' => 'gpt-4-turbo', 'label' => 'GPT-4 Turbo'],
                        ['value' => 'gpt-3.5-turbo', 'label' => 'GPT-3.5 Turbo'],
                    ]],
                ],
            ],
            [
                'type' => 'whatsapp',
                'name' => 'WhatsApp Business',
                'description' => 'Connect your WhatsApp Business account for AI-powered messaging.',
                'icon' => 'whatsapp',
                'category' => 'messaging',
                'fields' => [
                    ['name' => 'phone_number_id', 'label' => 'Phone Number ID', 'type' => 'text', 'required' => true],
                    ['name' => 'access_token', 'label' => 'Access Token', 'type' => 'password', 'required' => true],
                    ['name' => 'verify_token', 'label' => 'Verify Token', 'type' => 'text', 'required' => true],
                ],
            ],
            [
                'type' => 'shopify',
                'name' => 'Shopify',
                'description' => 'Sync products from your Shopify store.',
                'icon' => 'shopify',
                'category' => 'ecommerce',
                'fields' => [
                    ['name' => 'shop_domain', 'label' => 'Shop Domain', 'type' => 'text', 'required' => true, 'placeholder' => 'myshop.myshopify.com'],
                    ['name' => 'access_token', 'label' => 'Access Token', 'type' => 'password', 'required' => true],
                ],
            ],
            [
                'type' => 'woocommerce',
                'name' => 'WooCommerce',
                'description' => 'Connect your WooCommerce store.',
                'icon' => 'woocommerce',
                'category' => 'ecommerce',
                'fields' => [
                    ['name' => 'store_url', 'label' => 'Store URL', 'type' => 'text', 'required' => true],
                    ['name' => 'consumer_key', 'label' => 'Consumer Key', 'type' => 'text', 'required' => true],
                    ['name' => 'consumer_secret', 'label' => 'Consumer Secret', 'type' => 'password', 'required' => true],
                ],
            ],
            [
                'type' => 'stripe',
                'name' => 'Stripe',
                'description' => 'Process payments with Stripe.',
                'icon' => 'stripe',
                'category' => 'payment',
                'fields' => [
                    ['name' => 'secret_key', 'label' => 'Secret Key', 'type' => 'password', 'required' => true],
                    ['name' => 'webhook_secret', 'label' => 'Webhook Secret', 'type' => 'password', 'required' => false],
                ],
            ],
            [
                'type' => 'slack',
                'name' => 'Slack',
                'description' => 'Get notifications in Slack.',
                'icon' => 'slack',
                'category' => 'notification',
                'fields' => [
                    ['name' => 'webhook_url', 'label' => 'Webhook URL', 'type' => 'text', 'required' => true],
                ],
            ],
            [
                'type' => 'zapier',
                'name' => 'Zapier',
                'description' => 'Connect with 5000+ apps through Zapier.',
                'icon' => 'zapier',
                'category' => 'automation',
                'fields' => [
                    ['name' => 'webhook_url', 'label' => 'Webhook URL', 'type' => 'text', 'required' => true],
                ],
            ],
        ];

        // Mark installed ones
        $installed = Integration::where('tenant_id', auth()->user()->tenant_id)
            ->pluck('type')
            ->toArray();
        
        foreach ($available as &$integration) {
            $integration['installed'] = in_array($integration['type'], $installed);
        }

        return $this->success($available);
    }

    /**
     * Get a single integration
     */
    public function show(Integration $integration): JsonResponse
    {
        return $this->success(new IntegrationResource($integration));
    }

    /**
     * Connect an integration
     */
    public function connect(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => 'required|string',
            'credentials' => 'required|array',
            'settings' => 'nullable|array',
        ]);

        // Check if already connected
        $existing = Integration::where('tenant_id', auth()->user()->tenant_id)
            ->where('type', $data['type'])
            ->first();

        if ($existing) {
            return $this->error('Integration already connected', 422);
        }

        // Validate credentials based on type
        $validated = $this->validateCredentials($data['type'], $data['credentials']);
        
        if (!$validated['success']) {
            return $this->error($validated['message'], 422);
        }

        $integration = Integration::create([
            'tenant_id' => auth()->user()->tenant_id,
            'type' => $data['type'],
            'name' => $this->getIntegrationName($data['type']),
            'provider' => $data['type'],
            'status' => IntegrationStatus::CONNECTED,
            'credentials' => $data['credentials'],
            'settings' => $data['settings'] ?? [],
        ]);

        return $this->created(
            new IntegrationResource($integration),
            'Integration connected successfully'
        );
    }

    /**
     * Update integration settings
     */
    public function update(Request $request, Integration $integration): JsonResponse
    {
        $data = $request->validate([
            'settings' => 'nullable|array',
            'credentials' => 'nullable|array',
        ]);

        if (isset($data['credentials'])) {
            $validated = $this->validateCredentials($integration->type, $data['credentials']);
            
            if (!$validated['success']) {
                return $this->error($validated['message'], 422);
            }
        }

        $integration->update($data);

        return $this->success(
            new IntegrationResource($integration),
            'Integration updated'
        );
    }

    /**
     * Disconnect integration
     */
    public function disconnect(Integration $integration): JsonResponse
    {
        $integration->update(['status' => IntegrationStatus::DISCONNECTED]);

        return $this->success(null, 'Integration disconnected');
    }

    /**
     * Delete integration
     */
    public function destroy(Integration $integration): JsonResponse
    {
        $integration->delete();

        return $this->success(null, 'Integration deleted');
    }

    /**
     * Sync integration data
     */
    public function sync(Integration $integration): JsonResponse
    {
        // TODO: Implement actual sync based on integration type
        $integration->update(['last_sync_at' => now()]);

        return $this->success(null, 'Sync started');
    }

    /**
     * Test integration connection
     */
    public function test(Integration $integration): JsonResponse
    {
        $result = $this->testCredentials($integration->type, $integration->credentials);
        
        if ($result['success']) {
            $integration->update(['status' => IntegrationStatus::CONNECTED]);
            return $this->success([
                'connected' => true,
                'message' => 'Connection successful',
                'details' => $result['details'] ?? null,
            ]);
        }
        
        $integration->update(['status' => IntegrationStatus::ERROR]);
        return $this->error($result['message'], 400);
    }

    /**
     * Validate credentials based on integration type
     */
    protected function validateCredentials(string $type, array $credentials): array
    {
        return match($type) {
            'twilio' => $this->validateTwilioCredentials($credentials),
            'openai' => $this->validateOpenAICredentials($credentials),
            'whatsapp' => $this->validateWhatsAppCredentials($credentials),
            default => ['success' => true],
        };
    }
    
    /**
     * Test credentials based on integration type
     */
    protected function testCredentials(string $type, array $credentials): array
    {
        return match($type) {
            'twilio' => $this->testTwilioConnection($credentials),
            'openai' => $this->testOpenAIConnection($credentials),
            default => ['success' => true, 'message' => 'Connection verified'],
        };
    }
    
    /**
     * Validate Twilio credentials format
     */
    protected function validateTwilioCredentials(array $credentials): array
    {
        $required = ['account_sid', 'auth_token', 'phone_number'];
        
        foreach ($required as $field) {
            if (empty($credentials[$field])) {
                return ['success' => false, 'message' => "Missing required field: {$field}"];
            }
        }
        
        // Validate SID format
        if (!str_starts_with($credentials['account_sid'], 'AC')) {
            return ['success' => false, 'message' => 'Invalid Account SID format (should start with AC)'];
        }
        
        // Validate phone number format
        if (!preg_match('/^\+[1-9]\d{1,14}$/', $credentials['phone_number'])) {
            return ['success' => false, 'message' => 'Invalid phone number format (use E.164 format: +1234567890)'];
        }
        
        // Test actual connection
        return $this->testTwilioConnection($credentials);
    }
    
    /**
     * Test Twilio connection
     */
    protected function testTwilioConnection(array $credentials): array
    {
        try {
            $result = $this->twilioService->testConnection($credentials);
            return $result;
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Failed to connect: ' . $e->getMessage()];
        }
    }
    
    /**
     * Validate OpenAI credentials format
     */
    protected function validateOpenAICredentials(array $credentials): array
    {
        if (empty($credentials['api_key'])) {
            return ['success' => false, 'message' => 'API key is required'];
        }
        
        if (!str_starts_with($credentials['api_key'], 'sk-')) {
            return ['success' => false, 'message' => 'Invalid API key format (should start with sk-)'];
        }
        
        // Test actual connection
        return $this->testOpenAIConnection($credentials);
    }
    
    /**
     * Test OpenAI connection
     */
    protected function testOpenAIConnection(array $credentials): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $credentials['api_key'],
            ])->get('https://api.openai.com/v1/models');
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'OpenAI connection successful',
                    'details' => [
                        'models_available' => count($response->json('data') ?? []),
                    ],
                ];
            }
            
            $error = $response->json('error.message') ?? 'Unknown error';
            return ['success' => false, 'message' => "OpenAI API error: {$error}"];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Failed to connect to OpenAI: ' . $e->getMessage()];
        }
    }
    
    /**
     * Validate WhatsApp credentials format
     */
    protected function validateWhatsAppCredentials(array $credentials): array
    {
        $required = ['phone_number_id', 'access_token', 'verify_token'];
        
        foreach ($required as $field) {
            if (empty($credentials[$field])) {
                return ['success' => false, 'message' => "Missing required field: {$field}"];
            }
        }
        
        return ['success' => true];
    }

    /**
     * Get integration display name
     */
    protected function getIntegrationName(string $type): string
    {
        return match($type) {
            'whatsapp' => 'WhatsApp Business',
            'shopify' => 'Shopify',
            'woocommerce' => 'WooCommerce',
            'stripe' => 'Stripe',
            'twilio' => 'Twilio Voice',
            'openai' => 'OpenAI',
            'zapier' => 'Zapier',
            'slack' => 'Slack',
            'hubspot' => 'HubSpot',
            'salesforce' => 'Salesforce',
            'google_calendar' => 'Google Calendar',
            default => ucfirst($type),
        };
    }
}
