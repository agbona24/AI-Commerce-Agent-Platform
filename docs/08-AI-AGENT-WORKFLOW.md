# AI Agent Workflow & Orchestration

## Overview

The AI Agent is the central intelligence coordinating all customer interactions. It understands intent, maintains conversation context, executes tools (function calls), and generates human-like responses.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI ORCHESTRATION LAYER                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────────┐   │
│  │   Message   │───▶│    Intent    │───▶│    Context Assembler    │   │
│  │   Ingress   │    │  Classifier  │    │  (Conversation + RAG)   │   │
│  └─────────────┘    └──────────────┘    └───────────┬─────────────┘   │
│                                                      │                  │
│                                                      ▼                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     LLM REQUEST BUILDER                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │   │
│  │  │   System    │  │    Tools    │  │      Messages           │ │   │
│  │  │   Prompt    │  │ (Functions) │  │  (Conversation History) │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │   │
│  └─────────────────────────────────┬───────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         LLM PROVIDER                            │   │
│  │              (OpenAI GPT-4o / Claude / Gemini)                  │   │
│  └─────────────────────────────────┬───────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     RESPONSE PROCESSOR                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │   │
│  │  │    Text     │  │    Tool     │  │      Streaming          │ │   │
│  │  │   Output    │  │    Calls    │  │      Handler            │ │   │
│  │  └─────────────┘  └──────┬──────┘  └─────────────────────────┘ │   │
│  └──────────────────────────┼──────────────────────────────────────┘   │
│                             │                                           │
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      TOOL EXECUTOR                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │ Knowledge│ │Transaction│ │   CRM    │ │   Integration   │   │   │
│  │  │  Engine  │ │  Engine  │ │  Actions │ │     Engine      │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │   │
│  └─────────────────────────────┬───────────────────────────────────┘   │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    CONVERSATION UPDATER                         │   │
│  │         (Append tool results, loop back to LLM if needed)       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Conversation State Machine

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CONVERSATION STATE MACHINE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│    ┌──────────┐    Message    ┌────────────┐                        │
│    │   IDLE   │──────────────▶│   ACTIVE   │                        │
│    └──────────┘               └─────┬──────┘                        │
│         ▲                          │                                │
│         │                          ▼                                │
│    ┌────┴─────┐              ┌────────────┐    Tool Call            │
│    │  CLOSED  │◀─────────────│ PROCESSING │───────────────┐        │
│    └──────────┘   Timeout    └─────┬──────┘               │        │
│                   Complete         │                       │        │
│                                    │ Human Request         │        │
│                                    ▼                       │        │
│                             ┌────────────┐                │        │
│                             │  HANDOVER  │                │        │
│                             │  (Human)   │                │        │
│                             └─────┬──────┘                │        │
│                                   │                       │        │
│                                   │ Resolved              │        │
│                                   ▼                       ▼        │
│                             ┌─────────────────────────────────┐    │
│                             │         TOOL EXECUTION          │    │
│                             │   (May trigger multiple loops)  │    │
│                             └─────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. AI Orchestrator Service

```php
<?php

namespace App\Services\AI;

use App\Models\Conversation;
use App\Models\Message;
use App\Services\Knowledge\KnowledgeRouter;
use App\Services\AI\Tools\ToolRegistry;
use App\Services\AI\Providers\LLMProviderInterface;
use App\DTOs\AIResponse;
use App\DTOs\ToolCall;
use Illuminate\Support\Facades\Log;

class AIOrchestrator
{
    private const MAX_TOOL_ITERATIONS = 10;
    
    public function __construct(
        private LLMProviderInterface $llmProvider,
        private ToolRegistry $toolRegistry,
        private KnowledgeRouter $knowledgeRouter,
        private ConversationContextBuilder $contextBuilder,
        private SystemPromptBuilder $promptBuilder,
    ) {}
    
    /**
     * Process incoming message and generate AI response
     */
    public function processMessage(
        Conversation $conversation,
        string $userMessage,
        array $metadata = []
    ): AIResponse {
        // Step 1: Save user message
        $message = $this->saveMessage($conversation, $userMessage, 'user');
        
        // Step 2: Build context (conversation history + RAG)
        $context = $this->contextBuilder->build($conversation, $userMessage);
        
        // Step 3: Build system prompt with tenant configuration
        $systemPrompt = $this->promptBuilder->build(
            $conversation->tenant,
            $conversation->channel
        );
        
        // Step 4: Get available tools for this tenant
        $tools = $this->toolRegistry->getToolsForTenant($conversation->tenant);
        
        // Step 5: Execute LLM loop (may have tool calls)
        $response = $this->executeLLMLoop(
            conversation: $conversation,
            systemPrompt: $systemPrompt,
            context: $context,
            tools: $tools
        );
        
        // Step 6: Save assistant response
        $this->saveMessage($conversation, $response->content, 'assistant', [
            'tool_calls' => $response->toolCalls,
            'tokens_used' => $response->tokensUsed,
        ]);
        
        // Step 7: Update conversation state
        $this->updateConversationState($conversation, $response);
        
        return $response;
    }
    
    /**
     * Main LLM execution loop with tool calling
     */
    private function executeLLMLoop(
        Conversation $conversation,
        string $systemPrompt,
        ConversationContext $context,
        array $tools
    ): AIResponse {
        $messages = $context->toMessages();
        $allToolCalls = [];
        $iterations = 0;
        
        while ($iterations < self::MAX_TOOL_ITERATIONS) {
            $iterations++;
            
            // Call LLM
            $llmResponse = $this->llmProvider->chat(
                systemPrompt: $systemPrompt,
                messages: $messages,
                tools: $tools,
                temperature: 0.7,
            );
            
            // If no tool calls, we're done
            if (empty($llmResponse->toolCalls)) {
                return new AIResponse(
                    content: $llmResponse->content,
                    toolCalls: $allToolCalls,
                    tokensUsed: $llmResponse->tokensUsed,
                    finishReason: $llmResponse->finishReason,
                );
            }
            
            // Execute tool calls
            $toolResults = $this->executeToolCalls(
                $conversation, 
                $llmResponse->toolCalls
            );
            
            $allToolCalls = array_merge($allToolCalls, $llmResponse->toolCalls);
            
            // Append assistant message with tool calls
            $messages[] = [
                'role' => 'assistant',
                'content' => $llmResponse->content,
                'tool_calls' => $this->formatToolCallsForLLM($llmResponse->toolCalls),
            ];
            
            // Append tool results
            foreach ($toolResults as $result) {
                $messages[] = [
                    'role' => 'tool',
                    'tool_call_id' => $result->toolCallId,
                    'content' => json_encode($result->output),
                ];
            }
            
            Log::info('Tool iteration completed', [
                'conversation_id' => $conversation->id,
                'iteration' => $iterations,
                'tools_called' => array_column($llmResponse->toolCalls, 'name'),
            ]);
        }
        
        // Max iterations reached
        Log::warning('Max tool iterations reached', [
            'conversation_id' => $conversation->id,
        ]);
        
        return new AIResponse(
            content: "I apologize, but I'm having trouble completing your request. Please try again or contact support.",
            toolCalls: $allToolCalls,
            tokensUsed: 0,
            finishReason: 'max_iterations',
        );
    }
    
    /**
     * Execute an array of tool calls
     */
    private function executeToolCalls(
        Conversation $conversation,
        array $toolCalls
    ): array {
        $results = [];
        
        foreach ($toolCalls as $toolCall) {
            try {
                $tool = $this->toolRegistry->get($toolCall->name);
                
                // Validate tenant can use this tool
                if (!$tool->isAvailableFor($conversation->tenant)) {
                    throw new \Exception("Tool not available for tenant");
                }
                
                // Execute with tenant context
                $output = $tool->execute(
                    $toolCall->arguments,
                    $conversation
                );
                
                $results[] = new ToolResult(
                    toolCallId: $toolCall->id,
                    name: $toolCall->name,
                    output: $output,
                    success: true,
                );
                
            } catch (\Throwable $e) {
                Log::error('Tool execution failed', [
                    'tool' => $toolCall->name,
                    'error' => $e->getMessage(),
                ]);
                
                $results[] = new ToolResult(
                    toolCallId: $toolCall->id,
                    name: $toolCall->name,
                    output: ['error' => $e->getMessage()],
                    success: false,
                );
            }
        }
        
        return $results;
    }
}
```

### 2. System Prompt Builder

```php
<?php

namespace App\Services\AI;

use App\Models\Tenant;

class SystemPromptBuilder
{
    /**
     * Build dynamic system prompt based on tenant configuration
     */
    public function build(Tenant $tenant, string $channel): string
    {
        $config = $tenant->ai_config;
        $businessInfo = $tenant->business_profile;
        
        $prompt = <<<PROMPT
You are {$config['agent_name']}, an AI assistant for {$businessInfo['company_name']}.

## Your Role
{$config['agent_role_description']}

## Business Information
- Company: {$businessInfo['company_name']}
- Industry: {$businessInfo['industry']}
- Business Hours: {$this->formatBusinessHours($businessInfo['business_hours'])}
- Location: {$businessInfo['address']}
- Contact: {$businessInfo['phone']}, {$businessInfo['email']}

## Communication Style
- Tone: {$config['tone']} (e.g., professional, friendly, casual)
- Language: {$config['primary_language']}
- Always be helpful, accurate, and concise
- If you don't know something, say so honestly
- Never make up information about products or prices

## Your Capabilities
You can help customers with:
1. **Product Information** - Search products, check availability, pricing
2. **Orders** - Create orders, check order status, process payments
3. **Support** - Answer questions using the knowledge base
4. **Appointments** - Schedule appointments (if enabled)

## Tools Available
When you need to perform actions, use the available tools. Always:
- Confirm important actions before executing (e.g., placing orders)
- Provide clear summaries after tool execution
- Handle errors gracefully

## Guidelines for {$channel}
{$this->getChannelGuidelines($channel)}

## Special Instructions
{$config['custom_instructions'] ?? 'None'}

Remember: You represent {$businessInfo['company_name']}. Be helpful but know your limits.
PROMPT;

        return $prompt;
    }
    
    private function getChannelGuidelines(string $channel): string
    {
        return match($channel) {
            'whatsapp' => <<<GUIDELINES
- Keep messages concise (WhatsApp users prefer short messages)
- Use emojis sparingly but appropriately
- Format lists with line breaks, not bullet points
- Send one coherent message, don't split unnecessarily
- Images and documents can be shared when relevant
GUIDELINES,
            
            'voice' => <<<GUIDELINES
- Speak naturally and conversationally
- Keep responses brief for voice (under 30 seconds of speech)
- Spell out numbers and abbreviations
- Confirm important details by repeating them
- Offer to send details via WhatsApp for complex information
GUIDELINES,
            
            default => "Follow standard professional communication guidelines.",
        };
    }
}
```

### 3. Conversation Context Builder

```php
<?php

namespace App\Services\AI;

use App\Models\Conversation;
use App\Services\Knowledge\VectorSearchService;
use App\Services\Knowledge\ProductCatalogService;

class ConversationContextBuilder
{
    private const MAX_HISTORY_MESSAGES = 20;
    private const MAX_RAG_RESULTS = 5;
    
    public function __construct(
        private VectorSearchService $vectorSearch,
        private ProductCatalogService $productCatalog,
    ) {}
    
    public function build(Conversation $conversation, string $currentMessage): ConversationContext
    {
        // Get conversation history
        $history = $this->getConversationHistory($conversation);
        
        // Get relevant knowledge via RAG
        $ragContext = $this->getRAGContext($conversation->tenant_id, $currentMessage);
        
        // Get customer profile if available
        $customerContext = $this->getCustomerContext($conversation);
        
        // Get active cart if exists
        $cartContext = $this->getCartContext($conversation);
        
        return new ConversationContext(
            history: $history,
            ragContext: $ragContext,
            customerContext: $customerContext,
            cartContext: $cartContext,
            channel: $conversation->channel,
        );
    }
    
    private function getConversationHistory(Conversation $conversation): array
    {
        $messages = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->limit(self::MAX_HISTORY_MESSAGES)
            ->get()
            ->reverse()
            ->values();
        
        return $messages->map(fn($m) => [
            'role' => $m->role,
            'content' => $m->content,
            'timestamp' => $m->created_at->toIso8601String(),
        ])->toArray();
    }
    
    private function getRAGContext(string $tenantId, string $query): array
    {
        // Search knowledge base
        $results = $this->vectorSearch->search(
            tenantId: $tenantId,
            query: $query,
            limit: self::MAX_RAG_RESULTS
        );
        
        if (empty($results)) {
            return [];
        }
        
        return [
            'type' => 'knowledge_base',
            'content' => "Relevant information from knowledge base:\n" . 
                implode("\n---\n", array_column($results, 'content')),
        ];
    }
    
    private function getCustomerContext(Conversation $conversation): ?array
    {
        if (!$conversation->customer_id) {
            return null;
        }
        
        $customer = $conversation->customer;
        
        return [
            'type' => 'customer_profile',
            'content' => sprintf(
                "Customer: %s\nEmail: %s\nPhone: %s\nPrevious Orders: %d\nTotal Spent: %s",
                $customer->name ?? 'Unknown',
                $customer->email ?? 'Not provided',
                $customer->phone ?? 'Not provided',
                $customer->orders_count ?? 0,
                $customer->formatted_total_spent ?? '$0'
            ),
        ];
    }
    
    private function getCartContext(Conversation $conversation): ?array
    {
        $cart = $conversation->customer?->activeCart;
        
        if (!$cart || $cart->items->isEmpty()) {
            return null;
        }
        
        $items = $cart->items->map(fn($item) => sprintf(
            "- %s x%d @ %s = %s",
            $item->product_name,
            $item->quantity,
            $item->formatted_unit_price,
            $item->formatted_total
        ))->join("\n");
        
        return [
            'type' => 'active_cart',
            'content' => "Current cart:\n{$items}\nCart Total: {$cart->formatted_total}",
        ];
    }
}
```

---

## Tool System

### Tool Interface

```php
<?php

namespace App\Services\AI\Tools;

use App\Models\Conversation;
use App\Models\Tenant;

interface ToolInterface
{
    /**
     * Get tool name (used in function calling)
     */
    public function getName(): string;
    
    /**
     * Get tool description for LLM
     */
    public function getDescription(): string;
    
    /**
     * Get JSON schema for parameters
     */
    public function getParametersSchema(): array;
    
    /**
     * Check if tool is available for tenant
     */
    public function isAvailableFor(Tenant $tenant): bool;
    
    /**
     * Execute the tool
     */
    public function execute(array $arguments, Conversation $conversation): array;
}
```

### Tool Registry

```php
<?php

namespace App\Services\AI\Tools;

use App\Models\Tenant;

class ToolRegistry
{
    private array $tools = [];
    
    public function register(ToolInterface $tool): void
    {
        $this->tools[$tool->getName()] = $tool;
    }
    
    public function get(string $name): ToolInterface
    {
        if (!isset($this->tools[$name])) {
            throw new \InvalidArgumentException("Tool not found: {$name}");
        }
        
        return $this->tools[$name];
    }
    
    /**
     * Get tools available for a specific tenant
     */
    public function getToolsForTenant(Tenant $tenant): array
    {
        $availableTools = [];
        
        foreach ($this->tools as $tool) {
            if ($tool->isAvailableFor($tenant)) {
                $availableTools[] = [
                    'type' => 'function',
                    'function' => [
                        'name' => $tool->getName(),
                        'description' => $tool->getDescription(),
                        'parameters' => $tool->getParametersSchema(),
                    ],
                ];
            }
        }
        
        return $availableTools;
    }
}
```

### Example Tools

```php
<?php

// Product Search Tool
class SearchProductsTool implements ToolInterface
{
    public function __construct(
        private ProductCatalogService $catalog
    ) {}
    
    public function getName(): string
    {
        return 'search_products';
    }
    
    public function getDescription(): string
    {
        return 'Search for products in the catalog by name, category, or description. Use this when customers ask about products or what\'s available.';
    }
    
    public function getParametersSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'query' => [
                    'type' => 'string',
                    'description' => 'Search query (product name, category, or keywords)',
                ],
                'category' => [
                    'type' => 'string',
                    'description' => 'Filter by category (optional)',
                ],
                'max_results' => [
                    'type' => 'integer',
                    'description' => 'Maximum number of results (default: 5)',
                    'default' => 5,
                ],
            ],
            'required' => ['query'],
        ];
    }
    
    public function isAvailableFor(Tenant $tenant): bool
    {
        return $tenant->hasFeature('product_catalog');
    }
    
    public function execute(array $arguments, Conversation $conversation): array
    {
        $results = $this->catalog->search(
            tenantId: $conversation->tenant_id,
            query: $arguments['query'],
            category: $arguments['category'] ?? null,
            limit: $arguments['max_results'] ?? 5
        );
        
        return [
            'success' => true,
            'products' => $results->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $p->formatted_price,
                'in_stock' => $p->in_stock,
                'description' => $p->short_description,
            ])->toArray(),
            'total_found' => $results->count(),
        ];
    }
}

// Create Order Tool
class CreateOrderTool implements ToolInterface
{
    public function __construct(
        private OrderService $orderService
    ) {}
    
    public function getName(): string
    {
        return 'create_order';
    }
    
    public function getDescription(): string
    {
        return 'Create an order from the customer\'s cart. Only call this after customer confirms they want to place the order.';
    }
    
    public function getParametersSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'customer_name' => [
                    'type' => 'string',
                    'description' => 'Customer\'s full name',
                ],
                'customer_phone' => [
                    'type' => 'string',
                    'description' => 'Customer\'s phone number',
                ],
                'customer_email' => [
                    'type' => 'string',
                    'description' => 'Customer\'s email (optional)',
                ],
                'delivery_address' => [
                    'type' => 'string',
                    'description' => 'Delivery address if applicable',
                ],
                'notes' => [
                    'type' => 'string',
                    'description' => 'Special instructions or notes',
                ],
            ],
            'required' => ['customer_name', 'customer_phone'],
        ];
    }
    
    public function isAvailableFor(Tenant $tenant): bool
    {
        return $tenant->hasFeature('orders');
    }
    
    public function execute(array $arguments, Conversation $conversation): array
    {
        // Get or create customer
        $customer = $conversation->customer ?? $this->createCustomer(
            $conversation->tenant_id,
            $arguments
        );
        
        // Get active cart
        $cart = $customer->activeCart;
        
        if (!$cart || $cart->items->isEmpty()) {
            return [
                'success' => false,
                'error' => 'Cart is empty. Add items before creating order.',
            ];
        }
        
        // Create order
        $order = $this->orderService->createFromCart(
            cart: $cart,
            customer: $customer,
            deliveryAddress: $arguments['delivery_address'] ?? null,
            notes: $arguments['notes'] ?? null,
        );
        
        return [
            'success' => true,
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total' => $order->formatted_total,
                'status' => $order->status,
                'payment_link' => $order->payment_link,
            ],
        ];
    }
}

// Request Human Handover Tool
class RequestHumanTool implements ToolInterface
{
    public function __construct(
        private EscalationManager $escalation
    ) {}
    
    public function getName(): string
    {
        return 'request_human';
    }
    
    public function getDescription(): string
    {
        return 'Transfer the conversation to a human agent. Use when: customer explicitly asks for human, issue is too complex, customer is frustrated, or you cannot help.';
    }
    
    public function getParametersSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'reason' => [
                    'type' => 'string',
                    'description' => 'Brief reason for handover',
                    'enum' => ['customer_request', 'complex_issue', 'frustrated_customer', 'ai_limitation'],
                ],
                'summary' => [
                    'type' => 'string',
                    'description' => 'Summary of conversation and issue for the human agent',
                ],
                'priority' => [
                    'type' => 'string',
                    'enum' => ['low', 'medium', 'high', 'urgent'],
                    'default' => 'medium',
                ],
            ],
            'required' => ['reason', 'summary'],
        ];
    }
    
    public function isAvailableFor(Tenant $tenant): bool
    {
        return $tenant->hasFeature('human_handover');
    }
    
    public function execute(array $arguments, Conversation $conversation): array
    {
        $ticket = $this->escalation->createHandover(
            conversation: $conversation,
            reason: $arguments['reason'],
            summary: $arguments['summary'],
            priority: $arguments['priority'] ?? 'medium',
        );
        
        return [
            'success' => true,
            'message' => 'Conversation transferred to human agent.',
            'ticket_id' => $ticket->id,
            'estimated_wait' => $ticket->estimated_wait_time,
        ];
    }
}
```

---

## Complete Tool List

| Tool Name | Description | Category |
|-----------|-------------|----------|
| `search_products` | Search product catalog | Knowledge |
| `get_product_details` | Get full product information | Knowledge |
| `check_availability` | Check stock levels | Knowledge |
| `search_knowledge_base` | Search FAQs and docs | Knowledge |
| `add_to_cart` | Add item to cart | Transaction |
| `view_cart` | View current cart | Transaction |
| `update_cart_item` | Change quantity | Transaction |
| `remove_from_cart` | Remove item | Transaction |
| `clear_cart` | Empty the cart | Transaction |
| `create_order` | Place order from cart | Transaction |
| `get_order_status` | Check order status | Transaction |
| `initiate_payment` | Generate payment link | Transaction |
| `request_human` | Transfer to human | Communication |
| `send_document` | Send file to customer | Communication |
| `schedule_callback` | Schedule follow-up | Communication |
| `lookup_customer` | Find customer info | CRM |
| `update_customer` | Update customer details | CRM |

---

## Intent Classification

```php
<?php

namespace App\Services\AI;

class IntentClassifier
{
    // Intent categories
    private const INTENTS = [
        'product_inquiry' => [
            'patterns' => ['price', 'cost', 'how much', 'available', 'stock', 'product', 'item'],
            'priority' => 'high',
        ],
        'order_status' => [
            'patterns' => ['order', 'tracking', 'where is', 'delivery', 'shipped'],
            'priority' => 'high',
        ],
        'purchase_intent' => [
            'patterns' => ['buy', 'purchase', 'want to order', 'add to cart', 'checkout'],
            'priority' => 'high',
        ],
        'support_request' => [
            'patterns' => ['help', 'problem', 'issue', 'not working', 'refund', 'return'],
            'priority' => 'medium',
        ],
        'human_request' => [
            'patterns' => ['human', 'agent', 'person', 'real person', 'speak to someone'],
            'priority' => 'urgent',
        ],
        'greeting' => [
            'patterns' => ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
            'priority' => 'low',
        ],
        'general_inquiry' => [
            'patterns' => ['what', 'how', 'when', 'where', 'tell me'],
            'priority' => 'low',
        ],
    ];
    
    /**
     * Classify message intent
     * Used for routing and priority
     */
    public function classify(string $message): IntentResult
    {
        $message = strtolower($message);
        $scores = [];
        
        foreach (self::INTENTS as $intent => $config) {
            $score = 0;
            foreach ($config['patterns'] as $pattern) {
                if (str_contains($message, $pattern)) {
                    $score++;
                }
            }
            $scores[$intent] = $score;
        }
        
        arsort($scores);
        $topIntent = array_key_first($scores);
        
        return new IntentResult(
            primary: $topIntent,
            confidence: $scores[$topIntent] > 0 ? min($scores[$topIntent] * 0.3, 1.0) : 0,
            priority: self::INTENTS[$topIntent]['priority'],
            all: $scores,
        );
    }
}
```

---

## Voice AI Integration

### Voice Conversation Handling

```php
<?php

namespace App\Services\AI\Voice;

use App\Services\AI\AIOrchestrator;
use App\Models\Conversation;

class VoiceConversationHandler
{
    public function __construct(
        private AIOrchestrator $orchestrator,
        private VoiceProvider $voiceProvider,
    ) {}
    
    /**
     * Handle voice provider webhook (Retell/Vapi)
     */
    public function handleVoiceWebhook(array $payload): array
    {
        $event = $payload['event'] ?? $payload['type'];
        
        return match($event) {
            'call.started', 'call_started' => $this->handleCallStart($payload),
            'transcript', 'speech_recognized' => $this->handleTranscript($payload),
            'call.ended', 'call_ended' => $this->handleCallEnd($payload),
            'function_call', 'tool_call' => $this->handleFunctionCall($payload),
            default => ['status' => 'ignored'],
        };
    }
    
    /**
     * Handle incoming transcript (user speech)
     */
    private function handleTranscript(array $payload): array
    {
        $callId = $payload['call_id'];
        $transcript = $payload['transcript'];
        
        // Get conversation
        $conversation = Conversation::where('external_id', $callId)->first();
        
        if (!$conversation) {
            return ['error' => 'Conversation not found'];
        }
        
        // Process through AI
        $response = $this->orchestrator->processMessage(
            $conversation,
            $transcript,
            ['channel' => 'voice']
        );
        
        // Return response for voice synthesis
        return [
            'response' => $response->content,
            'end_call' => $response->shouldEndCall ?? false,
        ];
    }
    
    /**
     * Handle tool/function calls from voice AI
     */
    private function handleFunctionCall(array $payload): array
    {
        $callId = $payload['call_id'];
        $functionName = $payload['function_name'] ?? $payload['tool_name'];
        $arguments = $payload['arguments'] ?? $payload['parameters'];
        
        $conversation = Conversation::where('external_id', $callId)->first();
        
        // Execute tool
        $tool = $this->toolRegistry->get($functionName);
        $result = $tool->execute($arguments, $conversation);
        
        return [
            'function_response' => $result,
        ];
    }
}
```

### Retell AI Configuration

```php
<?php

// Retell AI Agent Configuration
return [
    'agent_config' => [
        'llm_websocket_url' => env('RETELL_LLM_WEBSOCKET_URL'),
        'voice_id' => env('RETELL_VOICE_ID', '11labs-jenny'),
        'language' => 'en-US',
        'ambient_sound' => 'coffee-shop',
        'responsiveness' => 0.8,
        'interruption_sensitivity' => 0.6,
        'enable_backchannel' => true,
        'backchannel_frequency' => 0.7,
        'backchannel_words' => ['yeah', 'uh-huh', 'I see', 'okay'],
        'end_call_after_silence_ms' => 10000,
        'max_call_duration_ms' => 1800000, // 30 minutes
        
        // Function definitions for voice AI
        'functions' => [
            [
                'name' => 'search_products',
                'description' => 'Search for products',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'query' => ['type' => 'string'],
                    ],
                    'required' => ['query'],
                ],
            ],
            [
                'name' => 'check_order_status',
                'description' => 'Check order status by order number',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'order_number' => ['type' => 'string'],
                    ],
                    'required' => ['order_number'],
                ],
            ],
            [
                'name' => 'transfer_to_human',
                'description' => 'Transfer call to human agent',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'reason' => ['type' => 'string'],
                    ],
                    'required' => ['reason'],
                ],
            ],
        ],
    ],
];
```

---

## Complete Request Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      COMPLETE AI REQUEST FLOW                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. MESSAGE ARRIVES                                                          │
│     ├─ WhatsApp Webhook → /api/webhook/whatsapp                             │
│     ├─ Voice Webhook → /api/webhook/retell                                  │
│     └─ Validate signature, parse payload                                     │
│                                                                              │
│  2. TENANT RESOLUTION                                                        │
│     ├─ Identify tenant from phone number / API key                          │
│     ├─ Load tenant config (AI settings, features)                           │
│     └─ Apply tenant scope to all queries                                     │
│                                                                              │
│  3. CONVERSATION LOOKUP/CREATE                                               │
│     ├─ Find existing conversation by external_id                            │
│     ├─ Or create new conversation                                           │
│     └─ Associate customer if identifiable                                    │
│                                                                              │
│  4. CONTEXT BUILDING                                                         │
│     ├─ Load conversation history (last 20 messages)                         │
│     ├─ RAG search for relevant knowledge                                    │
│     ├─ Load customer profile                                                │
│     └─ Load active cart                                                      │
│                                                                              │
│  5. LLM REQUEST                                                              │
│     ├─ Build system prompt (tenant-specific)                                │
│     ├─ Format messages (history + context)                                  │
│     ├─ Attach available tools                                               │
│     └─ Call LLM API                                                          │
│                                                                              │
│  6. RESPONSE PROCESSING                                                      │
│     ├─ If text response → go to step 8                                      │
│     ├─ If tool call → execute tool                                          │
│     │   ├─ Get tool from registry                                           │
│     │   ├─ Validate arguments                                               │
│     │   ├─ Execute with conversation context                                │
│     │   └─ Return result to LLM                                             │
│     └─ Loop back to step 5 if more processing needed                        │
│                                                                              │
│  7. TOOL EXECUTION (Examples)                                                │
│     ├─ search_products → Query product catalog                              │
│     ├─ add_to_cart → Create/update cart item                                │
│     ├─ create_order → Process order + payment link                          │
│     └─ request_human → Create handover ticket                               │
│                                                                              │
│  8. RESPONSE DELIVERY                                                        │
│     ├─ Save assistant message to DB                                         │
│     ├─ Update conversation state                                            │
│     ├─ Send via channel (WhatsApp API / Voice response)                     │
│     └─ Track analytics (tokens, latency)                                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Strategy

```php
<?php

namespace App\Services\AI;

class AIErrorHandler
{
    /**
     * Handle AI processing errors gracefully
     */
    public function handle(\Throwable $e, Conversation $conversation): AIResponse
    {
        Log::error('AI processing error', [
            'conversation_id' => $conversation->id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        
        // Determine error type and response
        $response = match(true) {
            $e instanceof RateLimitException => $this->handleRateLimit($e),
            $e instanceof LLMTimeoutException => $this->handleTimeout($e),
            $e instanceof ToolExecutionException => $this->handleToolError($e),
            $e instanceof InvalidInputException => $this->handleInvalidInput($e),
            default => $this->handleGenericError($e),
        };
        
        // Save error message
        $this->saveErrorMessage($conversation, $response);
        
        return $response;
    }
    
    private function handleRateLimit(RateLimitException $e): AIResponse
    {
        return new AIResponse(
            content: "I'm experiencing high demand right now. Please try again in a moment.",
            error: true,
            errorType: 'rate_limit',
        );
    }
    
    private function handleTimeout(LLMTimeoutException $e): AIResponse
    {
        return new AIResponse(
            content: "I'm taking longer than expected to respond. Please try sending your message again.",
            error: true,
            errorType: 'timeout',
        );
    }
    
    private function handleToolError(ToolExecutionException $e): AIResponse
    {
        return new AIResponse(
            content: "I had trouble completing that action. Let me try a different approach, or you can ask a human agent for help.",
            error: true,
            errorType: 'tool_error',
        );
    }
    
    private function handleGenericError(\Throwable $e): AIResponse
    {
        return new AIResponse(
            content: "I apologize, but I encountered an unexpected issue. Please try again, or type 'human' to speak with someone.",
            error: true,
            errorType: 'generic',
        );
    }
}
```

---

## Next Steps

- See [API Specification](./09-API-SPECIFICATION.md) for REST API details
- See [Security & Scalability](./10-SECURITY-SCALABILITY.md) for production considerations
