<?php

namespace App\Http\Controllers\Api\V1\Agents;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Agent\CreateAgentRequest;
use App\Http\Requests\Agent\UpdateAgentRequest;
use App\Http\Resources\AgentResource;
use App\Models\Agent;
use App\Services\AI\AgentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentController extends BaseController
{
    public function __construct(
        protected AgentService $agentService
    ) {}

    /**
     * List all agents
     */
    public function index(Request $request): JsonResponse
    {
        $agents = Agent::query()
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->when($request->search, fn($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return $this->paginated($agents);
    }

    /**
     * Get a single agent
     */
    public function show(Agent $agent): JsonResponse
    {
        return $this->success(new AgentResource($agent->load(['knowledgeBases', 'products'])));
    }

    /**
     * Create a new agent
     */
    public function store(CreateAgentRequest $request): JsonResponse
    {
        $agent = $this->agentService->create($request->validated());

        return $this->created(
            new AgentResource($agent),
            'Agent created successfully'
        );
    }

    /**
     * Update an agent
     */
    public function update(UpdateAgentRequest $request, Agent $agent): JsonResponse
    {
        $agent = $this->agentService->update($agent, $request->validated());

        return $this->success(
            new AgentResource($agent),
            'Agent updated successfully'
        );
    }

    /**
     * Delete an agent
     */
    public function destroy(Agent $agent): JsonResponse
    {
        $agent->delete();

        return $this->success(null, 'Agent deleted successfully');
    }

    /**
     * Duplicate an agent
     */
    public function duplicate(Agent $agent): JsonResponse
    {
        $newAgent = $this->agentService->duplicate($agent);

        return $this->created(
            new AgentResource($newAgent),
            'Agent duplicated successfully'
        );
    }

    /**
     * Update agent status
     */
    public function updateStatus(Request $request, Agent $agent): JsonResponse
    {
        $request->validate(['status' => 'required|in:active,inactive,draft,training']);
        
        $agent->update(['status' => $request->status]);

        return $this->success(
            new AgentResource($agent),
            'Agent status updated'
        );
    }

    /**
     * Get agent analytics
     */
    public function analytics(Agent $agent): JsonResponse
    {
        $analytics = $this->agentService->getAnalytics($agent);

        return $this->success($analytics);
    }

    /**
     * Test agent with a message
     */
    public function test(Request $request, Agent $agent): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $response = $this->agentService->testMessage($agent, $request->message);

        return $this->success($response);
    }
}
