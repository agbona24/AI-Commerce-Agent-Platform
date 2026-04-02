<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('call_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('phone_number_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('conversation_id')->nullable()->constrained()->nullOnDelete();
            
            $table->enum('direction', ['inbound', 'outbound'])->default('inbound');
            $table->string('status', 20)->default('in_progress');
            
            // Caller info
            $table->string('caller_number', 20);
            $table->string('caller_name')->nullable();
            $table->string('caller_city')->nullable();
            $table->string('caller_state')->nullable();
            $table->string('caller_country', 5)->nullable();
            
            // Call metrics
            $table->integer('duration')->default(0); // in seconds
            $table->string('recording_url')->nullable();
            $table->integer('recording_duration')->default(0);
            
            // AI analysis
            $table->json('transcript')->nullable(); // Array of {role, content, timestamp}
            $table->text('summary')->nullable();
            $table->string('sentiment', 20)->nullable(); // positive, negative, neutral
            $table->string('intent')->nullable();
            $table->json('tags')->nullable();
            $table->string('resolution_status', 20)->nullable(); // resolved, pending, escalated
            
            // Provider data
            $table->string('provider_call_id')->nullable();
            $table->json('provider_data')->nullable();
            
            // Timestamps
            $table->timestamp('started_at')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'direction']);
            $table->index(['tenant_id', 'created_at']);
            $table->index(['phone_number_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('call_logs');
    }
};
