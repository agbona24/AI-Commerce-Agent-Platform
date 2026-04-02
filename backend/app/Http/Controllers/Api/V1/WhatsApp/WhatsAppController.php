<?php

namespace App\Http\Controllers\Api\V1\WhatsApp;

use App\Http\Controllers\Api\V1\BaseController;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WhatsAppController extends BaseController
{
    public function __construct(
        protected WhatsAppService $whatsAppService
    ) {}

    /**
     * Verify webhook (GET request from Meta)
     */
    public function verify(Request $request): Response
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode === 'subscribe' && $token === config('services.whatsapp.verify_token')) {
            return response($challenge, 200);
        }

        return response('Forbidden', 403);
    }

    /**
     * Handle webhook (POST request from Meta)
     */
    public function webhook(Request $request): JsonResponse
    {
        $this->whatsAppService->handleWebhook($request->all());

        return $this->success(null);
    }

    /**
     * Send message
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string|max:4096',
        ]);

        $result = $this->whatsAppService->sendMessage($request->to, $request->message);

        return $this->success($result);
    }

    /**
     * Send template message
     */
    public function sendTemplate(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'template_name' => 'required|string',
            'components' => 'nullable|array',
            'language' => 'nullable|string',
        ]);

        $result = $this->whatsAppService->sendTemplate(
            $request->to,
            $request->template_name,
            $request->components ?? [],
            $request->language ?? 'en'
        );

        return $this->success($result);
    }

    /**
     * Get message templates
     */
    public function templates(): JsonResponse
    {
        $templates = $this->whatsAppService->getTemplates();

        return $this->success($templates);
    }

    /**
     * Send interactive buttons
     */
    public function sendButtons(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'body' => 'required|string',
            'buttons' => 'required|array|max:3',
            'buttons.*.title' => 'required|string|max:20',
            'header' => 'nullable|string',
        ]);

        $result = $this->whatsAppService->sendButtons(
            $request->to,
            $request->body,
            $request->buttons,
            $request->header
        );

        return $this->success($result);
    }

    /**
     * Get connection status
     */
    public function status(): JsonResponse
    {
        // TODO: Check actual connection status
        return $this->success([
            'connected' => true,
            'phone_number' => config('services.whatsapp.phone_number'),
            'quality_rating' => 'GREEN',
        ]);
    }
}
