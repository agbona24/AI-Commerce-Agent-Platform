<?php

namespace App\Models;

use App\Enums\IntegrationStatus;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Integration extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'type',
        'name',
        'provider',
        'status',
        'credentials',
        'settings',
        'webhook_url',
        'webhook_secret',
        'last_sync_at',
        'last_error',
        'metadata',
    ];

    protected $casts = [
        'status' => IntegrationStatus::class,
        'credentials' => 'encrypted:array',
        'settings' => 'array',
        'metadata' => 'array',
        'last_sync_at' => 'datetime',
    ];

    protected $hidden = [
        'credentials',
        'webhook_secret',
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Scopes
    public function scopeConnected($query)
    {
        return $query->where('status', IntegrationStatus::CONNECTED);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Helpers
    public function isConnected(): bool
    {
        return $this->status === IntegrationStatus::CONNECTED;
    }

    public function markAsError(string $error): void
    {
        $this->update([
            'status' => IntegrationStatus::ERROR,
            'last_error' => $error,
        ]);
    }
}
