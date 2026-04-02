<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Tenant;
use App\Enums\AgentStatus;
use App\Enums\AgentType;
use Illuminate\Database\Seeder;

class AgentSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();

        Agent::create([
            'tenant_id' => $tenant->id,
            'name' => 'Sales Assistant',
            'description' => 'AI-powered sales agent that helps customers find products and complete purchases.',
            'type' => AgentType::SALES,
            'status' => AgentStatus::ACTIVE,
            'system_prompt' => "You are a helpful sales assistant for an e-commerce store. Help customers find products, answer questions about pricing and availability, and guide them through the purchase process. Be friendly, professional, and knowledgeable about our products.",
            'welcome_message' => "Hi! 👋 I'm your personal shopping assistant. How can I help you find the perfect product today?",
            'fallback_message' => "I'm not quite sure I understand. Could you rephrase that, or would you like me to connect you with a human agent?",
            'language' => 'en',
            'channels' => ['whatsapp', 'web_widget'],
            'voice_id' => 'nova',
            'voice_settings' => ['speed' => 1.0, 'stability' => 0.75],
            'workflow' => [
                'nodes' => [
                    ['id' => 'start', 'type' => 'start', 'position' => ['x' => 100, 'y' => 100]],
                    ['id' => 'greeting', 'type' => 'message', 'data' => ['message' => 'Welcome!']],
                ],
                'edges' => [
                    ['source' => 'start', 'target' => 'greeting'],
                ],
            ],
            'is_default' => true,
        ]);

        Agent::create([
            'tenant_id' => $tenant->id,
            'name' => 'Customer Support',
            'description' => 'Handles customer inquiries, order status, and support tickets.',
            'type' => AgentType::SUPPORT,
            'status' => AgentStatus::ACTIVE,
            'system_prompt' => "You are a customer support specialist. Help customers with order inquiries, shipping questions, returns, and general support. Be empathetic, patient, and solution-oriented. Always aim to resolve issues on the first contact.",
            'welcome_message' => "Hello! I'm here to help with any questions or issues you might have. What can I assist you with today?",
            'fallback_message' => "I apologize for the confusion. Let me connect you with a human support agent who can better assist you.",
            'language' => 'en',
            'channels' => ['whatsapp', 'web_widget', 'email'],
            'voice_id' => 'alloy',
            'is_default' => false,
        ]);

        Agent::create([
            'tenant_id' => $tenant->id,
            'name' => 'Appointment Booking',
            'description' => 'Schedules appointments and manages calendar bookings.',
            'type' => AgentType::BOOKING,
            'status' => AgentStatus::ACTIVE,
            'system_prompt' => "You are an appointment booking assistant. Help customers schedule appointments, check availability, and manage their bookings. Be efficient and organized.",
            'welcome_message' => "Hi! I can help you schedule an appointment. When would you like to book?",
            'fallback_message' => "I couldn't understand the date/time. Could you please specify when you'd like to book?",
            'language' => 'en',
            'channels' => ['voice', 'whatsapp'],
            'voice_id' => 'echo',
            'is_default' => false,
        ]);

        Agent::create([
            'tenant_id' => $tenant->id,
            'name' => 'Lead Qualifier',
            'description' => 'Qualifies leads and collects customer information.',
            'type' => AgentType::LEAD_QUALIFICATION,
            'status' => AgentStatus::DRAFT,
            'system_prompt' => "You are a lead qualification specialist. Engage with potential customers, understand their needs, and collect relevant information. Ask qualifying questions naturally to determine if they're a good fit for our products.",
            'welcome_message' => "Hi there! Thanks for your interest. I'd love to learn more about what you're looking for.",
            'fallback_message' => "I appreciate your patience. Could you tell me more about your needs?",
            'language' => 'en',
            'channels' => ['web_widget'],
            'is_default' => false,
        ]);

        Agent::create([
            'tenant_id' => $tenant->id,
            'name' => 'Voice Support Agent',
            'description' => 'Handles voice calls for customer support and inquiries.',
            'type' => AgentType::SUPPORT,
            'status' => AgentStatus::ACTIVE,
            'system_prompt' => "You are a voice customer support agent. Handle phone calls professionally and efficiently. Speak clearly and concisely. Help customers with their inquiries and resolve issues.",
            'welcome_message' => "Thank you for calling. How may I assist you today?",
            'fallback_message' => "I apologize, I didn't quite catch that. Could you please repeat?",
            'language' => 'en',
            'channels' => ['voice'],
            'voice_id' => 'onyx',
            'voice_settings' => ['speed' => 0.9, 'stability' => 0.8],
            'is_default' => false,
        ]);
    }
}
