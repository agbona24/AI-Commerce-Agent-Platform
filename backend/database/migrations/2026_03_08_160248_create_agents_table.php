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
        Schema::create('agents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('avatar')->nullable();
            $table->enum('type', ['sales', 'support', 'booking', 'lead_qualification', 'custom'])->default('sales');
            $table->enum('status', ['active', 'inactive', 'draft', 'training', 'paused'])->default('draft');
            $table->text('system_prompt')->nullable();
            $table->text('welcome_message')->nullable();
            $table->text('fallback_message')->nullable();
            $table->string('language')->default('en');
            $table->json('channels')->nullable();
            $table->string('voice_id')->nullable();
            $table->json('voice_settings')->nullable();
            $table->json('workflow')->nullable();
            $table->json('triggers')->nullable();
            $table->json('capabilities')->nullable();
            $table->string('model')->default('gpt-4');
            $table->float('temperature')->default(0.7);
            $table->integer('max_tokens')->default(1024);
            $table->json('settings')->nullable();
            $table->boolean('is_default')->default(false);
            $table->integer('conversations_count')->default(0);
            $table->float('avg_rating')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
