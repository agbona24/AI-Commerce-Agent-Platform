<?php

namespace App\Jobs;

use App\Models\KnowledgeBase;
use App\Services\Knowledge\KnowledgeService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ProcessKnowledgeBase implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected KnowledgeBase $knowledgeBase
    ) {}

    public function handle(KnowledgeService $knowledgeService): void
    {
        try {
            $content = '';

            // Get content based on type
            switch ($this->knowledgeBase->type) {
                case 'text':
                    $content = $this->knowledgeBase->content;
                    break;
                    
                case 'url':
                    $content = $knowledgeService->fetchUrlContent($this->knowledgeBase->source_url);
                    $this->knowledgeBase->update(['content' => $content]);
                    break;
                    
                case 'file':
                    $content = $this->extractFileContent();
                    $this->knowledgeBase->update(['content' => $content]);
                    break;
            }

            // Chunk content
            $chunks = $knowledgeService->chunkContent($content);

            // Generate embeddings
            $chunksWithEmbeddings = $knowledgeService->generateEmbeddings($chunks);

            // Save chunks and mark as completed
            $this->knowledgeBase->update([
                'chunks' => $chunksWithEmbeddings,
                'embeddings_status' => 'completed',
                'last_synced_at' => now(),
            ]);

        } catch (\Exception $e) {
            $this->knowledgeBase->update([
                'embeddings_status' => 'failed',
                'metadata' => array_merge($this->knowledgeBase->metadata ?? [], [
                    'error' => $e->getMessage(),
                ]),
            ]);
        }
    }

    protected function extractFileContent(): string
    {
        $path = $this->knowledgeBase->file_path;
        $extension = $this->knowledgeBase->file_type;

        if (!Storage::disk('local')->exists($path)) {
            throw new \Exception('File not found');
        }

        $content = Storage::disk('local')->get($path);

        // For text files, return directly
        if (in_array($extension, ['txt', 'md'])) {
            return $content;
        }

        // TODO: Implement PDF and DOC extraction
        // For now, return placeholder
        return $content;
    }
}
