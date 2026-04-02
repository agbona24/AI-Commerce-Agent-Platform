<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class KnowledgeBase extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'type',
        'source_url',
        'file_path',
        'file_type',
        'file_size',
        'content',
        'chunks',
        'embeddings_status',
        'last_synced_at',
        'metadata',
        'is_active',
    ];

    protected $casts = [
        'chunks' => 'array',
        'metadata' => 'array',
        'last_synced_at' => 'datetime',
        'is_active' => 'boolean',
        'file_size' => 'integer',
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function agents(): BelongsToMany
    {
        return $this->belongsToMany(Agent::class, 'agent_knowledge_bases');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeProcessed($query)
    {
        return $query->where('embeddings_status', 'completed');
    }
}
