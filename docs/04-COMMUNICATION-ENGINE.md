# Communication Engine

## Overview

The Communication Engine manages all customer interactions across WhatsApp and Voice channels. It handles inbound/outbound messages, maintains conversation sessions, manages AI interactions, provides human takeover capabilities, and ensures reliable message delivery through queuing.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              COMMUNICATION ENGINE                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   INBOUND                                                                            │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                        Channel Adapters (Inbound)                             │ │
│   │                                                                                │ │
│   │   ┌────────────────────────┐       ┌────────────────────────┐                 │ │
│   │   │  WhatsApp Adapter      │       │  Voice Adapter         │                 │ │
│   │   │                        │       │  (Retell / Vapi)       │                 │ │
│   │   │  • Webhook handler     │       │                        │                 │ │
│   │   │  • Message parser      │       │  • Call webhook        │                 │ │
│   │   │  • Media handler       │       │  • Speech-to-text      │                 │ │
│   │   │  • Status updates      │       │  • Real-time stream    │                 │ │
│   │   └──────────┬─────────────┘       └──────────┬─────────────┘                 │ │
│   │              │                                │                                │ │
│   │              └────────────────┬───────────────┘                                │ │
│   │                               │                                                │ │
│   └───────────────────────────────┼────────────────────────────────────────────────┘ │
│                                   ▼                                                  │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                        Message Normalizer                                      │ │
│   │   Converts channel-specific messages to unified internal format               │ │
│   └───────────────────────────────┬───────────────────────────────────────────────┘ │
│                                   │                                                  │
│                                   ▼                                                  │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                        Conversation Manager                                    │ │
│   │                                                                                │ │
│   │   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐    │ │
│   │   │ Session Manager  │  │ Context Manager  │  │ History Manager          │    │ │
│   │   │                  │  │                  │  │                          │    │ │
│   │   │ • Create session │  │ • Cart state     │  │ • Store messages         │    │ │
│   │   │ • Resume session │  │ • Order state    │  │ • Retrieve context       │    │ │
│   │   │ • Expire session │  │ • Customer info  │  │ • Conversation search    │    │ │
│   │   │ • Handover state │  │ • Intent tracking│  │                          │    │ │
│   │   └──────────────────┘  └──────────────────┘  └──────────────────────────┘    │ │
│   │                                                                                │ │
│   └───────────────────────────────┬───────────────────────────────────────────────┘ │
│                                   │                                                  │
│                ┌──────────────────┴──────────────────┐                              │
│                │                                     │                               │
│                ▼                                     ▼                               │
│   ┌────────────────────────────┐      ┌────────────────────────────────────────┐   │
│   │    AI Handler              │      │    Human Handler                       │   │
│   │                            │      │                                        │   │
│   │    Routes to AI            │      │    Routes to human agent               │   │
│   │    Orchestration Layer     │      │    when takeover triggered             │   │
│   └──────────────┬─────────────┘      └────────────────────────────────────────┘   │
│                  │                                                                   │
│                  ▼                                                                   │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                        Escalation Manager                                      │ │
│   │                                                                                │ │
│   │   • Detect escalation triggers (keywords, sentiment, AI uncertainty)           │ │
│   │   • Route to available human agent                                             │ │
│   │   • Manage handover state                                                      │ │
│   │   • Return to AI when resolved                                                 │ │
│   └───────────────────────────────────────────────────────────────────────────────┘ │
│                                   │                                                  │
│                                   ▼                                                  │
│   OUTBOUND                                                                           │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                        Message Queue (Redis)                                   │ │
│   │                                                                                │ │
│   │   • Priority queuing                                                           │ │
│   │   • Retry handling                                                             │ │
│   │   • Rate limiting per tenant                                                   │ │
│   │   • Delivery tracking                                                          │ │
│   └───────────────────────────────┬───────────────────────────────────────────────┘ │
│                                   │                                                  │
│                                   ▼                                                  │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                        Channel Adapters (Outbound)                             │ │
│   │                                                                                │ │
│   │   ┌────────────────────────┐       ┌────────────────────────┐                 │ │
│   │   │  WhatsApp Sender       │       │  Voice Response        │                 │ │
│   │   │                        │       │  (Text-to-Speech)      │                 │ │
│   │   │  • Text messages       │       │                        │                 │ │
│   │   │  • Media messages      │       │  • Real-time speech    │                 │ │
│   │   │  • Interactive buttons │       │  • Send WhatsApp link  │                 │ │
│   │   │  • Payment links       │       │  • Transfer call       │                 │ │
│   │   └────────────────────────┘       └────────────────────────┘                 │ │
│   │                                                                                │ │
│   └───────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Channel Adapters

### WhatsApp Adapter

Integrates with WhatsApp Cloud API for business messaging.

```php
<?php

namespace App\Engines\Communication\Adapters;

class WhatsAppAdapter implements ChannelAdapterInterface
{
    /**
     * Handle incoming webhook from WhatsApp Cloud API
     */
    public function handleWebhook(Request $request): void
    {
        // Verify webhook signature
        // Parse message payload
        // Route to conversation manager
    }

    /**
     * Parse incoming message to normalized format
     */
    public function parseInbound(array $payload): NormalizedMessage
    {
        return new NormalizedMessage([
            'channel' => 'whatsapp',
            'external_id' => $payload['messages'][0]['id'],
            'sender_id' => $payload['messages'][0]['from'],
            'type' => $payload['messages'][0]['type'], // text, image, audio, etc.
            'content' => $this->extractContent($payload['messages'][0]),
            'timestamp' => Carbon::createFromTimestamp($payload['messages'][0]['timestamp']),
            'metadata' => [
                'wa_id' => $payload['contacts'][0]['wa_id'],
                'profile_name' => $payload['contacts'][0]['profile']['name'] ?? null,
            ],
        ]);
    }

    /**
     * Send text message
     */
    public function sendText(
        string $phoneNumber,
        string $message,
        string $businessPhoneId
    ): SendResult;

    /**
     * Send interactive message with buttons
     */
    public function sendInteractive(
        string $phoneNumber,
        string $body,
        array $buttons, // [{id, title}]
        string $businessPhoneId
    ): SendResult;

    /**
     * Send payment link message
     */
    public function sendPaymentLink(
        string $phoneNumber,
        string $message,
        string $paymentUrl,
        string $businessPhoneId
    ): SendResult;

    /**
     * Send media (image, document, audio)
     */
    public function sendMedia(
        string $phoneNumber,
        string $mediaType,
        string $mediaUrl,
        ?string $caption,
        string $businessPhoneId
    ): SendResult;

    /**
     * Send template message (for notifications outside 24h window)
     */
    public function sendTemplate(
        string $phoneNumber,
        string $templateName,
        array $parameters,
        string $businessPhoneId
    ): SendResult;
}
```

### Voice Adapter (Retell AI)

Integrates with Retell AI for voice conversations.

```php
<?php

namespace App\Engines\Communication\Adapters;

class RetellVoiceAdapter implements VoiceAdapterInterface
{
    /**
     * Handle incoming call webhook
     */
    public function handleCallStart(array $payload): void
    {
        // Create conversation session
        // Identify tenant from phone number
        // Initialize AI agent context
    }

    /**
     * Handle real-time transcript update
     */
    public function handleTranscript(array $payload): void
    {
        // Process speech-to-text
        // Send to AI orchestrator
        // Generate response
    }

    /**
     * Respond with AI-generated speech
     */
    public function respond(
        string $callId,
        string $text,
        array $options = []
    ): void;

    /**
     * Send payment link via WhatsApp during call
     */
    public function sendPaymentLinkDuringCall(
        string $callId,
        string $phoneNumber,
        string $paymentUrl
    ): void;

    /**
     * Transfer call to human agent
     */
    public function transferCall(
        string $callId,
        string $agentPhoneNumber
    ): void;

    /**
     * End call
     */
    public function endCall(string $callId, string $reason): void;

    /**
     * Provision phone number for tenant
     */
    public function provisionPhoneNumber(
        string $tenantId,
        string $countryCode = 'US'
    ): PhoneNumber;
}
```

### Vapi Voice Adapter

Alternative voice provider.

```php
<?php

namespace App\Engines\Communication\Adapters;

class VapiVoiceAdapter implements VoiceAdapterInterface
{
    /**
     * Create AI assistant for tenant
     */
    public function createAssistant(
        string $tenantId,
        array $config
    ): Assistant;

    /**
     * Handle real-time conversation
     */
    public function handleConversation(
        string $callId,
        string $transcript
    ): string; // Response text

    /**
     * Get call analytics
     */
    public function getCallAnalytics(string $callId): CallAnalytics;
}
```

---

## Conversation Manager

### Session Management

```php
<?php

namespace App\Engines\Communication\Services;

class SessionManager
{
    private const SESSION_TTL = 3600; // 1 hour

    /**
     * Get or create conversation session
     */
    public function getOrCreateSession(
        string $tenantId,
        string $channelId, // Phone number or call ID
        string $channel    // 'whatsapp' or 'voice'
    ): ConversationSession;

    /**
     * Get session by ID
     */
    public function getSession(string $sessionId): ?ConversationSession;

    /**
     * Update session context
     */
    public function updateContext(
        string $sessionId,
        array $context
    ): void;

    /**
     * Get last N messages for context
     */
    public function getMessageHistory(
        string $sessionId,
        int $limit = 10
    ): array;

    /**
     * Mark session as handed over to human
     */
    public function markHandover(
        string $sessionId,
        string $agentId
    ): void;

    /**
     * Return session to AI
     */
    public function returnToAI(string $sessionId): void;

    /**
     * End session
     */
    public function endSession(string $sessionId): void;

    /**
     * Check if session is active
     */
    public function isActive(string $sessionId): bool;
}
```

**ConversationSession:**

```php
class ConversationSession
{
    public string $id;
    public string $tenantId;
    public string $channel; // 'whatsapp', 'voice'
    public string $channelId; // Phone number or call ID
    
    public ?string $customerId;
    public ?string $customerName;
    public ?string $customerPhone;
    
    public string $status; // 'active', 'handed_over', 'ended'
    public ?string $handedOverTo; // Agent ID
    
    public array $context; // Current conversation context
    public ?string $currentCartId;
    public ?string $currentOrderId;
    public ?string $lastIntent;
    
    public int $messageCount;
    public Carbon $startedAt;
    public Carbon $lastActivityAt;
    public ?Carbon $endedAt;
}
```

### Context Management

```php
<?php

namespace App\Engines\Communication\Services;

class ContextManager
{
    /**
     * Build context for AI request
     */
    public function buildContext(string $sessionId): ConversationContext
    {
        $session = $this->sessionManager->getSession($sessionId);
        $history = $this->sessionManager->getMessageHistory($sessionId, 10);
        $cart = $this->cartService->getCart($session->currentCartId);
        $customer = $this->customerService->getCustomer($session->customerId);

        return new ConversationContext([
            'session' => $session,
            'messages' => $this->formatMessages($history),
            'cart' => $cart ? $this->formatCart($cart) : null,
            'customer' => $customer,
            'last_intent' => $session->lastIntent,
            'tenant_config' => $this->tenantService->getAIConfig($session->tenantId),
        ]);
    }

    /**
     * Update context after AI response
     */
    public function updateAfterResponse(
        string $sessionId,
        string $intent,
        array $extractedData
    ): void;

    /**
     * Extract customer info from messages
     */
    public function extractCustomerInfo(array $messages): array;
}
```

---

## Message Queue System

### Queue Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        REDIS QUEUES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  messages:high     (Priority: Payment links, confirmations)│  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  messages:default  (Priority: AI responses)               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  messages:low      (Priority: Marketing, notifications)   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  failed_messages   (Dead letter queue)                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Message Queue Service

```php
<?php

namespace App\Engines\Communication\Services;

class MessageQueueService
{
    /**
     * Queue outbound message
     */
    public function queueMessage(
        OutboundMessage $message,
        string $priority = 'default'
    ): string; // Job ID

    /**
     * Process queued message
     */
    public function processMessage(OutboundMessage $message): SendResult;

    /**
     * Get message status
     */
    public function getMessageStatus(string $jobId): MessageStatus;

    /**
     * Retry failed message
     */
    public function retryMessage(string $jobId): void;

    /**
     * Get tenant rate limit status
     */
    public function getRateLimitStatus(string $tenantId): RateLimitStatus;
}
```

### Rate Limiting

```php
class RateLimiter
{
    /**
     * Check if message can be sent
     */
    public function canSend(string $tenantId, string $channel): bool
    {
        $key = "rate_limit:{$tenantId}:{$channel}";
        $limit = $this->getTenantLimit($tenantId, $channel);
        $current = Redis::incr($key);

        if ($current === 1) {
            Redis::expire($key, 60); // Per minute
        }

        return $current <= $limit;
    }

    private function getTenantLimit(string $tenantId, string $channel): int
    {
        // Based on tenant plan
        return match($channel) {
            'whatsapp' => 1000, // Messages per minute
            'voice' => 50,     // Concurrent calls
            default => 100,
        };
    }
}
```

---

## Escalation Manager

### Escalation Triggers

```php
<?php

namespace App\Engines\Communication\Services;

class EscalationManager
{
    private array $keywordTriggers = [
        'speak to human',
        'talk to agent',
        'real person',
        'customer service',
        'manager',
        'complaint',
    ];

    /**
     * Check if escalation is needed
     */
    public function shouldEscalate(
        string $sessionId,
        string $message,
        ?array $aiResponse = null
    ): EscalationDecision;

    /**
     * Triggers for escalation:
     * 1. Keyword match
     * 2. AI confidence below threshold
     * 3. Repeated misunderstanding (3+ "I don't understand")
     * 4. Negative sentiment detected
     * 5. Complex issue flagged by AI
     * 6. High-value order (configurable threshold)
     * 7. VIP customer
     */
    private function checkTriggers(
        string $message,
        ConversationSession $session,
        ?array $aiResponse
    ): array;

    /**
     * Initiate handover to human
     */
    public function initiateHandover(
        string $sessionId,
        string $reason
    ): HandoverResult;

    /**
     * Find available agent
     */
    private function findAvailableAgent(string $tenantId): ?Agent;

    /**
     * Close handover and return to AI
     */
    public function closeHandover(
        string $sessionId,
        string $resolution
    ): void;
}
```

### Handover Flow

```
Customer: "I want to speak to a real person"
                     │
                     ▼
         ┌───────────────────────┐
         │ EscalationManager     │
         │ detects trigger       │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ Find available agent  │
         │ from agent pool       │
         └───────────┬───────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    Agent Available      No Agent Available
          │                     │
          ▼                     ▼
   ┌──────────────┐    ┌──────────────────────┐
   │ Mark session │    │ Queue for callback   │
   │ as handover  │    │ "Agent will call you │
   │              │    │  within 10 minutes"  │
   └──────┬───────┘    └──────────────────────┘
          │
          ▼
   ┌──────────────┐
   │ Notify agent │
   │ with context │
   └──────┬───────┘
          │
          ▼
   Agent takes over conversation
          │
          ▼
   Agent resolves → Closes handover
          │
          ▼
   Session returns to AI (or ends)
```

---

## Database Schema

```sql
-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    channel VARCHAR(20) NOT NULL, -- 'whatsapp', 'voice'
    channel_id VARCHAR(100) NOT NULL, -- Phone number or call ID
    
    customer_id UUID REFERENCES customers(id),
    customer_phone VARCHAR(50),
    customer_name VARCHAR(255),
    
    status VARCHAR(20) DEFAULT 'active', -- active, handed_over, ended
    handed_over_to UUID REFERENCES users(id),
    handover_reason TEXT,
    
    current_cart_id UUID REFERENCES carts(id),
    current_order_id UUID REFERENCES orders(id),
    last_intent VARCHAR(100),
    
    context JSONB DEFAULT '{}',
    
    message_count INT DEFAULT 0,
    ai_message_count INT DEFAULT 0,
    human_message_count INT DEFAULT 0,
    
    started_at TIMESTAMP DEFAULT NOW(),
    last_activity_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    handover_started_at TIMESTAMP,
    handover_ended_at TIMESTAMP,
    
    metadata JSONB DEFAULT '{}',
    
    INDEX idx_conversations_tenant (tenant_id),
    INDEX idx_conversations_channel (channel, channel_id),
    INDEX idx_conversations_customer (customer_id),
    INDEX idx_conversations_status (status),
    INDEX idx_conversations_agent (handed_over_to)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    direction VARCHAR(10) NOT NULL, -- 'inbound', 'outbound'
    sender_type VARCHAR(20) NOT NULL, -- 'customer', 'ai', 'agent'
    sender_id VARCHAR(255), -- User ID for agent, null for customer/AI
    
    message_type VARCHAR(20) NOT NULL, -- 'text', 'image', 'audio', 'document', 'interactive'
    content TEXT,
    media_url VARCHAR(500),
    media_type VARCHAR(50),
    
    channel VARCHAR(20) NOT NULL,
    external_id VARCHAR(255), -- Channel's message ID
    
    status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, read, failed
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    
    ai_intent VARCHAR(100),
    ai_confidence DECIMAL(4,3),
    tools_called JSONB, -- [{tool, params, result}]
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_messages_conversation (conversation_id),
    INDEX idx_messages_tenant (tenant_id),
    INDEX idx_messages_created (created_at DESC),
    INDEX idx_messages_external (external_id)
);

-- Message Templates (for WhatsApp)
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    name VARCHAR(100) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    category VARCHAR(50), -- 'transactional', 'marketing'
    
    header_type VARCHAR(20), -- 'text', 'image', 'document'
    header_content TEXT,
    
    body TEXT NOT NULL,
    footer TEXT,
    
    buttons JSONB, -- [{type, text, url}]
    
    whatsapp_template_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, name),
    INDEX idx_templates_tenant (tenant_id)
);

-- Phone Numbers (provisioned for tenants)
CREATE TABLE phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    country_code VARCHAR(5) NOT NULL,
    
    channel VARCHAR(20) NOT NULL, -- 'whatsapp', 'voice', 'both'
    provider VARCHAR(50) NOT NULL, -- 'whatsapp_cloud', 'retell', 'vapi'
    
    provider_id VARCHAR(255), -- External ID from provider
    provider_config JSONB DEFAULT '{}',
    
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, deactivated
    
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_phone_tenant (tenant_id),
    INDEX idx_phone_number (phone_number)
);

-- Agents (human takeover)
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    
    status VARCHAR(20) DEFAULT 'offline', -- online, busy, offline
    max_concurrent_chats INT DEFAULT 5,
    current_chat_count INT DEFAULT 0,
    
    skills JSONB DEFAULT '[]', -- ['sales', 'support', 'billing']
    languages JSONB DEFAULT '["en"]',
    
    last_activity_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_agents_tenant (tenant_id),
    INDEX idx_agents_status (status)
);

-- Handover Queue
CREATE TABLE handover_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    
    priority INT DEFAULT 5, -- 1 = highest
    reason TEXT,
    
    assigned_agent_id UUID REFERENCES agents(id),
    assigned_at TIMESTAMP,
    
    status VARCHAR(20) DEFAULT 'queued', -- queued, assigned, completed, abandoned
    
    wait_time_seconds INT,
    handle_time_seconds INT,
    
    resolution TEXT,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_handover_tenant (tenant_id),
    INDEX idx_handover_status (status),
    INDEX idx_handover_agent (assigned_agent_id)
);
```

---

## WhatsApp Cloud API Integration

### Webhook Setup

```php
// routes/api.php

Route::prefix('webhooks/whatsapp')->group(function () {
    // Verification endpoint (GET)
    Route::get('/', [WhatsAppWebhookController::class, 'verify']);
    
    // Message webhook (POST)
    Route::post('/', [WhatsAppWebhookController::class, 'handle']);
});
```

### Webhook Controller

```php
<?php

namespace App\Http\Controllers\Webhooks;

class WhatsAppWebhookController extends Controller
{
    /**
     * Verify webhook (required by WhatsApp)
     */
    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode === 'subscribe' && $token === config('whatsapp.verify_token')) {
            return response($challenge, 200);
        }

        return response('Forbidden', 403);
    }

    /**
     * Handle incoming webhook
     */
    public function handle(Request $request)
    {
        // Verify signature
        $signature = $request->header('X-Hub-Signature-256');
        if (!$this->verifySignature($request->getContent(), $signature)) {
            return response('Invalid signature', 401);
        }

        $payload = $request->all();

        // Dispatch to queue for processing
        ProcessWhatsAppWebhook::dispatch($payload);

        return response('OK', 200);
    }

    private function verifySignature(string $payload, string $signature): bool
    {
        $expected = 'sha256=' . hash_hmac(
            'sha256',
            $payload,
            config('whatsapp.app_secret')
        );

        return hash_equals($expected, $signature);
    }
}
```

### Message Types

```php
// Supported inbound message types
enum WhatsAppMessageType: string
{
    case TEXT = 'text';
    case IMAGE = 'image';
    case AUDIO = 'audio';
    case VIDEO = 'video';
    case DOCUMENT = 'document';
    case LOCATION = 'location';
    case CONTACTS = 'contacts';
    case INTERACTIVE = 'interactive'; // Button replies
    case BUTTON = 'button'; // Quick reply buttons
}

// Outbound message types
class WhatsAppMessageBuilder
{
    public static function text(string $to, string $body): array
    {
        return [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $to,
            'type' => 'text',
            'text' => ['body' => $body],
        ];
    }

    public static function interactive(
        string $to,
        string $body,
        array $buttons
    ): array {
        return [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $to,
            'type' => 'interactive',
            'interactive' => [
                'type' => 'button',
                'body' => ['text' => $body],
                'action' => [
                    'buttons' => array_map(fn($btn) => [
                        'type' => 'reply',
                        'reply' => [
                            'id' => $btn['id'],
                            'title' => $btn['title'],
                        ],
                    ], $buttons),
                ],
            ],
        ];
    }

    public static function template(
        string $to,
        string $templateName,
        array $components
    ): array {
        return [
            'messaging_product' => 'whatsapp',
            'to' => $to,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => ['code' => 'en'],
                'components' => $components,
            ],
        ];
    }
}
```

---

## Voice AI Integration

### Retell AI Configuration

```php
// config/voice.php

return [
    'provider' => env('VOICE_PROVIDER', 'retell'), // retell, vapi

    'retell' => [
        'api_key' => env('RETELL_API_KEY'),
        'agent_id' => env('RETELL_AGENT_ID'),
        'webhook_url' => env('RETELL_WEBHOOK_URL'),
        'voice_id' => env('RETELL_VOICE_ID', 'eleven_turbo_v2'),
    ],

    'vapi' => [
        'api_key' => env('VAPI_API_KEY'),
        'assistant_id' => env('VAPI_ASSISTANT_ID'),
    ],

    'settings' => [
        'language' => 'en-US',
        'interruption_threshold' => 100, // ms
        'end_call_after_silence' => 30, // seconds
    ],
];
```

### Voice Webhook Handler

```php
<?php

namespace App\Http\Controllers\Webhooks;

class VoiceWebhookController extends Controller
{
    /**
     * Handle call start
     */
    public function handleCallStart(Request $request)
    {
        $callId = $request->input('call_id');
        $fromNumber = $request->input('from_number');
        $toNumber = $request->input('to_number');

        // Identify tenant from to_number
        $tenant = $this->phoneNumberService->getTenantByPhone($toNumber);

        // Create conversation session
        $session = $this->sessionManager->getOrCreateSession(
            $tenant->id,
            $callId,
            'voice'
        );

        // Return initial greeting config
        return response()->json([
            'response_id' => Str::uuid(),
            'content' => $tenant->getSetting('voice_greeting'),
        ]);
    }

    /**
     * Handle transcript update (real-time)
     */
    public function handleTranscript(Request $request)
    {
        $callId = $request->input('call_id');
        $transcript = $request->input('transcript');

        // Process through AI orchestrator
        $response = $this->aiOrchestrator->process(
            callId: $callId,
            message: $transcript,
            channel: 'voice'
        );

        return response()->json([
            'response_id' => Str::uuid(),
            'content' => $response->text,
            'end_call' => $response->shouldEndCall,
        ]);
    }

    /**
     * Handle call end
     */
    public function handleCallEnd(Request $request)
    {
        $callId = $request->input('call_id');
        $duration = $request->input('duration');
        $recordingUrl = $request->input('recording_url');

        // End conversation session
        $this->sessionManager->endSession($callId);

        // Store call recording
        $this->recordingService->store($callId, $recordingUrl);

        return response()->json(['status' => 'ok']);
    }
}
```

---

## Configuration

```php
// config/communication.php

return [
    'whatsapp' => [
        'api_version' => 'v18.0',
        'api_url' => 'https://graph.facebook.com',
        'verify_token' => env('WHATSAPP_VERIFY_TOKEN'),
        'app_secret' => env('WHATSAPP_APP_SECRET'),
        'default_business_id' => env('WHATSAPP_BUSINESS_ID'),
    ],

    'session' => [
        'ttl_seconds' => 3600, // 1 hour
        'context_message_limit' => 10,
        'auto_end_after_inactivity' => 1800, // 30 minutes
    ],

    'queue' => [
        'default_priority' => 'default',
        'retry_attempts' => 3,
        'retry_delay_seconds' => 60,
    ],

    'escalation' => [
        'keyword_triggers' => [
            'speak to human',
            'talk to agent',
            'real person',
            'help',
        ],
        'confidence_threshold' => 0.6,
        'max_misunderstandings' => 3,
        'high_value_order_threshold' => 500, // USD
    ],

    'rate_limits' => [
        'whatsapp_per_minute' => 1000,
        'voice_concurrent' => 50,
    ],
];
```

---

## Next Steps

Continue to: [Integration Engine →](05-INTEGRATION-ENGINE.md)
