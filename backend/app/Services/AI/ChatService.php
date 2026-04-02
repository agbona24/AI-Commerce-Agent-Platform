<?php

namespace App\Services\AI;

use App\Models\Agent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\KnowledgeBase;
use App\Enums\MessageRole;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatService
{
    private string $apiKey;
    private string $baseUrl;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key', '');
        $this->baseUrl = config('services.openai.base_url', 'https://api.openai.com/v1');
        $this->model = config('services.openai.model', 'gpt-4-turbo-preview');
    }

    /**
     * Generate AI response for a conversation
     */
    public function generateResponse(Conversation $conversation, string $userMessage): array
    {
        $agent = $conversation->agent;
        
        if (!$agent) {
            return [
                'success' => false,
                'error' => 'No agent assigned to this conversation',
                'response' => null,
            ];
        }

        // Build conversation history
        $messages = $this->buildMessages($conversation, $agent, $userMessage);

        // Get relevant context from knowledge bases
        $context = $this->getKnowledgeContext($agent, $userMessage);

        // Add context to system message if available
        if ($context) {
            $messages[0]['content'] .= "\n\n### Knowledge Base Context:\n" . $context;
        }

        // Call OpenAI API
        try {
            $response = $this->callOpenAI($messages, $agent);
            
            return [
                'success' => true,
                'response' => $response,
                'tokens_used' => $response['usage'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('AI Chat Error', [
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'response' => $agent->fallback_message ?? "I'm having trouble processing that. Could you try again?",
            ];
        }
    }

    /**
     * Build messages array for OpenAI API
     */
    private function buildMessages(Conversation $conversation, Agent $agent, string $userMessage): array
    {
        $messages = [];

        // System prompt
        $systemPrompt = $this->buildSystemPrompt($agent);
        $messages[] = [
            'role' => 'system',
            'content' => $systemPrompt,
        ];

        // Add conversation history (last N messages)
        $history = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->take(20) // Last 20 messages for context
            ->get()
            ->reverse();

        foreach ($history as $message) {
            $role = match ($message->role->value ?? $message->role) {
                'user', MessageRole::USER->value => 'user',
                'assistant', MessageRole::ASSISTANT->value => 'assistant',
                default => 'user',
            };

            $messages[] = [
                'role' => $role,
                'content' => $message->content,
            ];
        }

        // Add current user message
        $messages[] = [
            'role' => 'user',
            'content' => $userMessage,
        ];

        return $messages;
    }

    /**
     * Build system prompt for the agent
     */
    private function buildSystemPrompt(Agent $agent): string
    {
        $basePrompt = $agent->system_prompt ?? $this->getDefaultSystemPrompt();
        
        $tenant = $agent->tenant;
        $businessInfo = '';
        
        if ($tenant) {
            $businessInfo = "\n\nBusiness Information:\n";
            $businessInfo .= "- Company: {$tenant->name}\n";
            if ($tenant->description) {
                $businessInfo .= "- Description: {$tenant->description}\n";
            }
            if ($tenant->industry) {
                $businessInfo .= "- Industry: {$tenant->industry}\n";
            }
            if ($tenant->website) {
                $businessInfo .= "- Website: {$tenant->website}\n";
            }
        }

        $agentInfo = "\n\nYour Role:\n";
        $agentInfo .= "- Agent Name: {$agent->name}\n";
        if ($agent->description) {
            $agentInfo .= "- Purpose: {$agent->description}\n";
        }
        $agentInfo .= "- Language: " . ($agent->language ?? 'English') . "\n";

        return $basePrompt . $businessInfo . $agentInfo;
    }

    /**
     * Get default system prompt
     */
    private function getDefaultSystemPrompt(): string
    {
        return <<<PROMPT
You are a helpful AI assistant for a business. Your role is to:
1. Answer customer questions accurately and helpfully
2. Provide information about products and services
3. Help customers with their inquiries
4. Be professional, friendly, and courteous
5. Escalate to a human agent when you cannot help

Guidelines:
- Keep responses concise but complete
- If you don't know something, say so honestly
- Ask clarifying questions when needed
- Don't make up information
- Be respectful of customer time
PROMPT;
    }

    /**
     * Get relevant context from knowledge bases
     */
    private function getKnowledgeContext(Agent $agent, string $query): ?string
    {
        $knowledgeBases = $agent->knowledgeBases()->where('status', 'active')->get();
        
        if ($knowledgeBases->isEmpty()) {
            return null;
        }

        $contexts = [];
        
        foreach ($knowledgeBases as $kb) {
            // Simple keyword matching for now
            // TODO: Implement vector search for better semantic matching
            $content = $kb->content ?? '';
            
            if (empty($content)) {
                continue;
            }

            // Extract relevant snippets based on query keywords
            $snippet = $this->extractRelevantSnippet($content, $query);
            if ($snippet) {
                $contexts[] = "From {$kb->name}:\n{$snippet}";
            }
        }

        return empty($contexts) ? null : implode("\n\n", array_slice($contexts, 0, 3));
    }

    /**
     * Extract relevant snippet from content based on query
     */
    private function extractRelevantSnippet(string $content, string $query, int $maxLength = 500): ?string
    {
        $queryWords = array_filter(
            explode(' ', strtolower($query)),
            fn($w) => strlen($w) > 3
        );

        if (empty($queryWords)) {
            return substr($content, 0, $maxLength);
        }

        $sentences = preg_split('/(?<=[.!?])\s+/', $content);
        $scoredSentences = [];

        foreach ($sentences as $sentence) {
            $score = 0;
            $lowerSentence = strtolower($sentence);
            
            foreach ($queryWords as $word) {
                if (str_contains($lowerSentence, $word)) {
                    $score++;
                }
            }
            
            if ($score > 0) {
                $scoredSentences[] = ['sentence' => $sentence, 'score' => $score];
            }
        }

        if (empty($scoredSentences)) {
            return null;
        }

        // Sort by score and take top sentences
        usort($scoredSentences, fn($a, $b) => $b['score'] <=> $a['score']);
        
        $result = '';
        foreach (array_slice($scoredSentences, 0, 3) as $item) {
            if (strlen($result) + strlen($item['sentence']) > $maxLength) {
                break;
            }
            $result .= $item['sentence'] . ' ';
        }

        return trim($result) ?: null;
    }

    /**
     * Call OpenAI API
     */
    private function callOpenAI(array $messages, Agent $agent): array
    {
        if (empty($this->apiKey)) {
            // Return mock response for development
            return $this->getMockResponse($messages);
        }

        $settings = $agent->settings ?? [];
        
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->apiKey}",
            'Content-Type' => 'application/json',
        ])->timeout(30)->post("{$this->baseUrl}/chat/completions", [
            'model' => $settings['model'] ?? $this->model,
            'messages' => $messages,
            'max_tokens' => $settings['max_tokens'] ?? 1024,
            'temperature' => $settings['temperature'] ?? 0.7,
        ]);

        if (!$response->successful()) {
            throw new \Exception('OpenAI API error: ' . $response->body());
        }

        $data = $response->json();
        
        return [
            'content' => $data['choices'][0]['message']['content'] ?? '',
            'usage' => $data['usage'] ?? null,
            'model' => $data['model'] ?? null,
        ];
    }

    /**
     * Get mock response for development/testing
     */
    private function getMockResponse(array $messages): array
    {
        $userMessage = $messages[count($messages) - 1]['content'] ?? '';
        
        // Simple mock responses based on keywords
        $response = match (true) {
            str_contains(strtolower($userMessage), 'hello') || str_contains(strtolower($userMessage), 'hi') 
                => "Hello! How can I assist you today?",
            str_contains(strtolower($userMessage), 'price') || str_contains(strtolower($userMessage), 'cost')
                => "I'd be happy to help with pricing information. Could you tell me which product or service you're interested in?",
            str_contains(strtolower($userMessage), 'help')
                => "Of course! I'm here to help. What do you need assistance with?",
            str_contains(strtolower($userMessage), 'thank')
                => "You're welcome! Is there anything else I can help you with?",
            str_contains(strtolower($userMessage), 'bye') || str_contains(strtolower($userMessage), 'goodbye')
                => "Goodbye! Have a great day. Feel free to reach out anytime you need assistance.",
            default => "Thank you for your message. I understand you're asking about: " . 
                       substr($userMessage, 0, 100) . (strlen($userMessage) > 100 ? '...' : '') . 
                       ". Let me help you with that.",
        };

        return [
            'content' => $response,
            'usage' => ['total_tokens' => 100, 'prompt_tokens' => 50, 'completion_tokens' => 50],
            'model' => 'mock-model',
        ];
    }

    /**
     * Save assistant message to conversation
     */
    public function saveAssistantMessage(Conversation $conversation, string $content, ?array $metadata = null): Message
    {
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'role' => MessageRole::ASSISTANT,
            'content' => $content,
            'content_type' => 'text',
            'metadata' => $metadata,
        ]);

        $conversation->update([
            'last_message_at' => now(),
            'message_count' => $conversation->message_count + 1,
        ]);

        return $message;
    }

    /**
     * Save user message to conversation
     */
    public function saveUserMessage(Conversation $conversation, string $content, ?array $metadata = null): Message
    {
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'role' => MessageRole::USER,
            'content' => $content,
            'content_type' => 'text',
            'metadata' => $metadata,
        ]);

        $conversation->update([
            'last_message_at' => now(),
            'message_count' => $conversation->message_count + 1,
        ]);

        return $message;
    }
}
