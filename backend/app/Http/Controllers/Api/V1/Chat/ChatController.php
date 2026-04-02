<?php

namespace App\Http\Controllers\Api\V1\Chat;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Agent;
use App\Models\Conversation;
use App\Models\Message;
use App\Enums\ConversationStatus;
use App\Enums\MessageRole;
use App\Services\AI\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatController extends BaseController
{
    protected ChatService $chatService;

    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    /**
     * Start a new conversation with an agent
     */
    public function startConversation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'channel' => 'nullable|in:web_widget,whatsapp,voice,api',
            'metadata' => 'nullable|array',
        ]);

        $agent = Agent::findOrFail($validated['agent_id']);

        // Create new conversation
        $conversation = Conversation::create([
            'tenant_id' => $agent->tenant_id,
            'agent_id' => $agent->id,
            'channel' => $validated['channel'] ?? 'web_widget',
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'],
            'status' => ConversationStatus::ACTIVE,
            'session_id' => Str::uuid(),
            'metadata' => $validated['metadata'] ?? [],
            'started_at' => now(),
            'last_message_at' => now(),
        ]);

        // Send welcome message if agent has one
        if ($agent->welcome_message) {
            $this->chatService->saveAssistantMessage(
                $conversation, 
                $agent->welcome_message,
                ['type' => 'welcome']
            );
        }

        return $this->created([
            'conversation' => new ConversationResource($conversation->load(['agent', 'messages'])),
            'session_id' => $conversation->session_id,
        ], 'Conversation started');
    }

    /**
     * Send message and get AI response
     */
    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:4096',
            'content_type' => 'nullable|in:text,image,audio,document',
        ]);

        // Check if conversation is still active
        if ($conversation->status === ConversationStatus::CLOSED) {
            return $this->error('This conversation has been closed', 400);
        }

        // Save user message
        $userMessage = $this->chatService->saveUserMessage(
            $conversation,
            $validated['content'],
            ['content_type' => $validated['content_type'] ?? 'text']
        );

        // Check if conversation is handed over to human
        if ($conversation->assigned_to && $conversation->status === ConversationStatus::ESCALATED) {
            return $this->success([
                'user_message' => new MessageResource($userMessage),
                'assistant_message' => null,
                'status' => 'escalated',
            ], 'Message sent to human agent');
        }

        // Generate AI response
        $response = $this->chatService->generateResponse($conversation, $validated['content']);

        if ($response['success']) {
            $assistantMessage = $this->chatService->saveAssistantMessage(
                $conversation,
                $response['response']['content'],
                ['tokens' => $response['tokens_used']]
            );

            return $this->success([
                'user_message' => new MessageResource($userMessage),
                'assistant_message' => new MessageResource($assistantMessage),
                'status' => 'active',
            ]);
        }

        // Fallback response on error
        $fallbackMessage = $this->chatService->saveAssistantMessage(
            $conversation,
            $response['response'] ?? "I'm having trouble right now. Please try again.",
            ['error' => $response['error']]
        );

        return $this->success([
            'user_message' => new MessageResource($userMessage),
            'assistant_message' => new MessageResource($fallbackMessage),
            'status' => 'error',
        ]);
    }

    /**
     * Get conversation by session ID (for widget)
     */
    public function getBySession(string $sessionId): JsonResponse
    {
        $conversation = Conversation::where('session_id', $sessionId)
            ->with(['agent', 'messages' => function($q) {
                $q->orderBy('created_at', 'asc');
            }])
            ->first();

        if (!$conversation) {
            return $this->error('Conversation not found', 404);
        }

        return $this->success(new ConversationResource($conversation));
    }

    /**
     * Request human handover
     */
    public function requestHandover(Request $request, Conversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        // Update conversation status
        $conversation->update([
            'status' => ConversationStatus::ESCALATED,
            'escalated_at' => now(),
            'metadata' => array_merge($conversation->metadata ?? [], [
                'escalation_reason' => $validated['reason'] ?? 'Customer requested human agent',
            ]),
        ]);

        // Add system message
        $message = $this->chatService->saveAssistantMessage(
            $conversation,
            "I'm connecting you with a human agent. Please wait a moment while someone becomes available.",
            ['type' => 'system', 'action' => 'escalation']
        );

        // TODO: Notify available agents via websocket/notification

        return $this->success([
            'message' => new MessageResource($message),
            'status' => 'escalated',
        ], 'Handover requested');
    }

    /**
     * End/close conversation
     */
    public function endConversation(Request $request, Conversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'rating' => 'nullable|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:1000',
        ]);

        $conversation->update([
            'status' => ConversationStatus::CLOSED,
            'resolved_at' => now(),
            'rating' => $validated['rating'] ?? null,
            'feedback' => $validated['feedback'] ?? null,
        ]);

        // Add closing message
        $message = $this->chatService->saveAssistantMessage(
            $conversation,
            "Thank you for chatting with us. This conversation has ended. Feel free to start a new conversation anytime!",
            ['type' => 'system', 'action' => 'close']
        );

        return $this->success([
            'message' => new MessageResource($message),
            'status' => 'closed',
        ], 'Conversation ended');
    }

    /**
     * Public endpoint to start chat via widget (no auth)
     */
    public function publicStartChat(Request $request, string $widgetId): JsonResponse
    {
        // Find tenant by widget ID
        $tenant = \App\Models\Tenant::whereRaw(
            "JSON_EXTRACT(settings, '$.widget_id') = ?", 
            [$widgetId]
        )->first();

        if (!$tenant) {
            return $this->error('Invalid widget ID', 404);
        }

        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'initial_message' => 'nullable|string|max:4096',
        ]);

        // Get default active agent for tenant
        $agent = Agent::where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->whereJsonContains('channels', 'web_widget')
            ->first();

        if (!$agent) {
            return $this->error('No active agent available', 404);
        }

        // Create conversation
        $conversation = Conversation::create([
            'tenant_id' => $tenant->id,
            'agent_id' => $agent->id,
            'channel' => 'web_widget',
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'],
            'status' => ConversationStatus::ACTIVE,
            'session_id' => Str::uuid(),
            'metadata' => ['widget_id' => $widgetId],
            'started_at' => now(),
            'last_message_at' => now(),
        ]);

        // Send welcome message
        if ($agent->welcome_message) {
            $this->chatService->saveAssistantMessage(
                $conversation,
                $agent->welcome_message,
                ['type' => 'welcome']
            );
        }

        // Process initial message if provided
        $assistantResponse = null;
        if (!empty($validated['initial_message'])) {
            $this->chatService->saveUserMessage(
                $conversation,
                $validated['initial_message']
            );

            $response = $this->chatService->generateResponse(
                $conversation,
                $validated['initial_message']
            );

            if ($response['success']) {
                $assistantResponse = $this->chatService->saveAssistantMessage(
                    $conversation,
                    $response['response']['content']
                );
            }
        }

        return $this->created([
            'conversation' => new ConversationResource($conversation->load(['agent', 'messages'])),
            'session_id' => $conversation->session_id,
        ]);
    }

    /**
     * Public endpoint to send message via widget
     */
    public function publicSendMessage(Request $request, string $sessionId): JsonResponse
    {
        $conversation = Conversation::where('session_id', $sessionId)->first();

        if (!$conversation) {
            return $this->error('Conversation not found', 404);
        }

        return $this->sendMessage($request, $conversation);
    }
}
