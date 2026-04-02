<?php

namespace App\Http\Requests\Agent;

use App\Enums\AgentStatus;
use App\Enums\AgentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['sometimes', Rule::enum(AgentType::class)],
            'status' => ['sometimes', Rule::enum(AgentStatus::class)],
            'avatar_url' => ['nullable', 'string', 'url'],
            'system_prompt' => ['nullable', 'string', 'max:10000'],
            'welcome_message' => ['nullable', 'string', 'max:500'],
            'fallback_message' => ['nullable', 'string', 'max:500'],
            'language' => ['nullable', 'string', 'max:10'],
            'voice_id' => ['nullable', 'string'],
            'voice_settings' => ['nullable', 'array'],
            'workflow' => ['nullable', 'array'],
            'settings' => ['nullable', 'array'],
            'channels' => ['nullable', 'array'],
            'knowledge_base_ids' => ['nullable', 'array'],
            'product_ids' => ['nullable', 'array'],
        ];
    }
}
