<?php

namespace App\Contracts\Voice;

interface VoiceProviderInterface
{
    /**
     * Get the provider name
     */
    public function getName(): string;

    /**
     * Test connection with the provider
     */
    public function testConnection(array $credentials): bool;

    /**
     * Search for available phone numbers
     */
    public function searchAvailableNumbers(array $credentials, array $params): array;

    /**
     * Purchase a phone number
     */
    public function purchaseNumber(array $credentials, string $phoneNumber): array;

    /**
     * Release/delete a phone number
     */
    public function releaseNumber(array $credentials, string $numberId): bool;

    /**
     * Configure webhooks for a phone number
     */
    public function configureWebhooks(array $credentials, string $numberId, array $webhooks): bool;

    /**
     * Initiate an outbound call
     */
    public function initiateCall(array $credentials, string $from, string $to, string $webhookUrl): array;

    /**
     * End an active call
     */
    public function endCall(array $credentials, string $callId): bool;

    /**
     * Get call details/logs
     */
    public function getCallDetails(array $credentials, string $callId): array;

    /**
     * Get call recording URL
     */
    public function getRecordingUrl(array $credentials, string $callId): ?string;

    /**
     * List phone numbers for the account
     */
    public function listNumbers(array $credentials): array;

    /**
     * Get account balance/usage
     */
    public function getAccountInfo(array $credentials): array;
}
