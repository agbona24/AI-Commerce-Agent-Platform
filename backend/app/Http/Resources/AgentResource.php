<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type,
            'type_label' => $this->type?->label(),
            'status' => $this->status,
            'status_label' => $this->status?->label(),
            'avatar_url' => $this->avatar_url,
            'system_prompt' => $this->system_prompt,
            'welcome_message' => $this->welcome_message,
            'fallback_message' => $this->fallback_message,
            'language' => $this->language,
            'voice_id' => $this->voice_id,
            'voice_settings' => $this->voice_settings,
            'workflow' => $this->workflow,
            'settings' => $this->settings,
            'channels' => $this->channels,
            'is_default' => $this->is_default,
            'knowledge_bases' => KnowledgeBaseResource::collection($this->whenLoaded('knowledgeBases')),
            'products_count' => $this->whenCounted('products'),
            'conversations_count' => $this->whenCounted('conversations'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
