<?php

namespace App\Http\Controllers\Api\V1\Knowledge;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Resources\KnowledgeBaseResource;
use App\Models\KnowledgeBase;
use App\Services\Knowledge\KnowledgeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KnowledgeBaseController extends BaseController
{
    public function __construct(
        protected KnowledgeService $knowledgeService
    ) {}

    /**
     * List all knowledge bases
     */
    public function index(Request $request): JsonResponse
    {
        $knowledgeBases = KnowledgeBase::query()
            ->when($request->type, fn($q, $type) => $q->where('type', $type))
            ->when($request->active_only, fn($q) => $q->where('is_active', true))
            ->when($request->search, fn($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return $this->paginated($knowledgeBases);
    }

    /**
     * Get a single knowledge base
     */
    public function show(KnowledgeBase $knowledgeBase): JsonResponse
    {
        return $this->success(new KnowledgeBaseResource($knowledgeBase->load('agents')));
    }

    /**
     * Create knowledge base from text
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:text,file,url,faq',
            'content' => 'required_if:type,text|nullable|string',
            'source_url' => 'required_if:type,url|nullable|url',
        ]);

        $data['tenant_id'] = auth()->user()->tenant_id;

        $knowledgeBase = KnowledgeBase::create($data);

        // Process content asynchronously
        if ($data['type'] === 'text' || $data['type'] === 'url') {
            $this->knowledgeService->processContent($knowledgeBase);
        }

        return $this->created(
            new KnowledgeBaseResource($knowledgeBase),
            'Knowledge base created'
        );
    }

    /**
     * Upload file for knowledge base
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'file' => 'required|file|mimes:pdf,doc,docx,txt,md|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('knowledge-bases', 'local');

        $knowledgeBase = KnowledgeBase::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name' => $request->name,
            'description' => $request->description,
            'type' => 'file',
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'embeddings_status' => 'pending',
        ]);

        // Process file asynchronously
        $this->knowledgeService->processFile($knowledgeBase);

        return $this->created(
            new KnowledgeBaseResource($knowledgeBase),
            'File uploaded and processing started'
        );
    }

    /**
     * Update knowledge base
     */
    public function update(Request $request, KnowledgeBase $knowledgeBase): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'content' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $knowledgeBase->update($data);

        // Re-process if content changed
        if (isset($data['content'])) {
            $this->knowledgeService->processContent($knowledgeBase);
        }

        return $this->success(
            new KnowledgeBaseResource($knowledgeBase),
            'Knowledge base updated'
        );
    }

    /**
     * Delete knowledge base
     */
    public function destroy(KnowledgeBase $knowledgeBase): JsonResponse
    {
        // Detach from agents
        $knowledgeBase->agents()->detach();
        
        $knowledgeBase->delete();

        return $this->success(null, 'Knowledge base deleted');
    }

    /**
     * Sync knowledge base (re-process)
     */
    public function sync(KnowledgeBase $knowledgeBase): JsonResponse
    {
        $this->knowledgeService->processContent($knowledgeBase);

        return $this->success(null, 'Sync started');
    }

    /**
     * Search knowledge base
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|max:500',
            'knowledge_base_ids' => 'nullable|array',
            'limit' => 'nullable|integer|max:20',
        ]);

        $results = $this->knowledgeService->search(
            $request->query,
            $request->knowledge_base_ids,
            $request->limit ?? 5
        );

        return $this->success($results);
    }
}
