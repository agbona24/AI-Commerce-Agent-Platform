<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('knowledge_bases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['text', 'document', 'website', 'faq', 'product', 'api'])->default('text');
            $table->enum('embeddings_status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->string('source_url')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_type')->nullable();
            $table->integer('file_size')->nullable();
            $table->longText('content')->nullable();
            $table->json('chunks')->nullable();
            $table->json('embeddings_metadata')->nullable();
            $table->integer('chunks_count')->default(0);
            $table->timestamp('last_synced_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        // Pivot table for agent-knowledge_base relationship
        Schema::create('agent_knowledge_base', function (Blueprint $table) {
            $table->uuid('agent_id');
            $table->uuid('knowledge_base_id');
            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('cascade');
            $table->foreign('knowledge_base_id')->references('id')->on('knowledge_bases')->onDelete('cascade');
            $table->primary(['agent_id', 'knowledge_base_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_knowledge_base');
        Schema::dropIfExists('knowledge_bases');
    }
};
