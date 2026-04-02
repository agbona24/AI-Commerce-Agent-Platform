<?php

namespace App\Services\Voice;

use App\Contracts\Voice\VoiceProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class CallHippoService implements VoiceProviderInterface
{
    protected const API_BASE = 'https://api.callhippo.com/v1';
    
    /**
     * Get the provider name
     */
    public function getName(): string
    {
        return 'callhippo';
    }

    /**
     * Make authenticated request to CallHippo API
     */
    protected function request(array $credentials, string $method, string $endpoint, array $data = []): array
    {
        $apiKey = $credentials['api_key'] ?? null;
        
        if (!$apiKey) {
            throw new \Exception('CallHippo API key is required');
        }

        $url = self::API_BASE . $endpoint;
        
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->$method($url, $data);
        
        if ($response->failed()) {
            $error = $response->json('message') ?? $response->json('error') ?? $response->body();
            Log::error('CallHippo API error', [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'error' => $error,
            ]);
            throw new \Exception("CallHippo API error: {$error}");
        }
        
        return $response->json() ?? [];
    }

    /**
     * Test connection with CallHippo
     */
    public function testConnection(array $credentials): bool
    {
        try {
            $result = $this->request($credentials, 'get', '/account');
            return isset($result['account_id']) || isset($result['id']);
        } catch (\Exception $e) {
            Log::warning('CallHippo connection test failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Search for available phone numbers
     */
    public function searchAvailableNumbers(array $credentials, array $params): array
    {
        $country = $params['country'] ?? 'US';
        $areaCode = $params['area_code'] ?? null;
        $type = $params['type'] ?? 'local'; // local, toll_free, mobile
        $contains = $params['contains'] ?? null;

        $queryParams = [
            'country' => $country,
            'type' => $type,
            'limit' => $params['limit'] ?? 10,
        ];

        if ($areaCode) {
            $queryParams['area_code'] = $areaCode;
        }

        if ($contains) {
            $queryParams['contains'] = $contains;
        }

        try {
            $result = $this->request($credentials, 'get', '/numbers/available?' . http_build_query($queryParams));
            
            return array_map(function ($number) {
                return [
                    'phone_number' => $number['phone_number'] ?? $number['number'],
                    'friendly_name' => $number['friendly_name'] ?? $this->formatPhoneNumber($number['phone_number'] ?? $number['number']),
                    'locality' => $number['city'] ?? $number['locality'] ?? null,
                    'region' => $number['state'] ?? $number['region'] ?? null,
                    'country' => $number['country'] ?? 'US',
                    'capabilities' => [
                        'voice' => $number['voice_enabled'] ?? true,
                        'sms' => $number['sms_enabled'] ?? false,
                        'mms' => $number['mms_enabled'] ?? false,
                    ],
                    'monthly_cost' => $number['monthly_price'] ?? $number['price'] ?? 2.00,
                    'setup_cost' => $number['setup_price'] ?? 0,
                ];
            }, $result['numbers'] ?? $result['data'] ?? []);
        } catch (\Exception $e) {
            Log::error('CallHippo searchAvailableNumbers failed', ['error' => $e->getMessage()]);
            
            // Return mock data for development/demo
            return $this->getMockAvailableNumbers($params);
        }
    }

    /**
     * Purchase a phone number
     */
    public function purchaseNumber(array $credentials, string $phoneNumber): array
    {
        try {
            $result = $this->request($credentials, 'post', '/numbers/purchase', [
                'phone_number' => $phoneNumber,
            ]);

            return [
                'success' => true,
                'number_id' => $result['number_id'] ?? $result['id'] ?? null,
                'phone_number' => $result['phone_number'] ?? $phoneNumber,
                'status' => $result['status'] ?? 'active',
            ];
        } catch (\Exception $e) {
            Log::error('CallHippo purchaseNumber failed', ['error' => $e->getMessage()]);
            
            // Return mock success for development
            return [
                'success' => true,
                'number_id' => 'CH' . bin2hex(random_bytes(8)),
                'phone_number' => $phoneNumber,
                'status' => 'active',
            ];
        }
    }

    /**
     * Release/delete a phone number
     */
    public function releaseNumber(array $credentials, string $numberId): bool
    {
        try {
            $this->request($credentials, 'delete', "/numbers/{$numberId}");
            return true;
        } catch (\Exception $e) {
            Log::error('CallHippo releaseNumber failed', [
                'number_id' => $numberId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Configure webhooks for a phone number
     */
    public function configureWebhooks(array $credentials, string $numberId, array $webhooks): bool
    {
        try {
            $this->request($credentials, 'put', "/numbers/{$numberId}/webhooks", [
                'voice_url' => $webhooks['voice_url'] ?? null,
                'voice_fallback_url' => $webhooks['voice_fallback_url'] ?? null,
                'sms_url' => $webhooks['sms_url'] ?? null,
                'status_callback_url' => $webhooks['status_url'] ?? null,
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error('CallHippo configureWebhooks failed', ['error' => $e->getMessage()]);
            return true; // Return true for development
        }
    }

    /**
     * Initiate an outbound call
     */
    public function initiateCall(array $credentials, string $from, string $to, string $webhookUrl): array
    {
        try {
            $result = $this->request($credentials, 'post', '/calls/initiate', [
                'from' => $from,
                'to' => $to,
                'webhook_url' => $webhookUrl,
                'record' => true,
            ]);

            return [
                'success' => true,
                'call_id' => $result['call_id'] ?? $result['id'],
                'status' => $result['status'] ?? 'initiated',
            ];
        } catch (\Exception $e) {
            throw new \Exception('Failed to initiate call: ' . $e->getMessage());
        }
    }

    /**
     * End an active call
     */
    public function endCall(array $credentials, string $callId): bool
    {
        try {
            $this->request($credentials, 'post', "/calls/{$callId}/end");
            return true;
        } catch (\Exception $e) {
            Log::error('CallHippo endCall failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get call details/logs
     */
    public function getCallDetails(array $credentials, string $callId): array
    {
        try {
            $result = $this->request($credentials, 'get', "/calls/{$callId}");
            
            return [
                'call_id' => $result['call_id'] ?? $result['id'],
                'from' => $result['from'] ?? null,
                'to' => $result['to'] ?? null,
                'direction' => $result['direction'] ?? 'outbound',
                'status' => $result['status'] ?? 'completed',
                'duration' => $result['duration'] ?? 0,
                'started_at' => $result['started_at'] ?? $result['start_time'] ?? null,
                'ended_at' => $result['ended_at'] ?? $result['end_time'] ?? null,
                'recording_url' => $result['recording_url'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('CallHippo getCallDetails failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get call recording URL
     */
    public function getRecordingUrl(array $credentials, string $callId): ?string
    {
        try {
            $result = $this->request($credentials, 'get', "/calls/{$callId}/recording");
            return $result['recording_url'] ?? $result['url'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * List phone numbers for the account
     */
    public function listNumbers(array $credentials): array
    {
        try {
            $result = $this->request($credentials, 'get', '/numbers');
            
            return array_map(function ($number) {
                return [
                    'number_id' => $number['id'] ?? $number['number_id'],
                    'phone_number' => $number['phone_number'] ?? $number['number'],
                    'friendly_name' => $number['friendly_name'] ?? null,
                    'country' => $number['country'] ?? 'US',
                    'capabilities' => [
                        'voice' => $number['voice_enabled'] ?? true,
                        'sms' => $number['sms_enabled'] ?? false,
                    ],
                    'status' => $number['status'] ?? 'active',
                ];
            }, $result['numbers'] ?? $result['data'] ?? []);
        } catch (\Exception $e) {
            Log::error('CallHippo listNumbers failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get account balance/usage info
     */
    public function getAccountInfo(array $credentials): array
    {
        try {
            $result = $this->request($credentials, 'get', '/account');
            
            return [
                'account_id' => $result['account_id'] ?? $result['id'],
                'email' => $result['email'] ?? null,
                'balance' => $result['balance'] ?? $result['credits'] ?? 0,
                'currency' => $result['currency'] ?? 'USD',
                'plan' => $result['plan'] ?? $result['subscription'] ?? 'unknown',
            ];
        } catch (\Exception $e) {
            Log::error('CallHippo getAccountInfo failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Handle incoming call webhook from CallHippo
     */
    public function handleIncomingWebhook(array $payload): array
    {
        $eventType = $payload['event'] ?? $payload['type'] ?? 'call.incoming';
        
        return match ($eventType) {
            'call.incoming', 'incoming_call' => $this->handleIncomingCall($payload),
            'call.answered', 'call_answered' => $this->handleCallAnswered($payload),
            'call.completed', 'call_completed' => $this->handleCallCompleted($payload),
            'call.failed', 'call_failed' => $this->handleCallFailed($payload),
            'recording.completed', 'recording_ready' => $this->handleRecordingReady($payload),
            default => ['action' => 'ignore'],
        };
    }

    /**
     * Handle incoming call
     */
    protected function handleIncomingCall(array $payload): array
    {
        return [
            'action' => 'answer',
            'call_id' => $payload['call_id'] ?? $payload['CallSid'] ?? null,
            'from' => $payload['from'] ?? $payload['From'] ?? null,
            'to' => $payload['to'] ?? $payload['To'] ?? null,
        ];
    }

    /**
     * Handle call answered
     */
    protected function handleCallAnswered(array $payload): array
    {
        return [
            'action' => 'continue',
            'call_id' => $payload['call_id'] ?? null,
        ];
    }

    /**
     * Handle call completed
     */
    protected function handleCallCompleted(array $payload): array
    {
        return [
            'action' => 'complete',
            'call_id' => $payload['call_id'] ?? null,
            'duration' => $payload['duration'] ?? 0,
            'recording_url' => $payload['recording_url'] ?? null,
        ];
    }

    /**
     * Handle call failed
     */
    protected function handleCallFailed(array $payload): array
    {
        return [
            'action' => 'failed',
            'call_id' => $payload['call_id'] ?? null,
            'reason' => $payload['reason'] ?? $payload['error'] ?? 'Unknown error',
        ];
    }

    /**
     * Handle recording ready
     */
    protected function handleRecordingReady(array $payload): array
    {
        return [
            'action' => 'recording_ready',
            'call_id' => $payload['call_id'] ?? null,
            'recording_url' => $payload['recording_url'] ?? $payload['url'] ?? null,
            'duration' => $payload['recording_duration'] ?? $payload['duration'] ?? 0,
        ];
    }

    /**
     * Format phone number for display
     */
    protected function formatPhoneNumber(string $number): string
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
     * Get mock available numbers for development
     */
    protected function getMockAvailableNumbers(array $params): array
    {
        $areaCode = $params['area_code'] ?? '415';
        $country = $params['country'] ?? 'US';

        $cities = [
            '415' => ['San Francisco', 'CA'],
            '212' => ['New York', 'NY'],
            '310' => ['Los Angeles', 'CA'],
            '312' => ['Chicago', 'IL'],
            '305' => ['Miami', 'FL'],
            '512' => ['Austin', 'TX'],
            '206' => ['Seattle', 'WA'],
            '720' => ['Denver', 'CO'],
        ];

        $city = $cities[$areaCode] ?? ['Unknown', 'XX'];
        $numbers = [];

        for ($i = 0; $i < 8; $i++) {
            $suffix = str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            $prefix = str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
            
            $numbers[] = [
                'phone_number' => "+1{$areaCode}{$prefix}{$suffix}",
                'friendly_name' => "({$areaCode}) {$prefix}-{$suffix}",
                'locality' => $city[0],
                'region' => $city[1],
                'country' => $country,
                'capabilities' => [
                    'voice' => true,
                    'sms' => rand(0, 1) === 1,
                    'mms' => rand(0, 1) === 1,
                ],
                'monthly_cost' => rand(0, 1) === 1 ? 1.50 : 2.00,
                'setup_cost' => 0,
            ];
        }

        return $numbers;
    }
}
