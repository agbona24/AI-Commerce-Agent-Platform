<?php

namespace App\Http\Controllers\Api\V1\Voice;

use App\Http\Controllers\Api\V1\BaseController;
use App\Models\CallLog;
use App\Enums\CallStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CallLogController extends BaseController
{
    /**
     * List all call logs for the tenant
     */
    public function index(Request $request): JsonResponse
    {
        $query = CallLog::where('tenant_id', $request->user()->tenant_id)
            ->with(['phoneNumber:id,phone_number,friendly_name', 'agent:id,name,type']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by direction
        if ($request->has('direction') && $request->direction !== 'all') {
            $query->where('direction', $request->direction);
        }

        // Filter by phone number
        if ($request->has('phone_number_id')) {
            $query->where('phone_number_id', $request->phone_number_id);
        }

        // Filter by agent
        if ($request->has('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('started_at', '>=', Carbon::parse($request->start_date)->startOfDay());
        }
        if ($request->has('end_date')) {
            $query->where('started_at', '<=', Carbon::parse($request->end_date)->endOfDay());
        }

        // Filter by sentiment
        if ($request->has('sentiment')) {
            $query->where('sentiment', $request->sentiment);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('caller_number', 'like', "%{$search}%")
                  ->orWhere('caller_name', 'like', "%{$search}%")
                  ->orWhere('summary', 'like', "%{$search}%");
            });
        }

        $callLogs = $query->orderBy('started_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return $this->success($callLogs);
    }

    /**
     * Get call logs summary/stats
     */
    public function stats(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;
        $startDate = $request->has('start_date') 
            ? Carbon::parse($request->start_date)->startOfDay() 
            : Carbon::now()->startOfMonth();
        $endDate = $request->has('end_date') 
            ? Carbon::parse($request->end_date)->endOfDay() 
            : Carbon::now()->endOfDay();

        $baseQuery = CallLog::where('tenant_id', $tenantId)
            ->whereBetween('started_at', [$startDate, $endDate]);

        $stats = [
            'total_calls' => (clone $baseQuery)->count(),
            'completed_calls' => (clone $baseQuery)->where('status', 'completed')->count(),
            'missed_calls' => (clone $baseQuery)->where('status', 'no_answer')->count(),
            'failed_calls' => (clone $baseQuery)->where('status', 'failed')->count(),
            'inbound_calls' => (clone $baseQuery)->where('direction', 'inbound')->count(),
            'outbound_calls' => (clone $baseQuery)->where('direction', 'outbound')->count(),
            'average_duration' => round((clone $baseQuery)->avg('duration') ?? 0),
            'total_duration' => (clone $baseQuery)->sum('duration'),
            'sentiment_breakdown' => [
                'positive' => (clone $baseQuery)->where('sentiment', 'positive')->count(),
                'neutral' => (clone $baseQuery)->where('sentiment', 'neutral')->count(),
                'negative' => (clone $baseQuery)->where('sentiment', 'negative')->count(),
            ],
            'resolution_breakdown' => [
                'resolved' => (clone $baseQuery)->where('resolution_status', 'resolved')->count(),
                'escalated' => (clone $baseQuery)->where('resolution_status', 'escalated')->count(),
                'pending' => (clone $baseQuery)->where('resolution_status', 'pending')->count(),
            ],
        ];

        // Calculate trends (compare to previous period)
        $periodDays = $startDate->diffInDays($endDate) + 1;
        $previousStart = $startDate->copy()->subDays($periodDays);
        $previousEnd = $startDate->copy()->subDay();

        $previousQuery = CallLog::where('tenant_id', $tenantId)
            ->whereBetween('started_at', [$previousStart, $previousEnd]);

        $previousTotal = $previousQuery->count();
        $stats['trend'] = [
            'total' => $this->calculateTrend($stats['total_calls'], $previousTotal),
            'previous_total' => $previousTotal,
        ];

        return $this->success($stats);
    }

    /**
     * Show a specific call log with full details
     */
    public function show(Request $request, CallLog $callLog): JsonResponse
    {
        if ($callLog->tenant_id !== $request->user()->tenant_id) {
            return $this->notFound();
        }

        $callLog->load([
            'phoneNumber:id,phone_number,friendly_name',
            'agent:id,name,type',
            'conversation',
        ]);

        return $this->success($callLog);
    }

    /**
     * Get transcript for a call
     */
    public function transcript(Request $request, CallLog $callLog): JsonResponse
    {
        if ($callLog->tenant_id !== $request->user()->tenant_id) {
            return $this->notFound();
        }

        return $this->success([
            'call_id' => $callLog->id,
            'transcript' => $callLog->transcript ?? [],
            'summary' => $callLog->summary,
            'sentiment' => $callLog->sentiment,
            'tags' => $callLog->tags ?? [],
        ]);
    }

    /**
     * Update call log (add notes, tags, etc.)
     */
    public function update(Request $request, CallLog $callLog): JsonResponse
    {
        if ($callLog->tenant_id !== $request->user()->tenant_id) {
            return $this->notFound();
        }

        $request->validate([
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'notes' => 'nullable|string',
            'resolution_status' => 'nullable|in:resolved,escalated,pending,follow_up',
        ]);

        $updateData = [];

        if ($request->has('tags')) {
            $updateData['tags'] = $request->tags;
        }

        if ($request->has('resolution_status')) {
            $updateData['resolution_status'] = $request->resolution_status;
        }

        // Store notes in provider_data (or create a separate notes field)
        if ($request->has('notes')) {
            $providerData = $callLog->provider_data ?? [];
            $providerData['internal_notes'] = $request->notes;
            $updateData['provider_data'] = $providerData;
        }

        $callLog->update($updateData);

        return $this->success($callLog);
    }

    /**
     * Delete a call log
     */
    public function destroy(Request $request, CallLog $callLog): JsonResponse
    {
        if ($callLog->tenant_id !== $request->user()->tenant_id) {
            return $this->notFound();
        }

        $callLog->delete();

        return $this->success(null, 'Call log deleted successfully');
    }

    /**
     * Export call logs
     */
    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'format' => 'required|in:csv,json',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $query = CallLog::where('tenant_id', $request->user()->tenant_id)
            ->with(['phoneNumber:id,phone_number,friendly_name', 'agent:id,name']);

        if ($request->has('start_date')) {
            $query->where('started_at', '>=', Carbon::parse($request->start_date)->startOfDay());
        }
        if ($request->has('end_date')) {
            $query->where('started_at', '<=', Carbon::parse($request->end_date)->endOfDay());
        }

        $callLogs = $query->orderBy('started_at', 'desc')->get();

        // In production, this would generate and return a downloadable file
        // For now, return the data directly
        $exportData = $callLogs->map(function ($log) {
            return [
                'id' => $log->id,
                'date' => $log->started_at?->format('Y-m-d H:i:s'),
                'direction' => $log->direction,
                'status' => $log->status->value ?? $log->status,
                'caller_number' => $log->caller_number,
                'caller_name' => $log->caller_name,
                'phone_number' => $log->phoneNumber?->phone_number,
                'agent' => $log->agent?->name,
                'duration' => $log->duration,
                'sentiment' => $log->sentiment,
                'resolution' => $log->resolution_status,
                'summary' => $log->summary,
            ];
        });

        return $this->success([
            'format' => $request->format,
            'count' => $exportData->count(),
            'data' => $exportData,
        ]);
    }

    /**
     * Get call recording URL
     */
    public function recording(Request $request, CallLog $callLog): JsonResponse
    {
        if ($callLog->tenant_id !== $request->user()->tenant_id) {
            return $this->notFound();
        }

        if (!$callLog->recording_url) {
            return $this->error('No recording available for this call', 404);
        }

        // In production, this might generate a signed URL for secure access
        return $this->success([
            'recording_url' => $callLog->recording_url,
            'duration' => $callLog->recording_duration,
        ]);
    }

    /**
     * Calculate percentage trend
     */
    private function calculateTrend(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
