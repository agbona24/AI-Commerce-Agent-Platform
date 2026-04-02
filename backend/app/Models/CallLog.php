<?php

namespace App\Models;

use App\Enums\CallStatus;
use App\Traits\BelongsToTenant;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CallLog extends Model
{
    use HasFactory, HasUuid, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'phone_number_id',
        'agent_id',
        'conversation_id',
        'direction',
        'status',
        'caller_number',
        'caller_name',
        'caller_city',
        'caller_state',
        'caller_country',
        'duration',
        'recording_url',
        'recording_duration',
        'transcript',
        'summary',
        'sentiment',
        'intent',
        'tags',
        'resolution_status',
        'provider_call_id',
        'provider_data',
        'started_at',
        'answered_at',
        'ended_at',
    ];

    protected $casts = [
        'status' => CallStatus::class,
        'transcript' => 'array',
        'tags' => 'array',
        'provider_data' => 'array',
        'duration' => 'integer',
        'recording_duration' => 'integer',
        'started_at' => 'datetime',
        'answered_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    protected $hidden = [
        'provider_call_id',
        'provider_data',
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function phoneNumber(): BelongsTo
    {
        return $this->belongsTo(PhoneNumber::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', CallStatus::COMPLETED);
    }

    public function scopeMissed($query)
    {
        return $query->where('status', CallStatus::MISSED);
    }

    public function scopeInbound($query)
    {
        return $query->where('direction', 'inbound');
    }

    public function scopeOutbound($query)
    {
        return $query->where('direction', 'outbound');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    // Accessors
    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration) {
            return '0:00';
        }

        $minutes = floor($this->duration / 60);
        $seconds = $this->duration % 60;

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    public function getSentimentLabelAttribute(): string
    {
        return match($this->sentiment) {
            'positive' => 'Positive',
            'negative' => 'Negative',
            'neutral' => 'Neutral',
            default => 'Unknown',
        };
    }

    // Methods
    public function markAsCompleted(int $duration): void
    {
        $this->update([
            'status' => CallStatus::COMPLETED,
            'duration' => $duration,
            'ended_at' => now(),
        ]);
    }

    public function markAsMissed(): void
    {
        $this->update([
            'status' => CallStatus::MISSED,
            'ended_at' => now(),
        ]);
    }

    public function setTranscript(array $transcript, ?string $summary = null, ?string $sentiment = null): void
    {
        $this->update([
            'transcript' => $transcript,
            'summary' => $summary,
            'sentiment' => $sentiment,
        ]);
    }

    public function setRecording(string $url, int $duration): void
    {
        $this->update([
            'recording_url' => $url,
            'recording_duration' => $duration,
        ]);
    }
}
