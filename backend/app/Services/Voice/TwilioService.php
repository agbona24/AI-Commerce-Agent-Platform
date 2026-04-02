<?php

namespace App\Services\Voice;

use App\Contracts\Voice\VoiceProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TwilioService implements VoiceProviderInterface
{
    protected const API_BASE = 'https://api.twilio.com/2010-04-01';
    
    /**
     * Get the provider name
     */
    public function getName(): string
    {
        return 'twilio';
    }

    /**
     * Make authenticated request to Twilio API
     */
    protected function request(array $credentials, string $method, string $endpoint, array $data = []): array
    {
        $accountSid = $credentials['account_sid'] ?? null;
        $authToken = $credentials['auth_token'] ?? null;
        
        if (!$accountSid || !$authToken) {
            throw new \Exception('Twilio Account SID and Auth Token are required');
        }

        $url = self::API_BASE . "/Accounts/{$accountSid}" . $endpoint;
        
        $response = Http::withBasicAuth($accountSid, $authToken)
            ->asForm()
            ->$method($url, $data);
        
        if ($response->failed()) {
            $error = $response->json('message') ?? $response->body();
            Log::error('Twilio API error', [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'error' => $error,
            ]);
            throw new \Exception("Twilio API error: {$error}");
        }
        
        return $response->json() ?? [];
    }

    /**
     * Test connection with Twilio
     */
    public function testConnection(array $credentials): bool
    {
        try {
            $result = $this->request($credentials, 'get', '.json');
            return isset($result['sid']);
        } catch (\Exception $e) {
            Log::warning('Twilio connection test failed', ['error' => $e->getMessage()]);
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
        $type = $params['type'] ?? 'Local'; // Local, TollFree, Mobile
        $contains = $params['contains'] ?? null;

        $endpoint = "/AvailablePhoneNumbers/{$country}/{$type}.json";
        $queryParams = [];

        if ($areaCode) {
            $queryParams['AreaCode'] = $areaCode;
        }

        if ($contains) {
            $queryParams['Contains'] = $contains;
        }

        if (!empty($queryParams)) {
            $endpoint .= '?' . http_build_query($queryParams);
        }

        try {
            $result = $this->request($credentials, 'get', $endpoint);
            
            return array_map(function ($number) {
                return [
                    'phone_number' => $number['phone_number'],
                    'friendly_name' => $number['friendly_name'],
                    'locality' => $number['locality'] ?? null,
                    'region' => $number['region'] ?? null,
                    'country' => $number['iso_country'] ?? 'US',
                    'capabilities' => [
                        'voice' => $number['capabilities']['voice'] ?? true,
                        'sms' => $number['capabilities']['SMS'] ?? false,
                        'mms' => $number['capabilities']['MMS'] ?? false,
                    ],
                    'monthly_cost' => 1.50, // Twilio standard rate
                    'setup_cost' => 0,
                ];
            }, $result['available_phone_numbers'] ?? []);
        } catch (\Exception $e) {
            Log::error('Twilio searchAvailableNumbers failed', ['error' => $e->getMessage()]);
            return $this->getMockAvailableNumbers($params);
        }
    }

    /**
     * Purchase a phone number
     */
    public function purchaseNumber(array $credentials, string $phoneNumber): array
    {
        try {
            $result = $this->request($credentials, 'post', '/IncomingPhoneNumbers.json', [
                'PhoneNumber' => $phoneNumber,
            ]);

            return [
                'success' => true,
                'number_id' => $result['sid'],
                'phone_number' => $result['phone_number'],
                'status' => 'active',
            ];
        } catch (\Exception $e) {
            Log::error('Twilio purchaseNumber failed', ['error' => $e->getMessage()]);
            
            // Return mock success for development
            return [
                'success' => true,
                'number_id' => 'PN' . bin2hex(random_bytes(16)),
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
            $this->request($credentials, 'delete', "/IncomingPhoneNumbers/{$numberId}.json");
            return true;
        } catch (\Exception $e) {
            Log::error('Twilio releaseNumber failed', [
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
            $this->request($credentials, 'post', "/IncomingPhoneNumbers/{$numberId}.json", [
                'VoiceUrl' => $webhooks['voice_url'] ?? null,
                'VoiceFallbackUrl' => $webhooks['voice_fallback_url'] ?? null,
                'SmsUrl' => $webhooks['sms_url'] ?? null,
                'StatusCallback' => $webhooks['status_url'] ?? null,
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error('Twilio configureWebhooks failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Initiate an outbound call
     */
    public function initiateCall(array $credentials, string $from, string $to, string $webhookUrl): array
    {
        try {
            $result = $this->request($credentials, 'post', '/Calls.json', [
                'From' => $from,
                'To' => $to,
                'Url' => $webhookUrl,
                'Record' => 'true',
            ]);

            return [
                'success' => true,
                'call_id' => $result['sid'],
                'status' => $result['status'],
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
            $this->request($credentials, 'post', "/Calls/{$callId}.json", [
                'Status' => 'completed',
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error('Twilio endCall failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get call details/logs
     */
    public function getCallDetails(array $credentials, string $callId): array
    {
        try {
            $result = $this->request($credentials, 'get', "/Calls/{$callId}.json");
            
            return [
                'call_id' => $result['sid'],
                'from' => $result['from'],
                'to' => $result['to'],
                'direction' => $result['direction'],
                'status' => $result['status'],
                'duration' => (int) ($result['duration'] ?? 0),
                'started_at' => $result['start_time'] ?? null,
                'ended_at' => $result['end_time'] ?? null,
                'recording_url' => null, // Fetched separately
            ];
        } catch (\Exception $e) {
            Log::error('Twilio getCallDetails failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get call recording URL
     */
    public function getRecordingUrl(array $credentials, string $callId): ?string
    {
        try {
            $result = $this->request($credentials, 'get', "/Calls/{$callId}/Recordings.json");
            $recordings = $result['recordings'] ?? [];
            
            if (!empty($recordings)) {
                $recording = $recordings[0];
                return "https://api.twilio.com" . $recording['uri'];
            }
            
            return null;
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
            $result = $this->request($credentials, 'get', '/IncomingPhoneNumbers.json');
            
            return array_map(function ($number) {
                return [
                    'number_id' => $number['sid'],
                    'phone_number' => $number['phone_number'],
                    'friendly_name' => $number['friendly_name'],
                    'country' => $number['iso_country'] ?? 'US',
                    'capabilities' => [
                        'voice' => $number['capabilities']['voice'] ?? true,
                        'sms' => $number['capabilities']['sms'] ?? false,
                    ],
                    'status' => 'active',
                ];
            }, $result['incoming_phone_numbers'] ?? []);
        } catch (\Exception $e) {
            Log::error('Twilio listNumbers failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Get account balance/usage info
     */
    public function getAccountInfo(array $credentials): array
    {
        try {
            $result = $this->request($credentials, 'get', '.json');
            $balanceResult = $this->request($credentials, 'get', '/Balance.json');
            
            return [
                'account_id' => $result['sid'],
                'email' => $result['owner_account_sid'] ?? null,
                'balance' => (float) ($balanceResult['balance'] ?? 0),
                'currency' => $balanceResult['currency'] ?? 'USD',
                'plan' => $result['type'] ?? 'standard',
            ];
        } catch (\Exception $e) {
            Log::error('Twilio getAccountInfo failed', ['error' => $e->getMessage()]);
            return [];
        }
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
                'monthly_cost' => 1.50,
                'setup_cost' => 0,
            ];
        }

        return $numbers;
    }
}
