<?php

namespace App\Models;

use App\Enums\MessageRole;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'content_type',
        'attachments',
        'metadata',
        'tokens_used',
        'cost',
        'is_read',
        'read_at',
        'delivered_at',
    ];

    protected $casts = [
        'role' => MessageRole::class,
        'attachments' => 'array',
        'metadata' => 'array',
        'tokens_used' => 'integer',
        'cost' => 'decimal:6',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    // Relationships
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    // Scopes
    public function scopeFromUser($query)
    {
        return $query->where('role', MessageRole::USER);
    }

    public function scopeFromAssistant($query)
    {
        return $query->where('role', MessageRole::ASSISTANT);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
