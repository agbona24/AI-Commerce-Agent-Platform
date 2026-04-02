<?php

namespace App\Services\WhatsApp;

use App\Models\Agent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Integration;
use App\Enums\ChannelType;
use App\Enums\ConversationStatus;
use App\Enums\MessageRole;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected ?string $apiToken;
    protected ?string $phoneNumberId;
    protected string $apiVersion = 'v18.0';
    protected string $baseUrl = 'https://graph.facebook.com';

    public function __construct()
    {
        $this->apiToken = config('services.whatsapp.api_token');
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
    }

    /**
     * Configure for specific tenant
     */
    public function forTenant(int $tenantId): self
    {
        $integration = Integration::where('tenant_id', $tenantId)
            ->where('type', 'whatsapp')
            ->where('status', 'connected')
            ->first();

        if ($integration) {
            $this->apiToken = $integration->credentials['api_token'] ?? null;
            $this->phoneNumberId = $integration->credentials['phone_number_id'] ?? null;
        }

        return $this;
    }

    /**
     * Handle incoming webhook
     */
    public function handleWebhook(array $payload): void
    {
        $entry = $payload['entry'][0] ?? null;
        if (!$entry) return;

        $changes = $entry['changes'][0] ?? null;
        if (!$changes || $changes['field'] !== 'messages') return;

        $value = $changes['value'];
        $messages = $value['messages'] ?? [];

        foreach ($messages as $message) {
            $this->processIncomingMessage($message, $value);
        }
    }

    /**
     * Process incoming message
     */
    protected function processIncomingMessage(array $message, array $metadata): void
    {
        $phoneNumberId = $metadata['metadata']['phone_number_id'] ?? null;
        $from = $message['from'];
        $messageId = $message['id'];
        $timestamp = $message['timestamp'];

        // Find tenant by phone number ID
        $integration = Integration::where('type', 'whatsapp')
            ->whereJsonContains('credentials->phone_number_id', $phoneNumberId)
            ->first();

        if (!$integration) {
            Log::warning('WhatsApp message received for unknown phone number', ['phone_number_id' => $phoneNumberId]);
            return;
        }

        $tenantId = $integration->tenant_id;

        // Find or create conversation
        $conversation = Conversation::firstOrCreate(
            [
                'tenant_id' => $tenantId,
                'channel' => ChannelType::WHATSAPP,
                'customer_phone' => $from,
                'status' => ConversationStatus::ACTIVE,
            ],
            [
                'agent_id' => $this->getDefaultAgent($tenantId)?->id,
            ]
        );

        // Extract message content
        $content = $this->extractMessageContent($message);

        // Save message
        $msg = Message::create([
            'conversation_id' => $conversation->id,
            'role' => MessageRole::USER,
            'content' => $content['text'],
            'content_type' => $content['type'],
            'attachments' => $content['attachments'] ?? null,
            'metadata' => ['whatsapp_message_id' => $messageId],
        ]);

        // Mark as delivered
        $this->markAsRead($messageId);

        // Update conversation
        $conversation->update(['last_message_at' => now()]);

        // Generate and send response if agent is assigned
        if ($conversation->agent) {
            $this->generateAndSendResponse($conversation, $content['text']);
        }
    }

    /**
     * Extract content from WhatsApp message
     */
    protected function extractMessageContent(array $message): array
    {
        $type = $message['type'];

        return match($type) {
            'text' => [
                'type' => 'text',
                'text' => $message['text']['body'],
            ],
            'image' => [
                'type' => 'image',
                'text' => $message['image']['caption'] ?? '',
                'attachments' => [['type' => 'image', 'id' => $message['image']['id']]],
            ],
            'audio' => [
                'type' => 'audio',
                'text' => '[Voice message]',
                'attachments' => [['type' => 'audio', 'id' => $message['audio']['id']]],
            ],
            'document' => [
                'type' => 'document',
                'text' => $message['document']['filename'] ?? '[Document]',
                'attachments' => [['type' => 'document', 'id' => $message['document']['id']]],
            ],
            default => [
                'type' => 'text',
                'text' => "[Unsupported message type: {$type}]",
            ],
        };
    }

    /**
     * Send text message
     */
    public function sendMessage(string $to, string $message): array
    {
        $response = Http::withToken($this->apiToken)
            ->post("{$this->baseUrl}/{$this->apiVersion}/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $to,
                'type' => 'text',
                'text' => [
                    'preview_url' => false,
                    'body' => $message,
                ],
            ]);

        return $response->json();
    }

    /**
     * Send template message
     */
    public function sendTemplate(string $to, string $templateName, array $components = [], string $language = 'en'): array
    {
        $response = Http::withToken($this->apiToken)
            ->post("{$this->baseUrl}/{$this->apiVersion}/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $to,
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => ['code' => $language],
                    'components' => $components,
                ],
            ]);

        return $response->json();
    }

    /**
     * Send interactive message with buttons
     */
    public function sendButtons(string $to, string $bodyText, array $buttons, ?string $headerText = null): array
    {
        $interactive = [
            'type' => 'button',
            'body' => ['text' => $bodyText],
            'action' => [
                'buttons' => array_map(fn($btn, $i) => [
                    'type' => 'reply',
                    'reply' => [
                        'id' => $btn['id'] ?? "btn_{$i}",
                        'title' => $btn['title'],
                    ],
                ], $buttons, array_keys($buttons)),
            ],
        ];

        if ($headerText) {
            $interactive['header'] = ['type' => 'text', 'text' => $headerText];
        }

        $response = Http::withToken($this->apiToken)
            ->post("{$this->baseUrl}/{$this->apiVersion}/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $to,
                'type' => 'interactive',
                'interactive' => $interactive,
            ]);

        return $response->json();
    }

    /**
     * Send product catalog
     */
    public function sendProductList(string $to, string $headerText, string $bodyText, array $products): array
    {
        $sections = [[
            'title' => 'Products',
            'product_items' => array_map(fn($p) => ['product_retailer_id' => $p['id']], $products),
        ]];

        $response = Http::withToken($this->apiToken)
            ->post("{$this->baseUrl}/{$this->apiVersion}/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $to,
                'type' => 'interactive',
                'interactive' => [
                    'type' => 'product_list',
                    'header' => ['type' => 'text', 'text' => $headerText],
                    'body' => ['text' => $bodyText],
                    'action' => [
                        'catalog_id' => config('services.whatsapp.catalog_id'),
                        'sections' => $sections,
                    ],
                ],
            ]);

        return $response->json();
    }

    /**
     * Mark message as read
     */
    public function markAsRead(string $messageId): void
    {
        Http::withToken($this->apiToken)
            ->post("{$this->baseUrl}/{$this->apiVersion}/{$this->phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'status' => 'read',
                'message_id' => $messageId,
            ]);
    }

    /**
     * Get message templates
     */
    public function getTemplates(): array
    {
        $response = Http::withToken($this->apiToken)
            ->get("{$this->baseUrl}/{$this->apiVersion}/{$this->phoneNumberId}/message_templates");

        return $response->json()['data'] ?? [];
    }

    /**
     * Get default agent for tenant
     */
    protected function getDefaultAgent(int $tenantId): ?Agent
    {
        return Agent::where('tenant_id', $tenantId)
            ->whereJsonContains('channels', 'whatsapp')
            ->where('status', 'active')
            ->first();
    }

    /**
     * Generate and send AI response
     */
    protected function generateAndSendResponse(Conversation $conversation, string $input): void
    {
        // TODO: Integrate with AI service
        $response = "Thank you for your message. How can I assist you today?";

        // Save assistant message
        Message::create([
            'conversation_id' => $conversation->id,
            'role' => MessageRole::ASSISTANT,
            'content' => $response,
            'content_type' => 'text',
        ]);

        // Send via WhatsApp
        $this->forTenant($conversation->tenant_id)
            ->sendMessage($conversation->customer_phone, $response);
    }
}
