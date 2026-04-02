<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phone_numbers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('phone_number', 20)->unique();
            $table->string('friendly_name')->nullable();
            $table->string('provider', 50)->default('twilio'); // twilio, vonage, etc.
            $table->string('provider_id')->nullable(); // Provider's ID for the number
            $table->string('country_code', 5)->default('US');
            $table->string('area_code', 10)->nullable();
            
            $table->string('status', 20)->default('pending');
            $table->json('capabilities')->nullable(); // voice, sms, mms, fax
            $table->decimal('monthly_cost', 8, 2)->nullable();
            $table->json('settings')->nullable();
            $table->string('webhook_url')->nullable();
            
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'agent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phone_numbers');
    }
};
