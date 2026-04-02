<?php

namespace App\Services\Analytics;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Agent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class AnalyticsService
{
    /**
     * Get cached analytics for dashboard
     */
    public function getDashboardStats(int $tenantId, string $period = '7d'): array
    {
        $cacheKey = "analytics:{$tenantId}:{$period}";
        
        return Cache::remember($cacheKey, 300, function () use ($tenantId, $period) {
            return $this->calculateDashboardStats($tenantId, $period);
        });
    }

    /**
     * Calculate dashboard statistics
     */
    protected function calculateDashboardStats(int $tenantId, string $period): array
    {
        $startDate = $this->getStartDate($period);

        $conversations = Conversation::where('tenant_id', $tenantId);
        $periodConversations = (clone $conversations)->where('created_at', '>=', $startDate);

        return [
            'total_conversations' => $periodConversations->count(),
            'resolved_conversations' => (clone $periodConversations)->where('status', 'resolved')->count(),
            'active_conversations' => $conversations->whereIn('status', ['active', 'waiting'])->count(),
            'avg_response_time' => $this->getAverageResponseTime($tenantId, $startDate),
            'avg_resolution_time' => $this->getAverageResolutionTime($tenantId, $startDate),
            'satisfaction_score' => $this->getSatisfactionScore($tenantId, $startDate),
            'conversations_by_channel' => $this->getConversationsByChannel($tenantId, $startDate),
            'conversations_by_agent' => $this->getConversationsByAgent($tenantId, $startDate),
        ];
    }

    /**
     * Get average response time in seconds
     */
    public function getAverageResponseTime(int $tenantId, \Carbon\Carbon $startDate): ?float
    {
        return Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('first_response_at')
            ->avg(DB::raw('TIMESTAMPDIFF(SECOND, created_at, first_response_at)'));
    }

    /**
     * Get average resolution time in minutes
     */
    public function getAverageResolutionTime(int $tenantId, \Carbon\Carbon $startDate): ?float
    {
        return Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('resolved_at')
            ->avg(DB::raw('TIMESTAMPDIFF(MINUTE, created_at, resolved_at)'));
    }

    /**
     * Get satisfaction score
     */
    public function getSatisfactionScore(int $tenantId, \Carbon\Carbon $startDate): float
    {
        // TODO: Implement actual satisfaction tracking
        return 4.5;
    }

    /**
     * Get conversations grouped by channel
     */
    public function getConversationsByChannel(int $tenantId, \Carbon\Carbon $startDate): array
    {
        return Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('channel, COUNT(*) as count')
            ->groupBy('channel')
            ->pluck('count', 'channel')
            ->toArray();
    }

    /**
     * Get conversations grouped by agent
     */
    public function getConversationsByAgent(int $tenantId, \Carbon\Carbon $startDate): array
    {
        return Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('agent_id')
            ->selectRaw('agent_id, COUNT(*) as count')
            ->groupBy('agent_id')
            ->with('agent:id,name')
            ->get()
            ->map(fn($item) => [
                'agent_id' => $item->agent_id,
                'agent_name' => $item->agent?->name ?? 'Unknown',
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get hourly distribution
     */
    public function getHourlyDistribution(int $tenantId, \Carbon\Carbon $startDate): array
    {
        return Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->pluck('count', 'hour')
            ->toArray();
    }

    /**
     * Get start date from period string
     */
    protected function getStartDate(string $period): \Carbon\Carbon
    {
        return match($period) {
            '24h' => now()->subDay(),
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subDays(7),
        };
    }
}
