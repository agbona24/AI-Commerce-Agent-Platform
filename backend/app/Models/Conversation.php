<?php

namespace App\Models;

use App\Enums\ChannelType;
use App\Enums\ConversationStatus;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'agent_id',
        'assigned_to',
        'channel',
        'status',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_metadata',
        'external_id',
        'summary',
        'sentiment',
        'intent',
        'tags',
        'priority',
        'first_response_at',
        'resolved_at',
        'last_message_at',
    ];

    protected $casts = [
        'channel' => ChannelType::class,
        'status' => ConversationStatus::class,
        'customer_metadata' => 'array',
        'tags' => 'array',
        'first_response_at' => 'datetime',
        'resolved_at' => 'datetime',
        'last_message_at' => 'datetime',
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', [ConversationStatus::ACTIVE, ConversationStatus::WAITING]);
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    public function scopeChannel($query, ChannelType $channel)
    {
        return $query->where('channel', $channel);
    }

    // Helpers
    public function getResponseTime(): ?int
    {
        if (!$this->first_response_at) return null;
        return $this->created_at->diffInSeconds($this->first_response_at);
    }

    public function getResolutionTime(): ?int
    {
        if (!$this->resolved_at) return null;
        return $this->created_at->diffInSeconds($this->resolved_at);
    }
}
