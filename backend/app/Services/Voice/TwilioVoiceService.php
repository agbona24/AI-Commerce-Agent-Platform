<?php

namespace App\Services\Voice;

use App\Models\Agent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Integration;
use App\Models\Tenant;
use App\Models\KnowledgeBase;
use App\Models\Product;
use App\Enums\ChannelType;
use App\Enums\ConversationStatus;
use App\Enums\MessageRole;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TwilioVoiceService
{
    protected const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';
    
    /**
     * Get Twilio credentials for a tenant
     */
    protected function getTwilioCredentials(Tenant $tenant): ?array
    {
        $integration = $tenant->integrations()
            ->where('type', 'voice')
            ->where('provider', 'twilio')
            ->where('status', 'connected')
            ->first();
            
        if (!$integration) {
            return null;
        }
        
        $credentials = $integration->credentials;
        
        if (empty($credentials['account_sid']) || empty($credentials['auth_token'])) {
            return null;
        }
        
        return [
            'account_sid' => $credentials['account_sid'],
            'auth_token' => $credentials['auth_token'],
            'phone_number' => $credentials['phone_number'] ?? null,
        ];
    }
    
    /**
     * Make authenticated request to Twilio API
     */
    protected function twilioRequest(string $accountSid, string $authToken, string $method, string $endpoint, array $data = []): array
    {
        $url = self::TWILIO_API_BASE . "/Accounts/{$accountSid}" . $endpoint;
        
        $response = Http::withBasicAuth($accountSid, $authToken)
            ->asForm()
            ->$method($url, $data);
            
        if ($response->failed()) {
            $error = $response->json('message') ?? $response->body();
            throw new \Exception("Twilio API error: {$error}");
        }
        
        return $response->json() ?? [];
    }
    
    /**
     * Get OpenAI API key for tenant
     */
    protected function getOpenAIKey(Tenant $tenant): ?string
    {
        // Check tenant-specific OpenAI integration
        $integration = $tenant->integrations()
            ->where('type', 'openai')
            ->where('status', 'connected')
            ->first();
            
        if ($integration && !empty($integration->credentials['api_key'])) {
            return $integration->credentials['api_key'];
        }
        
        // Fall back to system default
        return config('services.openai.api_key');
    }
    
    /**
     * Get OpenAI model for tenant
     */
    protected function getOpenAIModel(Tenant $tenant): string
    {
        $integration = $tenant->integrations()
            ->where('type', 'openai')
            ->where('status', 'connected')
            ->first();
            
        if ($integration && !empty($integration->credentials['model'])) {
            return $integration->credentials['model'];
        }
        
        return config('services.openai.model', 'gpt-4o');
    }
    
    /**
     * Get tenant by Twilio phone number
     */
    public function getTenantByPhoneNumber(string $phoneNumber): ?Tenant
    {
        // Clean phone number
        $phoneNumber = preg_replace('/[^0-9+]/', '', $phoneNumber);
        
        $integration = Integration::where('type', 'voice')
            ->where('provider', 'twilio')
            ->where('status', 'connected')
            ->whereRaw("JSON_EXTRACT(credentials, '$.phone_number') LIKE ?", ["%{$phoneNumber}%"])
            ->first();
            
        return $integration?->tenant;
    }
    
    /**
     * Handle incoming Twilio call
     * Returns TwiML response
     */
    public function handleIncomingCall(array $request): string
    {
        $calledNumber = $request['Called'] ?? $request['To'] ?? null;
        $callerNumber = $request['Caller'] ?? $request['From'] ?? null;
        $callSid = $request['CallSid'] ?? null;
        
        Log::info('Incoming call', [
            'called' => $calledNumber,
            'caller' => $callerNumber,
            'call_sid' => $callSid,
        ]);
        
        // Find tenant by phone number
        $tenant = $this->getTenantByPhoneNumber($calledNumber);
        
        if (!$tenant) {
            return $this->generateErrorResponse('This number is not configured. Please contact support.');
        }
        
        // Find active voice agent for tenant
        $agent = Agent::where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->where(function($q) {
                $q->whereJsonContains('channels', 'voice')
                  ->orWhere('type', 'voice');
            })
            ->first();
            
        if (!$agent) {
            return $this->generateErrorResponse('No agent is available to take your call. Please try again later.');
        }
        
        // Create conversation
        $conversation = Conversation::create([
            'tenant_id' => $tenant->id,
            'agent_id' => $agent->id,
            'channel' => ChannelType::VOICE,
            'status' => ConversationStatus::ACTIVE,
            'customer_phone' => $callerNumber,
            'external_id' => $callSid,
            'started_at' => now(),
            'metadata' => [
                'call_sid' => $callSid,
                'call_direction' => 'inbound',
                'twilio_data' => $request,
            ],
        ]);
        
        // Generate welcome response
        return $this->generateWelcomeResponse($agent, $conversation);
    }
    
    /**
     * Generate welcome TwiML response
     */
    protected function generateWelcomeResponse(Agent $agent, Conversation $conversation): string
    {
        // Get welcome message
        $welcomeMessage = $agent->welcome_message 
            ?? "Hello! Thank you for calling. How can I help you today?";
        
        // Use Twilio's built-in voice
        $voiceSettings = $agent->voice_settings ?? [];
        $voice = $voiceSettings['twilio_voice'] ?? 'Polly.Joanna';
        $language = $voiceSettings['language'] ?? 'en-US';
        $speechLanguage = $voiceSettings['speech_language'] ?? 'en-US';
        $gatherUrl = url("/api/v1/webhooks/voice/gather/{$conversation->id}");
        
        // Save welcome message to conversation
        Message::create([
            'conversation_id' => $conversation->id,
            'role' => MessageRole::ASSISTANT,
            'content' => $welcomeMessage,
            'content_type' => 'text',
        ]);
        
        return $this->twiml([
            $this->say($welcomeMessage, $voice, $language),
            $this->gather([
                'input' => 'speech',
                'action' => $gatherUrl,
                'method' => 'POST',
                'speechTimeout' => 'auto',
                'language' => $speechLanguage,
                'speechModel' => 'phone_call',
                'enhanced' => 'true',
            ], $this->say("I'm listening.", $voice, $language)),
            $this->say("I didn't catch that. Let me try again.", $voice, $language),
            '<Redirect method="POST">' . $this->escape($gatherUrl) . '</Redirect>',
        ]);
    }
    
    /**
     * Handle speech gather result
     */
    public function handleGather(int $conversationId, array $request): string
    {
        $speechResult = $request['SpeechResult'] ?? null;
        $confidence = $request['Confidence'] ?? 0;
        $callSid = $request['CallSid'] ?? null;
        
        Log::info('Speech gathered', [
            'conversation_id' => $conversationId,
            'speech' => $speechResult,
            'confidence' => $confidence,
        ]);
        
        $conversation = Conversation::with(['agent', 'tenant', 'messages'])->find($conversationId);
        
        if (!$conversation) {
            return $this->generateErrorResponse('Session not found. Please call back.');
        }
        
        if (empty($speechResult)) {
            return $this->generateRepromptResponse($conversation);
        }
        
        // Save user message
        Message::create([
            'conversation_id' => $conversation->id,
            'role' => MessageRole::USER,
            'content' => $speechResult,
            'content_type' => 'text',
            'metadata' => [
                'confidence' => $confidence,
                'speech_result' => true,
            ],
        ]);
        
        // Generate AI response
        $aiResponse = $this->generateAIResponse($conversation, $speechResult);
        
        // Save assistant message
        Message::create([
            'conversation_id' => $conversation->id,
            'role' => MessageRole::ASSISTANT,
            'content' => $aiResponse['text'],
            'content_type' => 'text',
            'tokens_used' => $aiResponse['tokens'] ?? null,
        ]);
        
        // Update conversation
        $conversation->update(['last_message_at' => now()]);
        
        // Check if conversation should end
        if ($aiResponse['should_end'] ?? false) {
            return $this->generateGoodbyeResponse($conversation, $aiResponse['text']);
        }
        
        // Continue conversation
        return $this->generateContinueResponse($conversation, $aiResponse['text']);
    }
    
    /**
     * Generate AI response using OpenAI
     */
    protected function generateAIResponse(Conversation $conversation, string $userInput): array
    {
        $agent = $conversation->agent;
        $tenant = $conversation->tenant;
        $openAIKey = $this->getOpenAIKey($tenant);
        $openAIModel = $this->getOpenAIModel($tenant);
        
        if (!$openAIKey) {
            return [
                'text' => "I apologize, but I'm having some technical difficulties. Please hold or call back later.",
                'tokens' => 0,
                'should_end' => false,
            ];
        }
        
        // Build conversation history
        $messages = $this->buildMessages($conversation, $userInput);
        
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$openAIKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => $openAIModel,
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 300, // Keep responses concise for voice
            ]);
            
            if (!$response->successful()) {
                Log::error('OpenAI API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                
                return [
                    'text' => "I apologize, I'm having trouble processing that. Could you please repeat?",
                    'tokens' => 0,
                    'should_end' => false,
                ];
            }
            
            $data = $response->json();
            $assistantMessage = $data['choices'][0]['message']['content'] ?? '';
            $tokensUsed = $data['usage']['total_tokens'] ?? 0;
            
            // Check for conversation-ending phrases
            $shouldEnd = $this->shouldEndConversation($userInput, $assistantMessage);
            
            return [
                'text' => $assistantMessage,
                'tokens' => $tokensUsed,
                'should_end' => $shouldEnd,
            ];
            
        } catch (\Exception $e) {
            Log::error('OpenAI API exception', ['error' => $e->getMessage()]);
            
            return [
                'text' => "I'm sorry, I'm experiencing some issues. Can you please repeat that?",
                'tokens' => 0,
                'should_end' => false,
            ];
        }
    }
    
    /**
     * Build messages array for OpenAI
     */
    protected function buildMessages(Conversation $conversation, string $currentInput): array
    {
        $agent = $conversation->agent;
        $tenant = $conversation->tenant;
        
        // Build system prompt
        $systemPrompt = $this->buildSystemPrompt($agent, $tenant);
        
        // Get knowledge context
        $knowledgeContext = $this->getKnowledgeContext($agent, $currentInput);
        if ($knowledgeContext) {
            $systemPrompt .= "\n\n## Relevant Information:\n" . $knowledgeContext;
        }
        
        // Get product context if asking about products
        $productContext = $this->getProductContext($tenant, $currentInput);
        if ($productContext) {
            $systemPrompt .= "\n\n## Product Information:\n" . $productContext;
        }
        
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];
        
        // Add conversation history (last 10 messages)
        $previousMessages = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->reverse();
            
        foreach ($previousMessages as $msg) {
            $role = $msg->role === MessageRole::USER ? 'user' : 'assistant';
            $messages[] = ['role' => $role, 'content' => $msg->content];
        }
        
        // Add current user input
        $messages[] = ['role' => 'user', 'content' => $currentInput];
        
        return $messages;
    }
    
    /**
     * Build system prompt for voice agent
     */
    protected function buildSystemPrompt(Agent $agent, Tenant $tenant): string
    {
        $businessName = $tenant->business_name ?? $tenant->name;
        $agentName = $agent->name;
        
        $prompt = $agent->system_prompt ?? "You are {$agentName}, a helpful voice assistant for {$businessName}.";
        
        // Add voice-specific instructions
        $prompt .= "\n\n## Voice Call Instructions:
- Keep responses concise and natural for speaking (under 100 words ideal)
- Use conversational language appropriate for phone calls
- Avoid bullet points or formatting - speak naturally
- If you don't understand, politely ask for clarification
- Be warm, helpful, and professional
- If the caller wants to end the call, thank them and say goodbye
- If something is outside your capability, offer to connect them with a human representative";
        
        // Add business context
        $prompt .= "\n\n## Business Information:
- Business Name: {$businessName}
- Industry: " . ($tenant->industry ?? 'General') . "
- Phone: " . ($tenant->phone ?? 'N/A') . "
- Website: " . ($tenant->website ?? 'N/A');
        
        // Add agent settings
        $settings = $agent->settings ?? [];
        if (!empty($settings['tone'])) {
            $prompt .= "\n\n## Communication Style:
Maintain a {$settings['tone']} tone throughout the conversation.";
        }
        
        return $prompt;
    }
    
    /**
     * Get relevant knowledge base context
     */
    protected function getKnowledgeContext(Agent $agent, string $query): ?string
    {
        $knowledgeBases = $agent->knowledgeBases()
            ->where('status', 'processed')
            ->get();
            
        if ($knowledgeBases->isEmpty()) {
            return null;
        }
        
        // Simple keyword matching for now (could be enhanced with vector search)
        $queryWords = array_filter(explode(' ', strtolower($query)), fn($w) => strlen($w) > 3);
        $relevantContent = [];
        
        foreach ($knowledgeBases as $kb) {
            $content = $kb->content ?? '';
            $contentLower = strtolower($content);
            
            foreach ($queryWords as $word) {
                if (str_contains($contentLower, $word)) {
                    // Extract relevant paragraph
                    $position = strpos($contentLower, $word);
                    $start = max(0, $position - 200);
                    $excerpt = substr($content, $start, 500);
                    $relevantContent[] = trim($excerpt);
                    break;
                }
            }
        }
        
        if (empty($relevantContent)) {
            return null;
        }
        
        return implode("\n\n", array_slice($relevantContent, 0, 3));
    }
    
    /**
     * Get product context if query mentions products
     */
    protected function getProductContext(Tenant $tenant, string $query): ?string
    {
        $queryLower = strtolower($query);
        
        // Check if query is about products
        $productKeywords = ['product', 'price', 'cost', 'buy', 'purchase', 'order', 'stock', 'available', 'item'];
        $isProductQuery = false;
        
        foreach ($productKeywords as $keyword) {
            if (str_contains($queryLower, $keyword)) {
                $isProductQuery = true;
                break;
            }
        }
        
        if (!$isProductQuery) {
            return null;
        }
        
        // Search for relevant products
        $products = Product::where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->where(function($q) use ($queryLower) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$queryLower}%"])
                  ->orWhereRaw('LOWER(description) LIKE ?', ["%{$queryLower}%"]);
            })
            ->take(5)
            ->get();
            
        if ($products->isEmpty()) {
            // Get featured products instead
            $products = Product::where('tenant_id', $tenant->id)
                ->where('status', 'active')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();
        }
        
        if ($products->isEmpty()) {
            return null;
        }
        
        $productInfo = [];
        foreach ($products as $product) {
            $info = "- {$product->name}: " . ($product->currency ?? '$') . number_format($product->price, 2);
            if ($product->stock !== null) {
                $info .= " (" . ($product->stock > 0 ? 'In stock' : 'Out of stock') . ")";
            }
            $productInfo[] = $info;
        }
        
        return "Available products:\n" . implode("\n", $productInfo);
    }
    
    /**
     * Check if conversation should end
     */
    protected function shouldEndConversation(string $userInput, string $response): bool
    {
        $endPhrases = ['goodbye', 'bye', 'thank you bye', 'that\'s all', 'nothing else', 'i\'m done', 'hang up'];
        $userInputLower = strtolower($userInput);
        
        foreach ($endPhrases as $phrase) {
            if (str_contains($userInputLower, $phrase)) {
                return true;
            }
        }
        
        // Check if AI response indicates ending
        $responseLower = strtolower($response);
        if (str_contains($responseLower, 'goodbye') || str_contains($responseLower, 'thank you for calling')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Generate continue conversation TwiML
     */
    protected function generateContinueResponse(Conversation $conversation, string $message): string
    {
        $agent = $conversation->agent;
        $voiceSettings = $agent->voice_settings ?? [];
        $voice = $voiceSettings['twilio_voice'] ?? 'Polly.Joanna';
        $language = $voiceSettings['language'] ?? 'en-US';
        $speechLanguage = $voiceSettings['speech_language'] ?? 'en-US';
        $gatherUrl = url("/api/v1/webhooks/voice/gather/{$conversation->id}");
        
        return $this->twiml([
            $this->say($message, $voice, $language),
            $this->gather([
                'input' => 'speech',
                'action' => $gatherUrl,
                'method' => 'POST',
                'speechTimeout' => 'auto',
                'language' => $speechLanguage,
                'speechModel' => 'phone_call',
                'enhanced' => 'true',
            ]),
            $this->say("Is there anything else I can help you with?", $voice, $language),
            '<Redirect method="POST">' . $this->escape($gatherUrl) . '</Redirect>',
        ]);
    }
    
    /**
     * Generate goodbye TwiML
     */
    protected function generateGoodbyeResponse(Conversation $conversation, string $message): string
    {
        $agent = $conversation->agent;
        $voiceSettings = $agent->voice_settings ?? [];
        $voice = $voiceSettings['twilio_voice'] ?? 'Polly.Joanna';
        $language = $voiceSettings['language'] ?? 'en-US';
        
        // End conversation
        $conversation->update([
            'status' => ConversationStatus::RESOLVED,
            'ended_at' => now(),
        ]);
        
        return $this->twiml([
            $this->say($message, $voice, $language),
            '<Hangup/>',
        ]);
    }
    
    /**
     * Generate reprompt TwiML
     */
    protected function generateRepromptResponse(Conversation $conversation): string
    {
        $agent = $conversation->agent;
        $voiceSettings = $agent->voice_settings ?? [];
        $voice = $voiceSettings['twilio_voice'] ?? 'Polly.Joanna';
        $language = $voiceSettings['language'] ?? 'en-US';
        $speechLanguage = $voiceSettings['speech_language'] ?? 'en-US';
        $gatherUrl = url("/api/v1/webhooks/voice/gather/{$conversation->id}");
        
        return $this->twiml([
            $this->say("I'm sorry, I didn't catch that. Could you please repeat?", $voice, $language),
            $this->gather([
                'input' => 'speech',
                'action' => $gatherUrl,
                'method' => 'POST',
                'speechTimeout' => 'auto',
                'language' => $speechLanguage,
                'speechModel' => 'phone_call',
                'enhanced' => 'true',
            ]),
        ]);
    }
    
    /**
     * Generate error TwiML
     */
    protected function generateErrorResponse(string $message): string
    {
        return $this->twiml([
            $this->say($message, 'Polly.Joanna', 'en-US'),
            '<Hangup/>',
        ]);
    }
    
    /**
     * Make outbound call
     */
    public function makeOutboundCall(Tenant $tenant, string $to, Agent $agent): array
    {
        $credentials = $this->getTwilioCredentials($tenant);
        
        if (!$credentials) {
            throw new \Exception('Twilio integration not configured');
        }
        
        $fromNumber = $credentials['phone_number'] ?? null;
        
        if (!$fromNumber) {
            throw new \Exception('No phone number configured');
        }
        
        // Create conversation first
        $conversation = Conversation::create([
            'tenant_id' => $tenant->id,
            'agent_id' => $agent->id,
            'channel' => ChannelType::VOICE,
            'status' => ConversationStatus::ACTIVE,
            'customer_phone' => $to,
            'started_at' => now(),
            'metadata' => [
                'call_direction' => 'outbound',
            ],
        ]);
        
        try {
            $response = $this->twilioRequest(
                $credentials['account_sid'],
                $credentials['auth_token'],
                'post',
                '/Calls.json',
                [
                    'To' => $to,
                    'From' => $fromNumber,
                    'Url' => url("/api/v1/webhooks/voice/outbound/{$conversation->id}"),
                    'Method' => 'POST',
                    'StatusCallback' => url('/api/v1/webhooks/voice/status'),
                    'StatusCallbackMethod' => 'POST',
                    'StatusCallbackEvent' => ['initiated', 'ringing', 'answered', 'completed'],
                ]
            );
            
            $callSid = $response['sid'] ?? null;
            
            $conversation->update([
                'external_id' => $callSid,
                'metadata' => array_merge($conversation->metadata ?? [], [
                    'call_sid' => $callSid,
                ]),
            ]);
            
            return [
                'success' => true,
                'call_sid' => $callSid,
                'conversation_id' => $conversation->id,
                'status' => $response['status'] ?? 'queued',
            ];
            
        } catch (\Exception $e) {
            $conversation->update(['status' => ConversationStatus::CLOSED]);
            
            throw new \Exception("Failed to initiate call: " . $e->getMessage());
        }
    }
    
    /**
     * Handle call status callback
     */
    public function handleStatusCallback(array $request): void
    {
        $callSid = $request['CallSid'] ?? null;
        $callStatus = $request['CallStatus'] ?? null;
        $duration = $request['CallDuration'] ?? null;
        
        Log::info('Call status update', [
            'call_sid' => $callSid,
            'status' => $callStatus,
            'duration' => $duration,
        ]);
        
        $conversation = Conversation::where('external_id', $callSid)->first();
        
        if (!$conversation) {
            return;
        }
        
        $metadata = $conversation->metadata ?? [];
        $metadata['call_status'] = $callStatus;
        
        if ($duration) {
            $metadata['call_duration'] = $duration;
        }
        
        $updates = ['metadata' => $metadata];
        
        if (in_array($callStatus, ['completed', 'busy', 'no-answer', 'canceled', 'failed'])) {
            $updates['status'] = ConversationStatus::RESOLVED;
            $updates['ended_at'] = now();
        }
        
        $conversation->update($updates);
    }
    
    /**
     * Test Twilio connection
     */
    public function testConnection(array $credentials): array
    {
        try {
            $accountSid = $credentials['account_sid'];
            $authToken = $credentials['auth_token'];
            
            // Fetch account info via REST API
            $response = Http::withBasicAuth($accountSid, $authToken)
                ->get(self::TWILIO_API_BASE . "/Accounts/{$accountSid}.json");
            
            if ($response->failed()) {
                return [
                    'success' => false,
                    'error' => 'Invalid credentials or account not found',
                ];
            }
            
            $account = $response->json();
            
            // Verify phone number if provided
            if (!empty($credentials['phone_number'])) {
                $numberResponse = Http::withBasicAuth($accountSid, $authToken)
                    ->get(self::TWILIO_API_BASE . "/Accounts/{$accountSid}/IncomingPhoneNumbers.json", [
                        'PhoneNumber' => $credentials['phone_number'],
                    ]);
                
                $numbers = $numberResponse->json('incoming_phone_numbers') ?? [];
                
                if (empty($numbers)) {
                    return [
                        'success' => false,
                        'error' => 'Phone number not found in your Twilio account',
                    ];
                }
            }
            
            return [
                'success' => true,
                'account_name' => $account['friendly_name'] ?? 'Unknown',
                'account_status' => $account['status'] ?? 'active',
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Configure webhook URLs in Twilio
     */
    public function configureWebhooks(Tenant $tenant): array
    {
        $credentials = $this->getTwilioCredentials($tenant);
        
        if (!$credentials) {
            throw new \Exception('Twilio integration not configured');
        }
        
        $phoneNumber = $credentials['phone_number'] ?? null;
        
        if (!$phoneNumber) {
            throw new \Exception('No phone number configured');
        }
        
        $accountSid = $credentials['account_sid'];
        $authToken = $credentials['auth_token'];
        
        try {
            // Find the phone number in Twilio
            $response = Http::withBasicAuth($accountSid, $authToken)
                ->get(self::TWILIO_API_BASE . "/Accounts/{$accountSid}/IncomingPhoneNumbers.json", [
                    'PhoneNumber' => $phoneNumber,
                ]);
            
            $numbers = $response->json('incoming_phone_numbers') ?? [];
            
            if (empty($numbers)) {
                throw new \Exception('Phone number not found');
            }
            
            $numberSid = $numbers[0]['sid'];
            
            // Update webhook URLs
            $updateResponse = Http::withBasicAuth($accountSid, $authToken)
                ->asForm()
                ->post(self::TWILIO_API_BASE . "/Accounts/{$accountSid}/IncomingPhoneNumbers/{$numberSid}.json", [
                    'VoiceUrl' => url('/api/v1/webhooks/voice/incoming'),
                    'VoiceMethod' => 'POST',
                    'StatusCallback' => url('/api/v1/webhooks/voice/status'),
                    'StatusCallbackMethod' => 'POST',
                ]);
            
            if ($updateResponse->failed()) {
                throw new \Exception('Failed to update phone number webhooks');
            }
            
            $updated = $updateResponse->json();
            
            return [
                'success' => true,
                'voice_url' => $updated['voice_url'] ?? url('/api/v1/webhooks/voice/incoming'),
                'phone_number' => $updated['phone_number'] ?? $phoneNumber,
            ];
            
        } catch (\Exception $e) {
            throw new \Exception("Failed to configure webhooks: " . $e->getMessage());
        }
    }
    
    // ============================================================
    // TwiML Helper Methods (Raw XML Generation)
    // ============================================================
    
    /**
     * Generate TwiML XML response
     */
    protected function twiml(array $elements): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<Response>' . "\n";
        $xml .= implode("\n", $elements);
        $xml .= "\n" . '</Response>';
        
        return $xml;
    }
    
    /**
     * Generate Say TwiML element
     */
    protected function say(string $text, string $voice = 'Polly.Joanna', string $language = 'en-US'): string
    {
        return '<Say voice="' . $this->escape($voice) . '" language="' . $this->escape($language) . '">' 
            . $this->escape($text) 
            . '</Say>';
    }
    
    /**
     * Generate Gather TwiML element
     */
    protected function gather(array $attributes, ?string $nested = null): string
    {
        $attrs = [];
        foreach ($attributes as $key => $value) {
            $attrs[] = $key . '="' . $this->escape($value) . '"';
        }
        
        $xml = '<Gather ' . implode(' ', $attrs) . '>';
        if ($nested) {
            $xml .= $nested;
        }
        $xml .= '</Gather>';
        
        return $xml;
    }
    
    /**
     * Escape XML special characters
     */
    protected function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
