<?php

namespace App\Models;

use App\Enums\PhoneNumberStatus;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PhoneNumber extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'agent_id',
        'phone_number',
        'friendly_name',
        'provider',
        'provider_id',
        'country_code',
        'area_code',
        'status',
        'capabilities',
        'monthly_cost',
        'settings',
        'webhook_url',
        'is_verified',
        'verified_at',
        'last_used_at',
    ];

    protected $casts = [
        'status' => PhoneNumberStatus::class,
        'capabilities' => 'array',
        'settings' => 'array',
        'monthly_cost' => 'decimal:2',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    protected $hidden = [
        'provider_id',
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

    public function callLogs(): HasMany
    {
        return $this->hasMany(CallLog::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', PhoneNumberStatus::ACTIVE);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    // Accessors
    public function getFormattedNumberAttribute(): string
    {
        // Format: +1 (555) 123-4567
        $number = preg_replace('/[^0-9]/', '', $this->phone_number);
        
        if (strlen($number) === 11 && str_starts_with($number, '1')) {
            return sprintf('+1 (%s) %s-%s',
                substr($number, 1, 3),
                substr($number, 4, 3),
                substr($number, 7, 4)
            );
        }
        
        return $this->phone_number;
    }

    // Methods
    public function markAsVerified(): void
    {
        $this->update([
            'is_verified' => true,
            'verified_at' => now(),
            'status' => PhoneNumberStatus::ACTIVE,
        ]);
    }

    public function markAsUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    public function assignToAgent(Agent $agent): void
    {
        $this->update(['agent_id' => $agent->id]);
    }

    public function unassignAgent(): void
    {
        $this->update(['agent_id' => null]);
    }
}
