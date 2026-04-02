<?php

namespace App\Http\Requests\Agent;

use App\Enums\AgentStatus;
use App\Enums\AgentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', Rule::enum(AgentType::class)],
            'status' => ['nullable', Rule::enum(AgentStatus::class)],
            'avatar_url' => ['nullable', 'string', 'url'],
            'system_prompt' => ['nullable', 'string', 'max:10000'],
            'welcome_message' => ['nullable', 'string', 'max:500'],
            'fallback_message' => ['nullable', 'string', 'max:500'],
            'language' => ['nullable', 'string', 'max:10'],
            'voice_id' => ['nullable', 'string'],
            'voice_settings' => ['nullable', 'array'],
            'voice_settings.speed' => ['nullable', 'numeric', 'min:0.5', 'max:2'],
            'voice_settings.stability' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'workflow' => ['nullable', 'array'],
            'settings' => ['nullable', 'array'],
            'channels' => ['nullable', 'array'],
            'channels.*' => ['string', 'in:whatsapp,voice,web_widget,email,sms'],
            'knowledge_base_ids' => ['nullable', 'array'],
            'knowledge_base_ids.*' => ['exists:knowledge_bases,id'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['exists:products,id'],
        ];
    }
}
