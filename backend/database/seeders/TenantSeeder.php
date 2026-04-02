<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        Tenant::create([
            'name' => 'Demo Company',
            'slug' => 'demo-company',
            'logo' => null,
            'primary_color' => '#7C3AED',
            'business_name' => 'Demo Company Inc.',
            'legal_name' => 'Demo Company Inc.',
            'description' => 'AI-powered e-commerce platform',
            'email' => 'hello@democompany.com',
            'phone' => '+1234567890',
            'website' => 'https://democompany.com',
            'industry' => 'E-commerce',
            'company_size' => '11-50',
            'plan' => 'professional',
            'settings' => [
                'ai' => [
                    'default_model' => 'gpt-4',
                    'temperature' => 0.7,
                    'max_tokens' => 1024,
                ],
                'timezone' => 'America/New_York',
            ],
        ]);
    }
}
