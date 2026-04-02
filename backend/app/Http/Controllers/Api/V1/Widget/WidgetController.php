<?php

namespace App\Http\Controllers\Api\V1\Widget;

use App\Http\Controllers\Api\V1\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WidgetController extends BaseController
{
    /**
     * Get widget configuration
     */
    public function show(): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        
        // Default widget config
        $defaultConfig = [
            'enabled' => true,
            'primary_color' => $tenant->primary_color ?? '#7C3AED',
            'position' => 'bottom-right',
            'greeting' => 'Hi! How can I help you today?',
            'placeholder' => 'Type your message...',
            'header_title' => 'Chat with us',
            'header_subtitle' => 'We typically reply within minutes',
            'show_avatar' => true,
            'show_branding' => true,
            'auto_open' => false,
            'auto_open_delay' => 5,
            'sound_enabled' => true,
            'show_typing_indicator' => true,
            'collect_email' => true,
            'require_email_first' => false,
            'offline_message' => "We're currently offline. Leave a message and we'll get back to you.",
            'business_hours' => [
                'enabled' => false,
                'timezone' => 'UTC',
                'schedule' => [
                    'monday' => ['start' => '09:00', 'end' => '17:00', 'enabled' => true],
                    'tuesday' => ['start' => '09:00', 'end' => '17:00', 'enabled' => true],
                    'wednesday' => ['start' => '09:00', 'end' => '17:00', 'enabled' => true],
                    'thursday' => ['start' => '09:00', 'end' => '17:00', 'enabled' => true],
                    'friday' => ['start' => '09:00', 'end' => '17:00', 'enabled' => true],
                    'saturday' => ['start' => '10:00', 'end' => '14:00', 'enabled' => false],
                    'sunday' => ['start' => '10:00', 'end' => '14:00', 'enabled' => false],
                ],
            ],
        ];
        
        // Merge stored config with defaults
        $widgetConfig = array_merge($defaultConfig, $settings['widget'] ?? []);
        
        return $this->success([
            'config' => $widgetConfig,
            'widget_id' => $this->getWidgetId($tenant),
            'embed_url' => config('app.widget_url', 'https://widget.vivaxai.com'),
        ]);
    }

    /**
     * Update widget configuration
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enabled' => 'boolean',
            'primary_color' => 'nullable|string|max:20',
            'position' => 'nullable|in:bottom-right,bottom-left,top-right,top-left',
            'greeting' => 'nullable|string|max:500',
            'placeholder' => 'nullable|string|max:200',
            'header_title' => 'nullable|string|max:100',
            'header_subtitle' => 'nullable|string|max:200',
            'show_avatar' => 'boolean',
            'show_branding' => 'boolean',
            'auto_open' => 'boolean',
            'auto_open_delay' => 'nullable|integer|min:0|max:60',
            'sound_enabled' => 'boolean',
            'show_typing_indicator' => 'boolean',
            'collect_email' => 'boolean',
            'require_email_first' => 'boolean',
            'offline_message' => 'nullable|string|max:500',
            'business_hours' => 'nullable|array',
            'business_hours.enabled' => 'boolean',
            'business_hours.timezone' => 'nullable|string',
            'business_hours.schedule' => 'nullable|array',
        ]);

        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        
        // Merge new config with existing
        $settings['widget'] = array_merge($settings['widget'] ?? [], $validated);
        
        $tenant->update(['settings' => $settings]);

        return $this->success([
            'config' => $settings['widget'],
            'widget_id' => $this->getWidgetId($tenant),
        ], 'Widget settings updated');
    }

    /**
     * Get embed code for the widget
     */
    public function embedCode(): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        $widgetId = $this->getWidgetId($tenant);
        $embedUrl = config('app.widget_url', 'https://widget.vivaxai.com');

        $code = <<<HTML
<script>
  (function(w,d,s,o,f,js,fjs){
    w['VivaxWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','vx','{$embedUrl}/loader.js'));
  vx('init', { workspaceId: '{$widgetId}' });
</script>
HTML;

        return $this->success([
            'code' => $code,
            'widget_id' => $widgetId,
            'embed_url' => $embedUrl,
        ]);
    }

    /**
     * Get public widget configuration (no auth required)
     */
    public function publicConfig(string $widgetId): JsonResponse
    {
        // Extract tenant from widget ID
        $tenantId = $this->extractTenantId($widgetId);
        
        if (!$tenantId) {
            return $this->error('Invalid widget ID', 404);
        }

        $tenant = \App\Models\Tenant::find($tenantId);
        
        if (!$tenant) {
            return $this->error('Widget not found', 404);
        }

        $settings = $tenant->settings ?? [];
        $widgetConfig = $settings['widget'] ?? [];
        
        // Only return public-safe configuration
        return $this->success([
            'primary_color' => $widgetConfig['primary_color'] ?? $tenant->primary_color ?? '#7C3AED',
            'position' => $widgetConfig['position'] ?? 'bottom-right',
            'greeting' => $widgetConfig['greeting'] ?? 'Hi! How can I help you today?',
            'placeholder' => $widgetConfig['placeholder'] ?? 'Type your message...',
            'header_title' => $widgetConfig['header_title'] ?? $tenant->name,
            'header_subtitle' => $widgetConfig['header_subtitle'] ?? 'We typically reply within minutes',
            'show_avatar' => $widgetConfig['show_avatar'] ?? true,
            'show_branding' => $widgetConfig['show_branding'] ?? true,
            'auto_open' => $widgetConfig['auto_open'] ?? false,
            'auto_open_delay' => $widgetConfig['auto_open_delay'] ?? 5,
            'sound_enabled' => $widgetConfig['sound_enabled'] ?? true,
            'show_typing_indicator' => $widgetConfig['show_typing_indicator'] ?? true,
            'collect_email' => $widgetConfig['collect_email'] ?? true,
            'require_email_first' => $widgetConfig['require_email_first'] ?? false,
            'tenant_name' => $tenant->name,
            'tenant_logo' => $tenant->logo,
        ]);
    }

    /**
     * Generate or get widget ID for tenant
     */
    private function getWidgetId($tenant): string
    {
        $settings = $tenant->settings ?? [];
        
        if (isset($settings['widget_id'])) {
            return $settings['widget_id'];
        }
        
        // Generate new widget ID
        $widgetId = 'ws_' . Str::random(16);
        $settings['widget_id'] = $widgetId;
        $tenant->update(['settings' => $settings]);
        
        return $widgetId;
    }

    /**
     * Extract tenant ID from widget ID
     */
    private function extractTenantId(string $widgetId): ?string
    {
        // Find tenant by widget_id stored in settings
        $tenant = \App\Models\Tenant::whereRaw("JSON_EXTRACT(settings, '$.widget_id') = ?", [$widgetId])->first();
        
        return $tenant?->id;
    }
}
