<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'role' => $this->role,
            'role_label' => $this->role?->label(),
            'content' => $this->content,
            'content_type' => $this->content_type,
            'attachments' => $this->attachments,
            'metadata' => $this->metadata,
            'tokens_used' => $this->tokens_used,
            'is_read' => $this->is_read,
            'read_at' => $this->read_at,
            'delivered_at' => $this->delivered_at,
            'created_at' => $this->created_at,
        ];
    }
}
