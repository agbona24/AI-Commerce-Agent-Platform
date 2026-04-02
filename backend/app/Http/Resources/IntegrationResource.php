<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IntegrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'name' => $this->name,
            'provider' => $this->provider,
            'status' => $this->status,
            'status_label' => $this->status?->label(),
            'settings' => $this->settings,
            'webhook_url' => $this->webhook_url,
            'last_sync_at' => $this->last_sync_at,
            'last_error' => $this->last_error,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
