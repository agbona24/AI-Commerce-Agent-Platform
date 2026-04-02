<?php

namespace App\Services\AI;

use App\Models\Agent;
use App\Enums\AgentStatus;
use Illuminate\Support\Facades\DB;

class AgentService
{
    /**
     * Create a new agent
     */
    public function create(array $data): Agent
    {
        return DB::transaction(function () use ($data) {
            $agent = Agent::create([
                'tenant_id' => auth()->user()->tenant_id,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'type' => $data['type'],
                'status' => $data['status'] ?? AgentStatus::DRAFT,
                'avatar' => $data['avatar'] ?? null,
                'system_prompt' => $data['system_prompt'] ?? $this->getDefaultPrompt($data['type']),
                'welcome_message' => $data['welcome_message'] ?? 'Hi! How can I help you today?',
                'fallback_message' => $data['fallback_message'] ?? "I'm not sure I understand. Could you rephrase that?",
                'language' => $data['language'] ?? 'en',
                'voice_id' => $data['voice_id'] ?? null,
                'voice_settings' => $data['voice_settings'] ?? ['speed' => 1.0, 'stability' => 0.75],
                'workflow' => $data['workflow'] ?? [],
                'settings' => $data['settings'] ?? [],
                'channels' => $data['channels'] ?? ['web_widget'],
            ]);

            // Attach knowledge bases
            if (!empty($data['knowledge_base_ids'])) {
                $agent->knowledgeBases()->attach($data['knowledge_base_ids']);
            }

            // Attach products
            if (!empty($data['product_ids'])) {
                $agent->products()->attach($data['product_ids']);
            }

            return $agent;
        });
    }

    /**
     * Update an agent
     */
    public function update(Agent $agent, array $data): Agent
    {
        return DB::transaction(function () use ($agent, $data) {
            $agent->update($data);

            // Sync knowledge bases
            if (isset($data['knowledge_base_ids'])) {
                $agent->knowledgeBases()->sync($data['knowledge_base_ids']);
            }

            // Sync products
            if (isset($data['product_ids'])) {
                $agent->products()->sync($data['product_ids']);
            }

            return $agent->fresh();
        });
    }

    /**
     * Duplicate an agent
     */
    public function duplicate(Agent $agent): Agent
    {
        $newAgent = $agent->replicate();
        $newAgent->name = $agent->name . ' (Copy)';
        $newAgent->status = AgentStatus::DRAFT;
        $newAgent->save();

        // Copy relationships
        $newAgent->knowledgeBases()->attach($agent->knowledgeBases->pluck('id'));
        $newAgent->products()->attach($agent->products->pluck('id'));

        return $newAgent;
    }

    /**
     * Get agent analytics
     */
    public function getAnalytics(Agent $agent): array
    {
        $conversations = $agent->conversations();
        
        return [
            'total_conversations' => $conversations->count(),
            'active_conversations' => $conversations->active()->count(),
            'resolved_conversations' => $conversations->where('status', 'resolved')->count(),
            'avg_response_time' => $conversations->avg(DB::raw('TIMESTAMPDIFF(SECOND, created_at, first_response_at)')),
            'avg_resolution_time' => $conversations->whereNotNull('resolved_at')->avg(DB::raw('TIMESTAMPDIFF(SECOND, created_at, resolved_at)')),
            'messages_count' => $agent->conversations()->withCount('messages')->get()->sum('messages_count'),
            'satisfaction_score' => 4.5, // TODO: Implement actual calculation
        ];
    }

    /**
     * Test agent with a message
     */
    public function testMessage(Agent $agent, string $message): array
    {
        // TODO: Integrate with actual AI service
        return [
            'response' => "This is a test response from {$agent->name}. You said: \"{$message}\"",
            'tokens_used' => 50,
            'model' => 'gpt-4',
        ];
    }

    /**
     * Get default prompt based on agent type
     */
    protected function getDefaultPrompt(string $type): string
    {
        return match($type) {
            'sales' => "You are a helpful sales assistant. Help customers find products, answer questions, and guide them through the purchase process. Be friendly, professional, and knowledgeable about our products.",
            'support' => "You are a customer support agent. Help resolve customer issues, answer questions, and provide assistance. Be empathetic, patient, and solution-oriented.",
            'booking' => "You are a booking assistant. Help customers schedule appointments, check availability, and manage their bookings. Be efficient and organized.",
            'lead_qualification' => "You are a lead qualification specialist. Engage with potential customers, understand their needs, and collect relevant information. Ask qualifying questions naturally.",
            default => "You are an AI assistant. Help users with their questions and provide accurate, helpful responses.",
        };
    }
}
