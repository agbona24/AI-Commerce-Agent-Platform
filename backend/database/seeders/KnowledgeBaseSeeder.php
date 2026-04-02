<?php

namespace Database\Seeders;

use App\Models\KnowledgeBase;
use App\Models\Agent;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class KnowledgeBaseSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();
        $salesAgent = Agent::where('name', 'Sales Assistant')->first();
        $supportAgent = Agent::where('name', 'Customer Support')->first();

        $productKb = KnowledgeBase::create([
            'tenant_id' => $tenant->id,
            'name' => 'Product Catalog',
            'description' => 'Information about all our products, specifications, and pricing.',
            'type' => 'text',
            'content' => "# Product Information\n\n## iPhone 15 Pro\n- Price: \$999\n- Storage: 256GB\n- Display: 6.1-inch Super Retina XDR\n- Chip: A17 Pro\n- Features: Titanium design, Action button, USB-C\n\n## Samsung Galaxy S24 Ultra\n- Price: \$1199\n- Storage: 512GB\n- Features: S Pen, AI features, 200MP camera\n\n## MacBook Pro 14\"\n- Price: \$1999\n- Chip: M3 Pro\n- RAM: 18GB\n- Storage: 512GB SSD",
            'embeddings_status' => 'completed',
            'is_active' => true,
            'last_synced_at' => now(),
            'chunks' => [
                ['text' => 'iPhone 15 Pro costs $999 with 256GB storage, A17 Pro chip, 6.1-inch Super Retina XDR display, titanium design.'],
                ['text' => 'Samsung Galaxy S24 Ultra costs $1199 with 512GB storage, S Pen, AI features, 200MP camera.'],
                ['text' => 'MacBook Pro 14" costs $1999 with M3 Pro chip, 18GB RAM, 512GB SSD.'],
            ],
        ]);

        $policyKb = KnowledgeBase::create([
            'tenant_id' => $tenant->id,
            'name' => 'Company Policies',
            'description' => 'Return policy, shipping information, and warranty details.',
            'type' => 'text',
            'content' => "# Company Policies\n\n## Return Policy\n- 30-day return window\n- Items must be unused and in original packaging\n- Free returns on orders over \$50\n- Refunds processed within 5-7 business days\n\n## Shipping\n- Free shipping on orders over \$100\n- Standard shipping: 5-7 business days\n- Express shipping: 2-3 business days\n- Same-day delivery available in select areas\n\n## Warranty\n- 1-year manufacturer warranty on all electronics\n- Extended warranty available for purchase\n- Warranty covers manufacturing defects only",
            'embeddings_status' => 'completed',
            'is_active' => true,
            'last_synced_at' => now(),
            'chunks' => [
                ['text' => 'Return policy: 30-day return window, items must be unused and in original packaging, free returns on orders over $50, refunds processed within 5-7 business days.'],
                ['text' => 'Shipping: Free shipping on orders over $100, standard shipping 5-7 business days, express shipping 2-3 business days.'],
                ['text' => 'Warranty: 1-year manufacturer warranty on all electronics, extended warranty available, covers manufacturing defects only.'],
            ],
        ]);

        $faqKb = KnowledgeBase::create([
            'tenant_id' => $tenant->id,
            'name' => 'FAQ',
            'description' => 'Frequently asked questions and answers.',
            'type' => 'faq',
            'content' => "# Frequently Asked Questions\n\n## How do I track my order?\nYou can track your order by logging into your account and viewing your order history. You'll also receive tracking updates via email.\n\n## What payment methods do you accept?\nWe accept Visa, Mastercard, American Express, PayPal, and Apple Pay.\n\n## How can I contact support?\nYou can reach our support team via live chat, email at support@vivaxai.com, or call us at 1-800-VIVAX-AI.\n\n## Do you offer price matching?\nYes, we offer price matching within 14 days of purchase if you find a lower price at an authorized retailer.",
            'embeddings_status' => 'completed',
            'is_active' => true,
            'last_synced_at' => now(),
        ]);

        // Attach knowledge bases to agents
        if ($salesAgent) {
            $salesAgent->knowledgeBases()->attach([$productKb->id, $policyKb->id]);
        }
        
        if ($supportAgent) {
            $supportAgent->knowledgeBases()->attach([$policyKb->id, $faqKb->id]);
        }
    }
}
