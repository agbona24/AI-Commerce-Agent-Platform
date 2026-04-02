<?php

use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Agents\AgentController;
use App\Http\Controllers\Api\V1\Products\ProductController;
use App\Http\Controllers\Api\V1\Products\CategoryController;
use App\Http\Controllers\Api\V1\Conversations\ConversationController;
use App\Http\Controllers\Api\V1\Voice\VoiceController;
use App\Http\Controllers\Api\V1\Voice\PhoneNumberController;
use App\Http\Controllers\Api\V1\Voice\CallLogController;
use App\Http\Controllers\Api\V1\WhatsApp\WhatsAppController;
use App\Http\Controllers\Api\V1\Settings\SettingsController;
use App\Http\Controllers\Api\V1\Knowledge\KnowledgeBaseController;
use App\Http\Controllers\Api\V1\Analytics\AnalyticsController;
use App\Http\Controllers\Api\V1\Integrations\IntegrationController;
use App\Http\Controllers\Api\V1\Team\TeamController;
use App\Http\Controllers\Api\V1\Billing\BillingController;
use App\Http\Controllers\Api\V1\Files\FileController;
use App\Http\Controllers\Api\V1\Widget\WidgetController;
use App\Http\Controllers\Api\V1\Chat\ChatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// API Version 1
Route::prefix('v1')->group(function () {
    
    // Public routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
    });

    // Webhook routes (no auth required)
    Route::prefix('webhooks')->group(function () {
        Route::get('whatsapp', [WhatsAppController::class, 'verify']);
        Route::post('whatsapp', [WhatsAppController::class, 'webhook']);
        Route::post('voice/incoming', [VoiceController::class, 'incoming']);
        Route::post('voice/gather/{conversationId}', [VoiceController::class, 'gather']);
        Route::post('voice/outbound/{conversationId}', [VoiceController::class, 'outbound']);
        Route::post('voice/status', [VoiceController::class, 'status']);
    });

    // Public widget configuration
    Route::get('widget/{widgetId}/config', [WidgetController::class, 'publicConfig']);

    // Public chat routes (for widget - no auth required)
    Route::prefix('chat')->group(function () {
        Route::post('widget/{widgetId}/start', [ChatController::class, 'publicStartChat']);
        Route::post('session/{sessionId}/message', [ChatController::class, 'publicSendMessage']);
        Route::get('session/{sessionId}', [ChatController::class, 'getBySession']);
    });

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth
        Route::prefix('auth')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('refresh', [AuthController::class, 'refresh']);
        });

        // Agents
        Route::prefix('agents')->group(function () {
            Route::get('/', [AgentController::class, 'index']);
            Route::post('/', [AgentController::class, 'store']);
            Route::get('{agent}', [AgentController::class, 'show']);
            Route::put('{agent}', [AgentController::class, 'update']);
            Route::delete('{agent}', [AgentController::class, 'destroy']);
            Route::post('{agent}/duplicate', [AgentController::class, 'duplicate']);
            Route::patch('{agent}/status', [AgentController::class, 'updateStatus']);
            Route::get('{agent}/analytics', [AgentController::class, 'analytics']);
            Route::post('{agent}/test', [AgentController::class, 'test']);
        });

        // Products
        Route::prefix('products')->group(function () {
            Route::get('/', [ProductController::class, 'index']);
            Route::post('/', [ProductController::class, 'store']);
            Route::get('{product}', [ProductController::class, 'show']);
            Route::put('{product}', [ProductController::class, 'update']);
            Route::delete('{product}', [ProductController::class, 'destroy']);
            Route::post('bulk-update', [ProductController::class, 'bulkUpdate']);
            Route::post('bulk-delete', [ProductController::class, 'bulkDelete']);
            Route::post('import', [ProductController::class, 'import']);
            Route::get('export', [ProductController::class, 'export']);
        });

        // Categories
        Route::prefix('categories')->group(function () {
            Route::get('/', [CategoryController::class, 'index']);
            Route::get('tree', [CategoryController::class, 'tree']);
            Route::post('/', [CategoryController::class, 'store']);
            Route::get('{category}', [CategoryController::class, 'show']);
            Route::put('{category}', [CategoryController::class, 'update']);
            Route::delete('{category}', [CategoryController::class, 'destroy']);
            Route::post('reorder', [CategoryController::class, 'reorder']);
        });

        // Conversations
        Route::prefix('conversations')->group(function () {
            Route::get('/', [ConversationController::class, 'index']);
            Route::get('analytics', [ConversationController::class, 'analytics']);
            Route::get('{conversation}', [ConversationController::class, 'show']);
            Route::put('{conversation}', [ConversationController::class, 'update']);
            Route::patch('{conversation}', [ConversationController::class, 'update']);
            Route::get('{conversation}/messages', [ConversationController::class, 'messages']);
            Route::post('{conversation}/messages', [ConversationController::class, 'sendMessage']);
            Route::post('{conversation}/assign', [ConversationController::class, 'assign']);
            Route::post('{conversation}/close', [ConversationController::class, 'close']);
            Route::post('{conversation}/escalate', [ConversationController::class, 'escalate']);
            Route::post('{conversation}/hand-back', [ConversationController::class, 'handBack']);
        });

        // Chat (AI-powered conversations)
        Route::prefix('chat')->group(function () {
            Route::post('start', [ChatController::class, 'startConversation']);
            Route::post('{conversation}/send', [ChatController::class, 'sendMessage']);
            Route::post('{conversation}/handover', [ChatController::class, 'requestHandover']);
            Route::post('{conversation}/end', [ChatController::class, 'endConversation']);
        });

        // Knowledge Base
        Route::prefix('knowledge-bases')->group(function () {
            Route::get('/', [KnowledgeBaseController::class, 'index']);
            Route::post('/', [KnowledgeBaseController::class, 'store']);
            Route::post('upload', [KnowledgeBaseController::class, 'upload']);
            Route::post('search', [KnowledgeBaseController::class, 'search']);
            Route::get('{knowledgeBase}', [KnowledgeBaseController::class, 'show']);
            Route::put('{knowledgeBase}', [KnowledgeBaseController::class, 'update']);
            Route::delete('{knowledgeBase}', [KnowledgeBaseController::class, 'destroy']);
            Route::post('{knowledgeBase}/sync', [KnowledgeBaseController::class, 'sync']);
        });

        // Voice
        Route::prefix('voice')->group(function () {
            Route::get('voices', [VoiceController::class, 'voices']);
            Route::post('transcription', [VoiceController::class, 'transcription']);
            Route::post('text-to-speech', [VoiceController::class, 'textToSpeech']);
            Route::post('call', [VoiceController::class, 'call']);
            Route::post('end-call', [VoiceController::class, 'endCall']);
            Route::post('test-connection', [VoiceController::class, 'testConnection']);
            Route::post('configure-webhooks', [VoiceController::class, 'configureWebhooks']);
        });

        // Phone Numbers
        Route::prefix('phone-numbers')->group(function () {
            Route::get('/', [PhoneNumberController::class, 'index']);
            Route::get('providers', [PhoneNumberController::class, 'providers']);
            Route::get('search', [PhoneNumberController::class, 'searchAvailable']);
            Route::post('test-connection', [PhoneNumberController::class, 'testConnection']);
            Route::post('purchase', [PhoneNumberController::class, 'purchase']);
            Route::post('connect', [PhoneNumberController::class, 'connect']);
            Route::get('{phoneNumber}', [PhoneNumberController::class, 'show']);
            Route::put('{phoneNumber}', [PhoneNumberController::class, 'update']);
            Route::delete('{phoneNumber}', [PhoneNumberController::class, 'destroy']);
            Route::post('{phoneNumber}/verify', [PhoneNumberController::class, 'verify']);
            Route::get('{phoneNumber}/stats', [PhoneNumberController::class, 'stats']);
        });

        // Call Logs
        Route::prefix('call-logs')->group(function () {
            Route::get('/', [CallLogController::class, 'index']);
            Route::get('stats', [CallLogController::class, 'stats']);
            Route::post('export', [CallLogController::class, 'export']);
            Route::get('{callLog}', [CallLogController::class, 'show']);
            Route::put('{callLog}', [CallLogController::class, 'update']);
            Route::delete('{callLog}', [CallLogController::class, 'destroy']);
            Route::get('{callLog}/transcript', [CallLogController::class, 'transcript']);
            Route::get('{callLog}/recording', [CallLogController::class, 'recording']);
        });

        // WhatsApp
        Route::prefix('whatsapp')->group(function () {
            Route::get('status', [WhatsAppController::class, 'status']);
            Route::get('templates', [WhatsAppController::class, 'templates']);
            Route::post('send', [WhatsAppController::class, 'sendMessage']);
            Route::post('send-template', [WhatsAppController::class, 'sendTemplate']);
            Route::post('send-buttons', [WhatsAppController::class, 'sendButtons']);
        });

        // Integrations
        Route::prefix('integrations')->group(function () {
            Route::get('/', [IntegrationController::class, 'index']);
            Route::get('available', [IntegrationController::class, 'available']);
            Route::post('connect', [IntegrationController::class, 'connect']);
            Route::get('{integration}', [IntegrationController::class, 'show']);
            Route::put('{integration}', [IntegrationController::class, 'update']);
            Route::post('{integration}/disconnect', [IntegrationController::class, 'disconnect']);
            Route::delete('{integration}', [IntegrationController::class, 'destroy']);
            Route::post('{integration}/sync', [IntegrationController::class, 'sync']);
            Route::get('{integration}/test', [IntegrationController::class, 'test']);
        });

        // Analytics
        Route::prefix('analytics')->group(function () {
            Route::get('overview', [AnalyticsController::class, 'overview']);
            Route::get('conversations', [AnalyticsController::class, 'conversations']);
            Route::get('agents', [AnalyticsController::class, 'agents']);
            Route::get('realtime', [AnalyticsController::class, 'realtime']);
            Route::post('export', [AnalyticsController::class, 'export']);
        });

        // Settings
        Route::prefix('settings')->group(function () {
            Route::get('/', [SettingsController::class, 'index']);
            Route::put('profile', [SettingsController::class, 'updateProfile']);
            Route::put('password', [SettingsController::class, 'updatePassword']);
            Route::put('business', [SettingsController::class, 'updateBusiness']);
            Route::get('notifications', [SettingsController::class, 'notifications']);
            Route::put('notifications', [SettingsController::class, 'updateNotifications']);
            Route::get('ai', [SettingsController::class, 'aiSettings']);
            Route::put('ai', [SettingsController::class, 'updateAiSettings']);
            Route::get('api-keys', [SettingsController::class, 'apiKeys']);
            Route::post('api-keys', [SettingsController::class, 'createApiKey']);
            Route::delete('api-keys/{id}', [SettingsController::class, 'revokeApiKey']);
            
            // Two-Factor Authentication
            Route::get('two-factor', [SettingsController::class, 'twoFactorStatus']);
            Route::post('two-factor/enable', [SettingsController::class, 'enableTwoFactor']);
            Route::post('two-factor/verify', [SettingsController::class, 'verifyTwoFactor']);
            Route::post('two-factor/disable', [SettingsController::class, 'disableTwoFactor']);
            Route::post('two-factor/backup-codes', [SettingsController::class, 'regenerateBackupCodes']);
        });

        // Team Management
        Route::prefix('team')->group(function () {
            Route::get('/', [TeamController::class, 'index']);
            Route::get('stats', [TeamController::class, 'stats']);
            Route::post('invite', [TeamController::class, 'invite']);
            Route::get('{member}', [TeamController::class, 'show']);
            Route::put('{member}', [TeamController::class, 'update']);
            Route::delete('{member}', [TeamController::class, 'destroy']);
            Route::post('{member}/resend-invite', [TeamController::class, 'resendInvite']);
        });

        // Billing
        Route::prefix('billing')->group(function () {
            Route::get('subscription', [BillingController::class, 'subscription']);
            Route::get('plans', [BillingController::class, 'plans']);
            Route::post('change-plan', [BillingController::class, 'changePlan']);
            Route::post('cancel', [BillingController::class, 'cancel']);
            Route::post('resume', [BillingController::class, 'resume']);
            Route::get('invoices', [BillingController::class, 'invoices']);
            Route::get('usage', [BillingController::class, 'usage']);
            Route::get('payment-methods', [BillingController::class, 'paymentMethods']);
            Route::post('payment-methods', [BillingController::class, 'addPaymentMethod']);
            Route::delete('payment-methods/{methodId}', [BillingController::class, 'removePaymentMethod']);
            Route::post('payment-methods/{methodId}/default', [BillingController::class, 'setDefaultPaymentMethod']);
        });

        // Files
        Route::prefix('files')->group(function () {
            Route::post('upload', [FileController::class, 'upload']);
            Route::post('avatar', [FileController::class, 'uploadAvatar']);
            Route::post('logo', [FileController::class, 'uploadLogo']);
            Route::post('document', [FileController::class, 'uploadDocument']);
            Route::delete('/', [FileController::class, 'delete']);
        });

        // Widget
        Route::prefix('widget')->group(function () {
            Route::get('/', [WidgetController::class, 'show']);
            Route::put('/', [WidgetController::class, 'update']);
            Route::get('embed-code', [WidgetController::class, 'embedCode']);
        });
    });
});
