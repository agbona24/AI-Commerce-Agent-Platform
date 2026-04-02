<?php

namespace App\Http\Controllers\Api\V1\Voice;

use App\Http\Controllers\Api\V1\BaseController;
use App\Services\Voice\VoiceService;
use App\Services\Voice\TwilioVoiceService;
use App\Models\Agent;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class VoiceController extends BaseController
{
    public function __construct(
        protected VoiceService $voiceService,
        protected TwilioVoiceService $twilioService
    ) {}

    /**
     * Handle incoming call webhook (Twilio)
     */
    public function incoming(Request $request): Response
    {
        $twiml = $this->twilioService->handleIncomingCall($request->all());
        
        return response($twiml, 200)
            ->header('Content-Type', 'application/xml');
    }
    
    /**
     * Handle speech gather result (Twilio)
     */
    public function gather(Request $request, int $conversationId): Response
    {
        $twiml = $this->twilioService->handleGather($conversationId, $request->all());
        
        return response($twiml, 200)
            ->header('Content-Type', 'application/xml');
    }
    
    /**
     * Handle outbound call connection (Twilio)
     */
    public function outbound(Request $request, int $conversationId): Response
    {
        $conversation = Conversation::with('agent')->findOrFail($conversationId);
        $agent = $conversation->agent;
        
        // Generate welcome TwiML for outbound call
        $welcomeMessage = $agent->welcome_message 
            ?? "Hello! This is an automated call from our system. How can I help you?";
            
        $voiceSettings = $agent->voice_settings ?? [];
        $voice = $voiceSettings['twilio_voice'] ?? 'Polly.Joanna';
        $language = $voiceSettings['language'] ?? 'en-US';
        $speechLanguage = $voiceSettings['speech_language'] ?? 'en-US';
        $gatherUrl = url("/api/v1/webhooks/voice/gather/{$conversationId}");
        
        // Generate TwiML as raw XML
        $twiml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $twiml .= '<Response>' . "\n";
        $twiml .= '<Say voice="' . htmlspecialchars($voice, ENT_XML1) . '" language="' . htmlspecialchars($language, ENT_XML1) . '">';
        $twiml .= htmlspecialchars($welcomeMessage, ENT_XML1);
        $twiml .= '</Say>' . "\n";
        $twiml .= '<Gather input="speech" action="' . htmlspecialchars($gatherUrl, ENT_XML1) . '" method="POST" ';
        $twiml .= 'speechTimeout="auto" language="' . htmlspecialchars($speechLanguage, ENT_XML1) . '" ';
        $twiml .= 'speechModel="phone_call" enhanced="true">';
        $twiml .= '</Gather>' . "\n";
        $twiml .= '</Response>';
        
        return response($twiml, 200)
            ->header('Content-Type', 'application/xml');
    }

    /**
     * Call status webhook
     */
    public function status(Request $request): Response
    {
        $this->twilioService->handleStatusCallback($request->all());
        
        return response('OK', 200);
    }

    /**
     * Process speech transcription
     */
    public function transcription(Request $request): JsonResponse
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'transcription' => 'required|string',
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);
        $result = $this->voiceService->processTranscription($conversation, $request->transcription);

        return $this->success($result);
    }

    /**
     * Text to speech
     */
    public function textToSpeech(Request $request): JsonResponse
    {
        $request->validate([
            'text' => 'required|string|max:5000',
            'voice_id' => 'nullable|string',
            'speed' => 'nullable|numeric|min:0.5|max:2',
            'stability' => 'nullable|numeric|min:0|max:1',
        ]);

        $result = $this->voiceService->textToSpeech(
            $request->text,
            $request->only(['voice_id', 'speed', 'stability'])
        );

        return $this->success($result);
    }

    /**
     * Get available voices
     */
    public function voices(): JsonResponse
    {
        $voices = [
            // OpenAI Voices
            'openai' => [
                'name' => 'OpenAI',
                'description' => 'Natural, conversational voices powered by GPT',
                'badge' => 'Recommended',
                'voices' => [
                    ['id' => 'alloy', 'name' => 'Alloy', 'gender' => 'neutral', 'description' => 'Neutral and balanced, versatile for any use case', 'accent' => 'American', 'style' => 'Natural', 'tags' => ['versatile', 'professional']],
                    ['id' => 'echo', 'name' => 'Echo', 'gender' => 'male', 'description' => 'Friendly and approachable male voice', 'accent' => 'American', 'style' => 'Conversational', 'tags' => ['friendly', 'warm']],
                    ['id' => 'fable', 'name' => 'Fable', 'gender' => 'male', 'description' => 'Expressive British voice with character', 'accent' => 'British', 'style' => 'Expressive', 'tags' => ['storytelling', 'engaging']],
                    ['id' => 'onyx', 'name' => 'Onyx', 'gender' => 'male', 'description' => 'Deep and authoritative male voice', 'accent' => 'American', 'style' => 'Authoritative', 'tags' => ['professional', 'deep']],
                    ['id' => 'nova', 'name' => 'Nova', 'gender' => 'female', 'description' => 'Warm and engaging female voice', 'accent' => 'American', 'style' => 'Warm', 'tags' => ['friendly', 'engaging']],
                    ['id' => 'shimmer', 'name' => 'Shimmer', 'gender' => 'female', 'description' => 'Clear and professional female voice', 'accent' => 'American', 'style' => 'Professional', 'tags' => ['clear', 'professional']],
                ],
            ],
            // ElevenLabs Voices
            'elevenlabs' => [
                'name' => 'ElevenLabs',
                'description' => 'Ultra-realistic AI voices with emotion control',
                'badge' => 'Premium',
                'voices' => [
                    ['id' => 'rachel', 'name' => 'Rachel', 'gender' => 'female', 'description' => 'American female, calm and professional', 'accent' => 'American', 'style' => 'Professional', 'tags' => ['calm', 'business']],
                    ['id' => 'drew', 'name' => 'Drew', 'gender' => 'male', 'description' => 'American male, friendly and articulate', 'accent' => 'American', 'style' => 'Friendly', 'tags' => ['articulate', 'clear']],
                    ['id' => 'clyde', 'name' => 'Clyde', 'gender' => 'male', 'description' => 'American male, friendly and casual', 'accent' => 'American', 'style' => 'Casual', 'tags' => ['casual', 'relatable']],
                    ['id' => 'paul', 'name' => 'Paul', 'gender' => 'male', 'description' => 'American male, warm and conversational', 'accent' => 'American', 'style' => 'Warm', 'tags' => ['conversational', 'warm']],
                    ['id' => 'domi', 'name' => 'Domi', 'gender' => 'female', 'description' => 'American female, strong and confident', 'accent' => 'American', 'style' => 'Confident', 'tags' => ['strong', 'empowering']],
                    ['id' => 'bella', 'name' => 'Bella', 'gender' => 'female', 'description' => 'American female, soft and gentle', 'accent' => 'American', 'style' => 'Gentle', 'tags' => ['soft', 'soothing']],
                    ['id' => 'antoni', 'name' => 'Antoni', 'gender' => 'male', 'description' => 'American male, well-rounded and calm', 'accent' => 'American', 'style' => 'Calm', 'tags' => ['balanced', 'professional']],
                    ['id' => 'elli', 'name' => 'Elli', 'gender' => 'female', 'description' => 'American female, young and cheerful', 'accent' => 'American', 'style' => 'Cheerful', 'tags' => ['young', 'energetic']],
                    ['id' => 'josh', 'name' => 'Josh', 'gender' => 'male', 'description' => 'American male, young and dynamic', 'accent' => 'American', 'style' => 'Dynamic', 'tags' => ['young', 'engaging']],
                    ['id' => 'arnold', 'name' => 'Arnold', 'gender' => 'male', 'description' => 'American male, crisp and formal', 'accent' => 'American', 'style' => 'Formal', 'tags' => ['crisp', 'professional']],
                    ['id' => 'charlotte', 'name' => 'Charlotte', 'gender' => 'female', 'description' => 'British female, warm and sophisticated', 'accent' => 'British', 'style' => 'Sophisticated', 'tags' => ['elegant', 'warm']],
                    ['id' => 'matilda', 'name' => 'Matilda', 'gender' => 'female', 'description' => 'American female, warm and conversational', 'accent' => 'American', 'style' => 'Conversational', 'tags' => ['warm', 'friendly']],
                ],
            ],
            // Amazon Polly Voices
            'amazon' => [
                'name' => 'Amazon Polly',
                'description' => 'AWS-powered neural text-to-speech',
                'voices' => [
                    ['id' => 'Joanna', 'name' => 'Joanna', 'gender' => 'female', 'description' => 'US English female, standard voice', 'accent' => 'American', 'style' => 'Standard', 'tags' => ['clear', 'professional']],
                    ['id' => 'Joanna-Neural', 'name' => 'Joanna Neural', 'gender' => 'female', 'description' => 'US English female, neural voice', 'accent' => 'American', 'style' => 'Neural', 'tags' => ['natural', 'premium'], 'neural' => true],
                    ['id' => 'Matthew', 'name' => 'Matthew', 'gender' => 'male', 'description' => 'US English male, standard voice', 'accent' => 'American', 'style' => 'Standard', 'tags' => ['professional', 'clear']],
                    ['id' => 'Matthew-Neural', 'name' => 'Matthew Neural', 'gender' => 'male', 'description' => 'US English male, neural voice', 'accent' => 'American', 'style' => 'Neural', 'tags' => ['natural', 'premium'], 'neural' => true],
                    ['id' => 'Amy', 'name' => 'Amy', 'gender' => 'female', 'description' => 'British English female voice', 'accent' => 'British', 'style' => 'Professional', 'tags' => ['british', 'clear']],
                    ['id' => 'Brian', 'name' => 'Brian', 'gender' => 'male', 'description' => 'British English male voice', 'accent' => 'British', 'style' => 'Professional', 'tags' => ['british', 'authoritative']],
                    ['id' => 'Salli', 'name' => 'Salli', 'gender' => 'female', 'description' => 'US English female, warm voice', 'accent' => 'American', 'style' => 'Warm', 'tags' => ['friendly', 'warm']],
                    ['id' => 'Joey', 'name' => 'Joey', 'gender' => 'male', 'description' => 'US English male, young voice', 'accent' => 'American', 'style' => 'Young', 'tags' => ['casual', 'friendly']],
                    ['id' => 'Kendra', 'name' => 'Kendra', 'gender' => 'female', 'description' => 'US English female, professional', 'accent' => 'American', 'style' => 'Professional', 'tags' => ['business', 'clear']],
                    ['id' => 'Kimberly', 'name' => 'Kimberly', 'gender' => 'female', 'description' => 'US English female, expressive', 'accent' => 'American', 'style' => 'Expressive', 'tags' => ['engaging', 'dynamic']],
                    ['id' => 'Ivy', 'name' => 'Ivy', 'gender' => 'female', 'description' => 'US English female, young voice', 'accent' => 'American', 'style' => 'Young', 'tags' => ['youthful', 'bright']],
                    ['id' => 'Justin', 'name' => 'Justin', 'gender' => 'male', 'description' => 'US English male, child voice', 'accent' => 'American', 'style' => 'Child', 'tags' => ['young', 'friendly']],
                ],
            ],
            // Google Cloud TTS
            'google' => [
                'name' => 'Google Cloud TTS',
                'description' => 'Google\'s WaveNet and Neural2 voices',
                'voices' => [
                    ['id' => 'en-US-Neural2-A', 'name' => 'Neural2-A', 'gender' => 'male', 'description' => 'US English male, neural voice', 'accent' => 'American', 'style' => 'Neural', 'tags' => ['natural', 'clear'], 'neural' => true],
                    ['id' => 'en-US-Neural2-C', 'name' => 'Neural2-C', 'gender' => 'female', 'description' => 'US English female, neural voice', 'accent' => 'American', 'style' => 'Neural', 'tags' => ['natural', 'professional'], 'neural' => true],
                    ['id' => 'en-US-Neural2-D', 'name' => 'Neural2-D', 'gender' => 'male', 'description' => 'US English male, deeper voice', 'accent' => 'American', 'style' => 'Deep', 'tags' => ['authoritative', 'formal'], 'neural' => true],
                    ['id' => 'en-US-Neural2-E', 'name' => 'Neural2-E', 'gender' => 'female', 'description' => 'US English female, friendly voice', 'accent' => 'American', 'style' => 'Friendly', 'tags' => ['warm', 'approachable'], 'neural' => true],
                    ['id' => 'en-US-Neural2-F', 'name' => 'Neural2-F', 'gender' => 'female', 'description' => 'US English female, professional', 'accent' => 'American', 'style' => 'Professional', 'tags' => ['clear', 'business'], 'neural' => true],
                    ['id' => 'en-GB-Neural2-A', 'name' => 'GB Neural2-A', 'gender' => 'female', 'description' => 'British English female', 'accent' => 'British', 'style' => 'Professional', 'tags' => ['british', 'elegant'], 'neural' => true],
                    ['id' => 'en-GB-Neural2-B', 'name' => 'GB Neural2-B', 'gender' => 'male', 'description' => 'British English male', 'accent' => 'British', 'style' => 'Professional', 'tags' => ['british', 'authoritative'], 'neural' => true],
                    ['id' => 'en-AU-Neural2-A', 'name' => 'AU Neural2-A', 'gender' => 'female', 'description' => 'Australian English female', 'accent' => 'Australian', 'style' => 'Friendly', 'tags' => ['australian', 'warm'], 'neural' => true],
                    ['id' => 'en-AU-Neural2-B', 'name' => 'AU Neural2-B', 'gender' => 'male', 'description' => 'Australian English male', 'accent' => 'Australian', 'style' => 'Casual', 'tags' => ['australian', 'relaxed'], 'neural' => true],
                ],
            ],
            // Azure Neural TTS
            'azure' => [
                'name' => 'Azure Neural TTS',
                'description' => 'Microsoft\'s neural text-to-speech',
                'voices' => [
                    ['id' => 'en-US-JennyNeural', 'name' => 'Jenny', 'gender' => 'female', 'description' => 'US English female, versatile', 'accent' => 'American', 'style' => 'Versatile', 'tags' => ['natural', 'expressive'], 'neural' => true],
                    ['id' => 'en-US-GuyNeural', 'name' => 'Guy', 'gender' => 'male', 'description' => 'US English male, newscast style', 'accent' => 'American', 'style' => 'Newscast', 'tags' => ['professional', 'clear'], 'neural' => true],
                    ['id' => 'en-US-AriaNeural', 'name' => 'Aria', 'gender' => 'female', 'description' => 'US English female, chat style', 'accent' => 'American', 'style' => 'Chat', 'tags' => ['friendly', 'conversational'], 'neural' => true],
                    ['id' => 'en-US-DavisNeural', 'name' => 'Davis', 'gender' => 'male', 'description' => 'US English male, casual', 'accent' => 'American', 'style' => 'Casual', 'tags' => ['relaxed', 'friendly'], 'neural' => true],
                    ['id' => 'en-US-SaraNeural', 'name' => 'Sara', 'gender' => 'female', 'description' => 'US English female, warm', 'accent' => 'American', 'style' => 'Warm', 'tags' => ['kind', 'supportive'], 'neural' => true],
                    ['id' => 'en-GB-SoniaNeural', 'name' => 'Sonia', 'gender' => 'female', 'description' => 'British English female', 'accent' => 'British', 'style' => 'Professional', 'tags' => ['british', 'sophisticated'], 'neural' => true],
                    ['id' => 'en-GB-RyanNeural', 'name' => 'Ryan', 'gender' => 'male', 'description' => 'British English male', 'accent' => 'British', 'style' => 'Professional', 'tags' => ['british', 'authoritative'], 'neural' => true],
                ],
            ],
        ];

        return $this->success($voices);
    }

    /**
     * Initiate outbound call
     */
    public function call(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'agent_id' => 'required|exists:agents,id',
        ]);

        $agent = Agent::findOrFail($request->agent_id);
        $tenant = auth()->user()->tenant;
        
        try {
            $result = $this->twilioService->makeOutboundCall($tenant, $request->to, $agent);
            return $this->success($result, 'Call initiated');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * End active call
     */
    public function endCall(Request $request): JsonResponse
    {
        $request->validate([
            'call_id' => 'required|string',
        ]);

        // Find conversation by call SID
        $conversation = Conversation::where('external_id', $request->call_id)->first();
        
        if ($conversation) {
            $conversation->update([
                'status' => 'resolved',
                'ended_at' => now(),
            ]);
        }

        return $this->success(null, 'Call ended');
    }
    
    /**
     * Test Twilio connection
     */
    public function testConnection(Request $request): JsonResponse
    {
        $request->validate([
            'account_sid' => 'required|string',
            'auth_token' => 'required|string',
            'phone_number' => 'nullable|string',
        ]);
        
        $result = $this->twilioService->testConnection($request->only([
            'account_sid',
            'auth_token', 
            'phone_number'
        ]));
        
        if ($result['success']) {
            return $this->success($result, 'Connection successful');
        }
        
        return $this->error($result['error'], 400);
    }
    
    /**
     * Configure Twilio webhooks
     */
    public function configureWebhooks(): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        
        try {
            $result = $this->twilioService->configureWebhooks($tenant);
            return $this->success($result, 'Webhooks configured');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
