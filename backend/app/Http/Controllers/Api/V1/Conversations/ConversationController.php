<?php

namespace App\Http\Controllers\Api\V1\Conversations;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Enums\MessageRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends BaseController
{
    /**
     * List all conversations
     */
    public function index(Request $request): JsonResponse
    {
        $conversations = Conversation::query()
            ->with(['agent:id,name,avatar_url', 'assignedUser:id,first_name,last_name'])
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->channel, fn($q, $channel) => $q->where('channel', $channel))
            ->when($request->agent_id, fn($q, $id) => $q->where('agent_id', $id))
            ->when($request->assigned_to, fn($q, $id) => $q->where('assigned_to', $id))
            ->when($request->unassigned, fn($q) => $q->whereNull('assigned_to'))
            ->when($request->search, fn($q, $search) => $q->where(function($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            }))
            ->withCount('messages')
            ->orderBy('last_message_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->paginated($conversations);
    }

    /**
     * Get a single conversation with messages
     */
    public function show(Conversation $conversation): JsonResponse
    {
        return $this->success(
            new ConversationResource(
                $conversation->load(['agent', 'assignedUser', 'messages'])
            )
        );
    }

    /**
     * Get conversation messages
     */
    public function messages(Conversation $conversation, Request $request): JsonResponse
    {
        $messages = $conversation->messages()
            ->orderBy('created_at', $request->order ?? 'asc')
            ->paginate($request->per_page ?? 50);

        return $this->paginated($messages);
    }

    /**
     * Send message in conversation
     */
    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|max:4096',
            'content_type' => 'nullable|in:text,image,audio,document',
            'attachments' => 'nullable|array',
        ]);

        // Save message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'role' => MessageRole::ASSISTANT,
            'content' => $request->content,
            'content_type' => $request->content_type ?? 'text',
            'attachments' => $request->attachments,
        ]);

        // Update conversation
        $conversation->update(['last_message_at' => now()]);

        // TODO: Send via appropriate channel (WhatsApp, etc.)

        return $this->created(new MessageResource($message));
    }

    /**
     * Update conversation
     */
    public function update(Request $request, Conversation $conversation): JsonResponse
    {
        $data = $request->validate([
            'status' => 'sometimes|in:active,waiting,resolved,escalated,closed',
            'assigned_to' => 'nullable|exists:users,id',
            'tags' => 'nullable|array',
            'priority' => 'nullable|in:low,normal,high,urgent',
        ]);

        // Set resolution time if resolving
        if (isset($data['status']) && $data['status'] === 'resolved' && !$conversation->resolved_at) {
            $data['resolved_at'] = now();
        }

        $conversation->update($data);

        return $this->success(
            new ConversationResource($conversation),
            'Conversation updated'
        );
    }

    /**
     * Assign conversation
     */
    public function assign(Request $request, Conversation $conversation): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $conversation->update(['assigned_to' => $request->user_id]);

        return $this->success(
            new ConversationResource($conversation->load('assignedUser')),
            'Conversation assigned'
        );
    }

    /**
     * Close conversation
     */
    public function close(Conversation $conversation): JsonResponse
    {
        $conversation->update([
            'status' => 'closed',
            'resolved_at' => $conversation->resolved_at ?? now(),
        ]);

        return $this->success(null, 'Conversation closed');
    }

    /**
     * Get conversation analytics
     */
    public function analytics(Request $request): JsonResponse
    {
        $tenantId = auth()->user()->tenant_id;
        $period = $request->period ?? '7d';

        $startDate = match($period) {
            '24h' => now()->subDay(),
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            default => now()->subDays(7),
        };

        $conversations = Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate);

        return $this->success([
            'total' => $conversations->count(),
            'active' => (clone $conversations)->active()->count(),
            'resolved' => (clone $conversations)->where('status', 'resolved')->count(),
            'escalated' => (clone $conversations)->where('status', 'escalated')->count(),
            'by_channel' => (clone $conversations)->selectRaw('channel, count(*) as count')
                ->groupBy('channel')
                ->pluck('count', 'channel'),
            'avg_response_time' => (clone $conversations)->avg('first_response_at'),
            'avg_resolution_time' => (clone $conversations)->whereNotNull('resolved_at')
                ->avg(\DB::raw('TIMESTAMPDIFF(MINUTE, created_at, resolved_at)')),
        ]);
    }

    /**
     * Escalate conversation to human agent
     */
    public function escalate(Request $request, Conversation $conversation): JsonResponse
    {
        $request->validate([
            'assign_to' => 'nullable|exists:users,id',
            'reason' => 'nullable|string|max:500',
        ]);

        $currentUser = auth()->user();
        $assignTo = $request->assign_to ?? $currentUser->id;

        $conversation->update([
            'status' => 'escalated',
            'assigned_to' => $assignTo,
            'escalated_at' => now(),
            'escalation_reason' => $request->reason,
        ]);

        // Add system message about escalation
        Message::create([
            'conversation_id' => $conversation->id,
            'role' => MessageRole::SYSTEM,
            'content' => 'Conversation has been escalated to a human agent.',
            'content_type' => 'text',
        ]);

        return $this->success(
            new ConversationResource($conversation->load('assignedUser')),
            'Conversation escalated to human agent'
        );
    }

    /**
     * Hand conversation back to AI
     */
    public function handBack(Conversation $conversation): JsonResponse
    {
        $conversation->update([
            'status' => 'active',
            'assigned_to' => null,
            'escalated_at' => null,
            'escalation_reason' => null,
        ]);

        // Add system message about hand-back
        Message::create([
            'conversation_id' => $conversation->id,
            'role' => MessageRole::SYSTEM,
            'content' => 'Conversation has been handed back to AI agent.',
            'content_type' => 'text',
        ]);

        return $this->success(
            new ConversationResource($conversation),
            'Conversation handed back to AI'
        );
    }
}
