<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KnowledgeBaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type,
            'source_url' => $this->source_url,
            'file_type' => $this->file_type,
            'file_size' => $this->file_size,
            'embeddings_status' => $this->embeddings_status,
            'chunks_count' => is_array($this->chunks) ? count($this->chunks) : 0,
            'is_active' => $this->is_active,
            'last_synced_at' => $this->last_synced_at,
            'agents' => AgentResource::collection($this->whenLoaded('agents')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
