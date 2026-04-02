<?php

namespace App\Models;

use App\Enums\AgentStatus;
use App\Enums\AgentType;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Agent extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'type',
        'status',
        'avatar',
        'system_prompt',
        'welcome_message',
        'fallback_message',
        'language',
        'voice_id',
        'voice_settings',
        'workflow',
        'settings',
        'channels',
        'is_default',
    ];

    protected $casts = [
        'type' => AgentType::class,
        'status' => AgentStatus::class,
        'voice_settings' => 'array',
        'workflow' => 'array',
        'settings' => 'array',
        'channels' => 'array',
        'is_default' => 'boolean',
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function knowledgeBases(): BelongsToMany
    {
        return $this->belongsToMany(KnowledgeBase::class, 'agent_knowledge_base');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', AgentStatus::ACTIVE);
    }

    public function scopeOfType($query, AgentType $type)
    {
        return $query->where('type', $type);
    }
}
