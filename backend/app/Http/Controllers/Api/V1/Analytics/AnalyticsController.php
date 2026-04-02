<?php

namespace App\Http\Controllers\Api\V1\Analytics;

use App\Http\Controllers\Api\V1\BaseController;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Agent;
use App\Models\Product;
use App\Services\Analytics\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends BaseController
{
    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    /**
     * Get dashboard overview
     */
    public function overview(Request $request): JsonResponse
    {
        $tenantId = auth()->user()->tenant_id;
        $period = $request->period ?? '7d';

        $startDate = $this->getStartDate($period);

        // Current period stats
        $stats = [
            'conversations' => [
                'total' => Conversation::where('tenant_id', $tenantId)
                    ->where('created_at', '>=', $startDate)->count(),
                'resolved' => Conversation::where('tenant_id', $tenantId)
                    ->where('created_at', '>=', $startDate)
                    ->where('status', 'resolved')->count(),
                'active' => Conversation::where('tenant_id', $tenantId)
                    ->whereIn('status', ['active', 'waiting'])->count(),
            ],
            'messages' => [
                'total' => Message::whereHas('conversation', fn($q) => 
                    $q->where('tenant_id', $tenantId)
                )->where('created_at', '>=', $startDate)->count(),
            ],
            'agents' => [
                'total' => Agent::where('tenant_id', $tenantId)->count(),
                'active' => Agent::where('tenant_id', $tenantId)->where('status', 'active')->count(),
            ],
            'products' => [
                'total' => Product::where('tenant_id', $tenantId)->count(),
                'active' => Product::where('tenant_id', $tenantId)->where('status', 'active')->count(),
            ],
        ];

        // Calculate changes
        $previousStart = $this->getStartDate($period, true);
        $previousEnd = $startDate;

        $previousConversations = Conversation::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$previousStart, $previousEnd])->count();

        $stats['conversations']['change'] = $this->calculateChange(
            $stats['conversations']['total'],
            $previousConversations
        );

        return $this->success($stats);
    }

    /**
     * Get conversations analytics
     */
    public function conversations(Request $request): JsonResponse
    {
        $tenantId = auth()->user()->tenant_id;
        $period = $request->period ?? '7d';
        $startDate = $this->getStartDate($period);

        // Daily conversation counts
        $daily = Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // By channel
        $byChannel = Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('channel, COUNT(*) as count')
            ->groupBy('channel')
            ->get();

        // By status
        $byStatus = Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        // Response times
        $avgResponseTime = Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('first_response_at')
            ->avg(DB::raw('TIMESTAMPDIFF(SECOND, created_at, first_response_at)'));

        $avgResolutionTime = Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('resolved_at')
            ->avg(DB::raw('TIMESTAMPDIFF(MINUTE, created_at, resolved_at)'));

        return $this->success([
            'daily' => $daily,
            'by_channel' => $byChannel,
            'by_status' => $byStatus,
            'avg_response_time_seconds' => round($avgResponseTime ?? 0),
            'avg_resolution_time_minutes' => round($avgResolutionTime ?? 0),
        ]);
    }

    /**
     * Get agent performance analytics
     */
    public function agents(Request $request): JsonResponse
    {
        $tenantId = auth()->user()->tenant_id;
        $period = $request->period ?? '7d';
        $startDate = $this->getStartDate($period);

        $agents = Agent::where('tenant_id', $tenantId)
            ->withCount(['conversations as total_conversations' => fn($q) => 
                $q->where('created_at', '>=', $startDate)
            ])
            ->withCount(['conversations as resolved_conversations' => fn($q) => 
                $q->where('created_at', '>=', $startDate)->where('status', 'resolved')
            ])
            ->get()
            ->map(function ($agent) {
                return [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'type' => $agent->type,
                    'status' => $agent->status,
                    'total_conversations' => $agent->total_conversations,
                    'resolved_conversations' => $agent->resolved_conversations,
                    'resolution_rate' => $agent->total_conversations > 0 
                        ? round(($agent->resolved_conversations / $agent->total_conversations) * 100, 1)
                        : 0,
                ];
            });

        return $this->success($agents);
    }

    /**
     * Get real-time stats
     */
    public function realtime(): JsonResponse
    {
        $tenantId = auth()->user()->tenant_id;

        return $this->success([
            'active_conversations' => Conversation::where('tenant_id', $tenantId)
                ->whereIn('status', ['active', 'waiting'])->count(),
            'waiting_conversations' => Conversation::where('tenant_id', $tenantId)
                ->where('status', 'waiting')->count(),
            'today_conversations' => Conversation::where('tenant_id', $tenantId)
                ->whereDate('created_at', today())->count(),
            'today_messages' => Message::whereHas('conversation', fn($q) => 
                $q->where('tenant_id', $tenantId)
            )->whereDate('created_at', today())->count(),
            'online_agents' => Agent::where('tenant_id', $tenantId)
                ->where('status', 'active')->count(),
        ]);
    }

    /**
     * Export analytics as CSV
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:conversations,agents,products',
            'period' => 'nullable|in:7d,30d,90d,1y',
        ]);

        // TODO: Generate CSV export
        return $this->success(['download_url' => '/exports/analytics.csv']);
    }

    /**
     * Get start date based on period
     */
    protected function getStartDate(string $period, bool $previous = false): \Carbon\Carbon
    {
        $days = match($period) {
            '24h' => 1,
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '1y' => 365,
            default => 7,
        };

        return $previous 
            ? now()->subDays($days * 2)
            : now()->subDays($days);
    }

    /**
     * Calculate percentage change
     */
    protected function calculateChange(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
