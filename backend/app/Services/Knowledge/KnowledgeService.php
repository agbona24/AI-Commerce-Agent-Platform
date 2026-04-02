<?php

namespace App\Services\Knowledge;

use App\Models\KnowledgeBase;
use App\Jobs\ProcessKnowledgeBase;
use Illuminate\Support\Facades\Http;

class KnowledgeService
{
    /**
     * Process text content into chunks and embeddings
     */
    public function processContent(KnowledgeBase $knowledgeBase): void
    {
        $knowledgeBase->update(['embeddings_status' => 'processing']);

        // Dispatch job for async processing
        ProcessKnowledgeBase::dispatch($knowledgeBase);
    }

    /**
     * Process uploaded file
     */
    public function processFile(KnowledgeBase $knowledgeBase): void
    {
        $knowledgeBase->update(['embeddings_status' => 'processing']);

        // Dispatch job for async processing
        ProcessKnowledgeBase::dispatch($knowledgeBase);
    }

    /**
     * Fetch content from URL
     */
    public function fetchUrlContent(string $url): string
    {
        $response = Http::get($url);
        
        if (!$response->successful()) {
            throw new \Exception('Failed to fetch URL content');
        }

        // Extract text from HTML
        $html = $response->body();
        $text = strip_tags($html);
        $text = preg_replace('/\s+/', ' ', $text);
        
        return trim($text);
    }

    /**
     * Chunk content for embeddings
     */
    public function chunkContent(string $content, int $chunkSize = 1000, int $overlap = 200): array
    {
        $chunks = [];
        $words = explode(' ', $content);
        $currentChunk = [];
        $currentLength = 0;

        foreach ($words as $word) {
            $wordLength = strlen($word) + 1;
            
            if ($currentLength + $wordLength > $chunkSize && !empty($currentChunk)) {
                $chunks[] = implode(' ', $currentChunk);
                
                // Keep overlap
                $overlapWords = array_slice($currentChunk, -($overlap / 10));
                $currentChunk = $overlapWords;
                $currentLength = strlen(implode(' ', $currentChunk));
            }
            
            $currentChunk[] = $word;
            $currentLength += $wordLength;
        }

        if (!empty($currentChunk)) {
            $chunks[] = implode(' ', $currentChunk);
        }

        return $chunks;
    }

    /**
     * Generate embeddings for chunks
     */
    public function generateEmbeddings(array $chunks): array
    {
        // TODO: Integrate with OpenAI embeddings API
        // For now, return placeholder
        return array_map(fn($chunk) => [
            'text' => $chunk,
            'embedding' => [], // Would be actual embedding vector
        ], $chunks);
    }

    /**
     * Search knowledge bases using semantic search
     */
    public function search(string $query, ?array $knowledgeBaseIds = null, int $limit = 5): array
    {
        // Get query embedding
        // TODO: Get actual embedding from OpenAI
        $queryEmbedding = [];

        // Search in knowledge bases
        $knowledgeBases = KnowledgeBase::query()
            ->where('tenant_id', auth()->user()->tenant_id)
            ->where('is_active', true)
            ->where('embeddings_status', 'completed')
            ->when($knowledgeBaseIds, fn($q) => $q->whereIn('id', $knowledgeBaseIds))
            ->get();

        $results = [];

        foreach ($knowledgeBases as $kb) {
            $chunks = $kb->chunks ?? [];
            
            foreach ($chunks as $chunk) {
                // TODO: Calculate cosine similarity with embeddings
                // For now, use simple text matching
                if (stripos($chunk['text'] ?? $chunk, $query) !== false) {
                    $results[] = [
                        'knowledge_base_id' => $kb->id,
                        'knowledge_base_name' => $kb->name,
                        'content' => $chunk['text'] ?? $chunk,
                        'score' => 0.9,
                    ];
                }
            }
        }

        // Sort by score and limit
        usort($results, fn($a, $b) => $b['score'] <=> $a['score']);
        
        return array_slice($results, 0, $limit);
    }
}
