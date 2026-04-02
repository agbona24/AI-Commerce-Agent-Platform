<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'channel' => $this->channel,
            'channel_label' => $this->channel?->label(),
            'status' => $this->status,
            'status_label' => $this->status?->label(),
            'customer' => [
                'name' => $this->customer_name,
                'email' => $this->customer_email,
                'phone' => $this->customer_phone,
                'metadata' => $this->customer_metadata,
            ],
            'summary' => $this->summary,
            'sentiment' => $this->sentiment,
            'intent' => $this->intent,
            'tags' => $this->tags,
            'priority' => $this->priority,
            'agent' => new AgentResource($this->whenLoaded('agent')),
            'assigned_user' => new UserResource($this->whenLoaded('assignedUser')),
            'messages' => MessageResource::collection($this->whenLoaded('messages')),
            'messages_count' => $this->whenCounted('messages'),
            'first_response_at' => $this->first_response_at,
            'resolved_at' => $this->resolved_at,
            'last_message_at' => $this->last_message_at,
            'response_time_seconds' => $this->getResponseTime(),
            'resolution_time_seconds' => $this->getResolutionTime(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
