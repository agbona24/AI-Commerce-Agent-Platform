<?php

namespace App\Services\Voice;

use App\Contracts\Voice\VoiceProviderInterface;
use InvalidArgumentException;

class VoiceProviderFactory
{
    protected array $providers = [];

    public function __construct()
    {
        $this->providers = [
            'twilio' => TwilioService::class,
            'callhippo' => CallHippoService::class,
        ];
    }

    /**
     * Create a voice provider instance
     */
    public function make(string $provider): VoiceProviderInterface
    {
        $provider = strtolower($provider);
        
        if (!isset($this->providers[$provider])) {
            throw new InvalidArgumentException("Unknown voice provider: {$provider}");
        }

        return app($this->providers[$provider]);
    }

    /**
     * Get list of available providers
     */
    public function getAvailableProviders(): array
    {
        return [
            [
                'id' => 'twilio',
                'name' => 'Twilio',
                'description' => 'Industry-leading cloud communications platform',
                'logo' => '/images/providers/twilio.svg',
                'features' => [
                    'Global coverage in 100+ countries',
                    'High reliability (99.95% uptime)',
                    'Advanced voice features',
                    'Excellent documentation',
                ],
                'pricing' => [
                    'local_number' => 1.50,
                    'toll_free' => 2.00,
                    'inbound_call' => 0.0085,
                    'outbound_call' => 0.014,
                ],
                'required_credentials' => ['account_sid', 'auth_token'],
            ],
            [
                'id' => 'callhippo',
                'name' => 'CallHippo',
                'description' => 'Virtual phone system for growing businesses',
                'logo' => '/images/providers/callhippo.svg',
                'features' => [
                    'Numbers in 50+ countries',
                    'Built-in power dialer',
                    'Native CRM integrations',
                    'Affordable pricing',
                ],
                'pricing' => [
                    'local_number' => 2.00,
                    'toll_free' => 3.00,
                    'inbound_call' => 0.01,
                    'outbound_call' => 0.015,
                ],
                'required_credentials' => ['api_key'],
            ],
        ];
    }

    /**
     * Check if a provider is supported
     */
    public function isSupported(string $provider): bool
    {
        return isset($this->providers[strtolower($provider)]);
    }

    /**
     * Register a new provider
     */
    public function register(string $name, string $class): void
    {
        $this->providers[strtolower($name)] = $class;
    }
}
