# Tenant Engine

## Overview

The Tenant Engine provides the multi-tenancy infrastructure for the SaaS platform. Each business (tenant) operates in complete isolation with its own configuration, data, integrations, and branding. The engine handles tenant lifecycle management, data isolation, billing, and white-label customization.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              TENANT ENGINE                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                        Tenant Context Provider                                 │ │
│   │                                                                                │ │
│   │   • Resolves tenant from request (domain, API key, phone number)              │ │
│   │   • Injects tenant context into all services                                  │ │
│   │   • Ensures tenant isolation in all queries                                   │ │
│   └───────────────────────────────────────────────────────────────────────────────┘ │
│                                           │                                          │
│         ┌─────────────────────────────────┼─────────────────────────────────┐       │
│         │                │                │                │                │       │
│         ▼                ▼                ▼                ▼                ▼       │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   │
│   │ Tenant    │   │ Config    │   │ Billing   │   │ Branding  │   │ Access    │   │
│   │ Manager   │   │ Manager   │   │ Manager   │   │ Manager   │   │ Manager   │   │
│   │           │   │           │   │           │   │           │   │           │   │
│   │• Create   │   │• Settings │   │• Plans    │   │• Logos    │   │• Users    │   │
│   │• Suspend  │   │• Features │   │• Usage    │   │• Colors   │   │• Roles    │   │
│   │• Delete   │   │• Limits   │   │• Invoices │   │• Domains  │   │• Permisns │   │
│   └───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘   │
│                                                                                      │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                        Data Isolation Layer                                    │ │
│   │                                                                                │ │
│   │   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────────┐     │ │
│   │   │ Database        │   │ Vector DB       │   │ File Storage            │     │ │
│   │   │ (tenant_id FK)  │   │ (namespace)     │   │ (tenant prefix)         │     │ │
│   │   └─────────────────┘   └─────────────────┘   └─────────────────────────┘     │ │
│   │                                                                                │ │
│   │   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────────┐     │ │
│   │   │ Queue Jobs      │   │ Cache Keys      │   │ Webhooks                │     │ │
│   │   │ (tenant_id)     │   │ (tenant:*)      │   │ (tenant endpoints)      │     │ │
│   │   └─────────────────┘   └─────────────────┘   └─────────────────────────┘     │ │
│   │                                                                                │ │
│   └───────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Tenant Resolution

### Resolution Strategies

```php
<?php

namespace App\Engines\Tenant;

class TenantResolver
{
    /**
     * Resolve tenant from incoming request
     */
    public function resolve(Request $request): ?Tenant
    {
        // 1. API Key header (for API requests)
        if ($apiKey = $request->header('X-API-Key')) {
            return $this->resolveByApiKey($apiKey);
        }

        // 2. Bearer token (for authenticated users)
        if ($token = $request->bearerToken()) {
            return $this->resolveByToken($token);
        }

        // 3. Subdomain (for dashboard access)
        if ($subdomain = $this->extractSubdomain($request)) {
            return $this->resolveBySubdomain($subdomain);
        }

        // 4. Custom domain (for white-label)
        $host = $request->getHost();
        return $this->resolveByDomain($host);
    }

    /**
     * Resolve tenant from webhook (phone number or webhook path)
     */
    public function resolveFromWebhook(string $identifier, string $type): ?Tenant
    {
        return match($type) {
            'phone' => $this->resolveByPhoneNumber($identifier),
            'path' => $this->resolveByWebhookPath($identifier),
            default => null,
        };
    }

    private function resolveByApiKey(string $apiKey): ?Tenant
    {
        $hashedKey = hash('sha256', $apiKey);
        
        $apiKeyRecord = TenantApiKey::where('key_hash', $hashedKey)
            ->where('is_active', true)
            ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->first();

        if ($apiKeyRecord) {
            $apiKeyRecord->update(['last_used_at' => now()]);
            return $apiKeyRecord->tenant;
        }

        return null;
    }

    private function resolveByPhoneNumber(string $phoneNumber): ?Tenant
    {
        $phoneRecord = PhoneNumber::where('phone_number', $phoneNumber)
            ->where('status', 'active')
            ->first();

        return $phoneRecord?->tenant;
    }
}
```

### Tenant Context Middleware

```php
<?php

namespace App\Http\Middleware;

class TenantContext
{
    public function handle(Request $request, Closure $next)
    {
        $tenant = app(TenantResolver::class)->resolve($request);

        if (!$tenant) {
            return response()->json(['error' => 'Tenant not found'], 404);
        }

        if ($tenant->status !== 'active') {
            return response()->json(['error' => 'Tenant suspended'], 403);
        }

        // Set tenant in container
        app()->instance('tenant', $tenant);
        
        // Set tenant ID for global scopes
        TenantScope::setTenantId($tenant->id);

        return $next($request);
    }
}
```

### Global Tenant Scope

```php
<?php

namespace App\Models\Scopes;

class TenantScope implements Scope
{
    private static ?string $tenantId = null;

    public static function setTenantId(?string $tenantId): void
    {
        self::$tenantId = $tenantId;
    }

    public static function getTenantId(): ?string
    {
        return self::$tenantId;
    }

    public function apply(Builder $builder, Model $model): void
    {
        if (self::$tenantId) {
            $builder->where($model->getTable() . '.tenant_id', self::$tenantId);
        }
    }
}

// Usage in models
class Product extends Model
{
    protected static function booted()
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            if (!$model->tenant_id && TenantScope::getTenantId()) {
                $model->tenant_id = TenantScope::getTenantId();
            }
        });
    }
}
```

---

## Tenant Lifecycle

### Onboarding Flow (5-Minute Setup)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        5-MINUTE ONBOARDING FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   STEP 1: Sign Up (30 seconds)                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │  • Email & Password                                                          │   │
│   │  • Business Name                                                             │   │
│   │  • Phone Number (for verification)                                           │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                               │
│                                      ▼                                               │
│   STEP 2: Company Details (60 seconds)                                               │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │  • Industry/Category                                                         │   │
│   │  • Business Address (optional)                                               │   │
│   │  • Logo Upload (optional)                                                    │   │
│   │  • Business Description                                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                               │
│                                      ▼                                               │
│   STEP 3: Phone Number Provisioning (60 seconds)                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │  • Select country                                                            │   │
│   │  • Auto-provision WhatsApp Business number                                   │   │
│   │  • (Optional) Provision Voice number                                         │   │
│   │  → System automatically:                                                     │   │
│   │    • Registers with WhatsApp Cloud API                                       │   │
│   │    • Sets up webhook endpoints                                               │   │
│   │    • Creates AI agent with business context                                  │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                               │
│                                      ▼                                               │
│   STEP 4: Product Catalog (90 seconds)                                               │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │  • Option A: CSV Upload                                                      │   │
│   │  • Option B: Connect Shopify/WooCommerce                                     │   │
│   │  • Option C: Add products manually (minimum 1)                               │   │
│   │  • Option D: Skip (add later)                                                │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                               │
│                                      ▼                                               │
│   STEP 5: Payment Setup (60 seconds)                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │  • Connect Paystack/Flutterwave/Stripe                                       │   │
│   │  • Enter API keys                                                            │   │
│   │  • Test connection                                                           │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                               │
│                                      ▼                                               │
│   🎉 DONE! AI Agent is Live                                                          │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │  • Show WhatsApp number to share with customers                              │   │
│   │  • Show QR code for WhatsApp                                                 │   │
│   │  • Test conversation button                                                  │   │
│   │  • Link to dashboard                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Tenant Manager

```php
<?php

namespace App\Engines\Tenant\Services;

class TenantManager
{
    /**
     * Create new tenant (onboarding)
     */
    public function create(array $data): Tenant
    {
        return DB::transaction(function () use ($data) {
            // 1. Create tenant record
            $tenant = Tenant::create([
                'name' => $data['business_name'],
                'slug' => Str::slug($data['business_name']),
                'owner_email' => $data['email'],
                'industry' => $data['industry'] ?? null,
                'status' => 'active',
                'plan' => 'trial',
                'trial_ends_at' => now()->addDays(14),
            ]);

            // 2. Create owner user
            $user = User::create([
                'tenant_id' => $tenant->id,
                'name' => $data['contact_name'] ?? $data['business_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'owner',
            ]);

            // 3. Create default settings
            $this->createDefaultSettings($tenant);

            // 4. Create API keys
            $this->createApiKeys($tenant);

            // 5. Initialize vector namespace
            $this->initializeVectorNamespace($tenant);

            // 6. Dispatch onboarding jobs
            CreateTenantResources::dispatch($tenant);

            return $tenant;
        });
    }

    /**
     * Provision phone number for tenant
     */
    public function provisionPhoneNumber(
        Tenant $tenant,
        string $channel, // 'whatsapp', 'voice', 'both'
        string $countryCode = 'US'
    ): PhoneNumber {
        // Get available number from provider pool
        $number = $this->phoneNumberPool->acquire($countryCode, $channel);

        // Register with WhatsApp Cloud API if whatsapp
        if (in_array($channel, ['whatsapp', 'both'])) {
            $this->whatsappService->registerNumber($number, $tenant);
        }

        // Register with voice provider if voice
        if (in_array($channel, ['voice', 'both'])) {
            $this->voiceService->registerNumber($number, $tenant);
        }

        // Create phone number record
        $phoneNumber = PhoneNumber::create([
            'tenant_id' => $tenant->id,
            'phone_number' => $number,
            'country_code' => $countryCode,
            'channel' => $channel,
            'provider' => $this->determineProvider($channel),
            'status' => 'active',
            'verified_at' => now(),
        ]);

        // Setup webhook endpoints
        $this->setupWebhookEndpoints($tenant, $phoneNumber);

        return $phoneNumber;
    }

    /**
     * Suspend tenant
     */
    public function suspend(Tenant $tenant, string $reason): void
    {
        $tenant->update([
            'status' => 'suspended',
            'suspended_at' => now(),
            'suspension_reason' => $reason,
        ]);

        // Pause all active conversations
        Conversation::where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->update(['status' => 'paused']);

        // Disable phone numbers
        PhoneNumber::where('tenant_id', $tenant->id)
            ->update(['status' => 'suspended']);

        event(new TenantSuspended($tenant, $reason));
    }

    /**
     * Reactivate tenant
     */
    public function reactivate(Tenant $tenant): void
    {
        $tenant->update([
            'status' => 'active',
            'suspended_at' => null,
            'suspension_reason' => null,
        ]);

        // Reactivate phone numbers
        PhoneNumber::where('tenant_id', $tenant->id)
            ->update(['status' => 'active']);

        event(new TenantReactivated($tenant));
    }

    /**
     * Delete tenant and all data (GDPR compliance)
     */
    public function delete(Tenant $tenant): void
    {
        // This should be queued for background processing
        DeleteTenantData::dispatch($tenant->id);

        $tenant->update(['status' => 'deleting']);
    }

    private function createDefaultSettings(Tenant $tenant): void
    {
        TenantSetting::insert([
            [
                'tenant_id' => $tenant->id,
                'key' => 'ai_greeting',
                'value' => json_encode("Hello! I'm your AI assistant. How can I help you today?"),
            ],
            [
                'tenant_id' => $tenant->id,
                'key' => 'voice_greeting',
                'value' => json_encode("Hello, thank you for calling. How may I assist you?"),
            ],
            [
                'tenant_id' => $tenant->id,
                'key' => 'business_hours',
                'value' => json_encode(['mon-fri' => '09:00-18:00']),
            ],
            [
                'tenant_id' => $tenant->id,
                'key' => 'currency',
                'value' => json_encode('USD'),
            ],
            [
                'tenant_id' => $tenant->id,
                'key' => 'timezone',
                'value' => json_encode('UTC'),
            ],
        ]);
    }

    private function createApiKeys(Tenant $tenant): void
    {
        // Create live API key
        $liveKey = 'live_' . Str::random(32);
        TenantApiKey::create([
            'tenant_id' => $tenant->id,
            'name' => 'Default Live Key',
            'key_hash' => hash('sha256', $liveKey),
            'key_preview' => substr($liveKey, 0, 8) . '...',
            'environment' => 'live',
            'is_active' => true,
        ]);

        // Create test API key
        $testKey = 'test_' . Str::random(32);
        TenantApiKey::create([
            'tenant_id' => $tenant->id,
            'name' => 'Default Test Key',
            'key_hash' => hash('sha256', $testKey),
            'key_preview' => substr($testKey, 0, 8) . '...',
            'environment' => 'test',
            'is_active' => true,
        ]);

        // Store keys temporarily for display (encrypted, expires in 1 hour)
        Cache::put(
            "tenant:{$tenant->id}:initial_keys",
            encrypt(['live' => $liveKey, 'test' => $testKey]),
            now()->addHour()
        );
    }
}
```

---

## Configuration Management

```php
<?php

namespace App\Engines\Tenant\Services;

class ConfigManager
{
    /**
     * Get tenant setting
     */
    public function get(string $key, mixed $default = null): mixed
    {
        $tenant = app('tenant');
        
        $cacheKey = "tenant:{$tenant->id}:settings:{$key}";
        
        return Cache::remember($cacheKey, 3600, function () use ($tenant, $key, $default) {
            $setting = TenantSetting::where('tenant_id', $tenant->id)
                ->where('key', $key)
                ->first();

            return $setting ? json_decode($setting->value, true) : $default;
        });
    }

    /**
     * Set tenant setting
     */
    public function set(string $key, mixed $value): void
    {
        $tenant = app('tenant');

        TenantSetting::updateOrCreate(
            ['tenant_id' => $tenant->id, 'key' => $key],
            ['value' => json_encode($value)]
        );

        Cache::forget("tenant:{$tenant->id}:settings:{$key}");
    }

    /**
     * Get all settings
     */
    public function all(): array
    {
        $tenant = app('tenant');
        
        return Cache::remember("tenant:{$tenant->id}:all_settings", 3600, function () use ($tenant) {
            return TenantSetting::where('tenant_id', $tenant->id)
                ->pluck('value', 'key')
                ->map(fn($v) => json_decode($v, true))
                ->toArray();
        });
    }

    /**
     * Get AI configuration
     */
    public function getAIConfig(): array
    {
        return [
            'greeting' => $this->get('ai_greeting'),
            'voice_greeting' => $this->get('voice_greeting'),
            'personality' => $this->get('ai_personality', 'professional'),
            'language' => $this->get('default_language', 'en'),
            'escalation_keywords' => $this->get('escalation_keywords', []),
            'business_context' => $this->get('business_description'),
        ];
    }

    /**
     * Check if feature is enabled for tenant
     */
    public function hasFeature(string $feature): bool
    {
        $tenant = app('tenant');
        $plan = $this->getPlanFeatures($tenant->plan);
        
        return in_array($feature, $plan['features'] ?? []);
    }

    /**
     * Get usage limits for tenant
     */
    public function getLimits(): array
    {
        $tenant = app('tenant');
        $plan = $this->getPlanFeatures($tenant->plan);
        
        return $plan['limits'] ?? [];
    }
}
```

---

## Billing & Usage

### Plan Configuration

```php
// config/plans.php

return [
    'trial' => [
        'name' => 'Free Trial',
        'price' => 0,
        'duration_days' => 14,
        'features' => [
            'whatsapp_messaging',
            'basic_ai',
            'product_catalog',
            'basic_analytics',
        ],
        'limits' => [
            'messages_per_month' => 500,
            'products' => 50,
            'team_members' => 1,
            'conversations_per_day' => 50,
        ],
    ],
    'starter' => [
        'name' => 'Starter',
        'price' => 49,
        'currency' => 'USD',
        'billing_period' => 'monthly',
        'features' => [
            'whatsapp_messaging',
            'basic_ai',
            'product_catalog',
            'basic_analytics',
            'email_support',
        ],
        'limits' => [
            'messages_per_month' => 2000,
            'products' => 200,
            'team_members' => 3,
            'conversations_per_day' => 200,
        ],
    ],
    'professional' => [
        'name' => 'Professional',
        'price' => 149,
        'currency' => 'USD',
        'billing_period' => 'monthly',
        'features' => [
            'whatsapp_messaging',
            'voice_ai',
            'advanced_ai',
            'product_catalog',
            'advanced_analytics',
            'integrations',
            'priority_support',
            'human_takeover',
        ],
        'limits' => [
            'messages_per_month' => 10000,
            'voice_minutes_per_month' => 500,
            'products' => 1000,
            'team_members' => 10,
            'conversations_per_day' => 1000,
        ],
    ],
    'enterprise' => [
        'name' => 'Enterprise',
        'price' => 'custom',
        'features' => [
            'whatsapp_messaging',
            'voice_ai',
            'advanced_ai',
            'product_catalog',
            'advanced_analytics',
            'integrations',
            'dedicated_support',
            'human_takeover',
            'white_label',
            'custom_integrations',
            'sla',
        ],
        'limits' => [
            'messages_per_month' => 'unlimited',
            'voice_minutes_per_month' => 'unlimited',
            'products' => 'unlimited',
            'team_members' => 'unlimited',
            'conversations_per_day' => 'unlimited',
        ],
    ],
];
```

### Usage Tracking

```php
<?php

namespace App\Engines\Tenant\Services;

class UsageTracker
{
    /**
     * Track usage metric
     */
    public function track(string $metric, int $count = 1): void
    {
        $tenant = app('tenant');
        $period = now()->format('Y-m');

        $key = "usage:{$tenant->id}:{$period}:{$metric}";
        Redis::incrby($key, $count);
        Redis::expire($key, 86400 * 35); // Keep for 35 days
    }

    /**
     * Get usage for current period
     */
    public function getUsage(string $metric): int
    {
        $tenant = app('tenant');
        $period = now()->format('Y-m');

        $key = "usage:{$tenant->id}:{$period}:{$metric}";
        return (int) Redis::get($key) ?? 0;
    }

    /**
     * Check if limit exceeded
     */
    public function isLimitExceeded(string $metric): bool
    {
        $limit = app(ConfigManager::class)->getLimits()[$metric] ?? null;
        
        if ($limit === 'unlimited' || $limit === null) {
            return false;
        }

        return $this->getUsage($metric) >= $limit;
    }

    /**
     * Get usage summary
     */
    public function getSummary(): array
    {
        $limits = app(ConfigManager::class)->getLimits();
        $summary = [];

        foreach ($limits as $metric => $limit) {
            $usage = $this->getUsage($metric);
            $summary[$metric] = [
                'used' => $usage,
                'limit' => $limit,
                'percentage' => $limit === 'unlimited' ? 0 : round(($usage / $limit) * 100, 1),
            ];
        }

        return $summary;
    }

    /**
     * Persist usage to database (called daily)
     */
    public function persistUsage(): void
    {
        $tenant = app('tenant');
        $period = now()->format('Y-m');

        $metrics = ['messages', 'voice_minutes', 'conversations', 'orders'];

        foreach ($metrics as $metric) {
            $key = "usage:{$tenant->id}:{$period}:{$metric}";
            $value = (int) Redis::get($key) ?? 0;

            TenantUsage::updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'period' => $period,
                    'metric' => $metric,
                ],
                ['value' => $value]
            );
        }
    }
}
```

---

## Branding & White-Label

```php
<?php

namespace App\Engines\Tenant\Services;

class BrandingManager
{
    /**
     * Get branding configuration
     */
    public function getBranding(): array
    {
        $tenant = app('tenant');

        return [
            'logo_url' => $tenant->logo_url ?? $this->getDefaultLogo(),
            'favicon_url' => $tenant->favicon_url,
            'primary_color' => $tenant->primary_color ?? '#3B82F6',
            'secondary_color' => $tenant->secondary_color ?? '#1E40AF',
            'company_name' => $tenant->name,
            'custom_domain' => $tenant->custom_domain,
            'email_from_name' => $tenant->getSetting('email_from_name') ?? $tenant->name,
            'email_from_address' => $tenant->getSetting('email_from_address'),
        ];
    }

    /**
     * Update branding
     */
    public function updateBranding(array $data): void
    {
        $tenant = app('tenant');

        if (isset($data['logo'])) {
            $logoPath = $this->uploadLogo($data['logo']);
            $tenant->logo_url = $logoPath;
        }

        if (isset($data['favicon'])) {
            $faviconPath = $this->uploadFavicon($data['favicon']);
            $tenant->favicon_url = $faviconPath;
        }

        $tenant->fill(Arr::only($data, [
            'primary_color',
            'secondary_color',
        ]));

        $tenant->save();

        // Clear branding cache
        Cache::forget("tenant:{$tenant->id}:branding");
    }

    /**
     * Setup custom domain
     */
    public function setupCustomDomain(string $domain): CustomDomainSetup
    {
        $tenant = app('tenant');

        // Validate domain ownership
        $verificationToken = Str::random(32);

        TenantDomain::create([
            'tenant_id' => $tenant->id,
            'domain' => $domain,
            'verification_token' => $verificationToken,
            'status' => 'pending_verification',
        ]);

        return new CustomDomainSetup([
            'domain' => $domain,
            'verification_type' => 'TXT',
            'verification_name' => '_aicommerce-verify',
            'verification_value' => $verificationToken,
            'cname_target' => config('app.cname_target'),
        ]);
    }

    /**
     * Verify custom domain
     */
    public function verifyCustomDomain(string $domain): bool
    {
        $domainRecord = TenantDomain::where('domain', $domain)->first();

        if (!$domainRecord) {
            return false;
        }

        // Check DNS TXT record
        $records = dns_get_record("_aicommerce-verify.{$domain}", DNS_TXT);

        foreach ($records as $record) {
            if (($record['txt'] ?? '') === $domainRecord->verification_token) {
                $domainRecord->update([
                    'status' => 'verified',
                    'verified_at' => now(),
                ]);

                // Update tenant's custom domain
                $domainRecord->tenant->update(['custom_domain' => $domain]);

                return true;
            }
        }

        return false;
    }
}
```

---

## Access Management

```php
<?php

namespace App\Engines\Tenant\Services;

class AccessManager
{
    /**
     * Available roles
     */
    public const ROLES = [
        'owner' => [
            'name' => 'Owner',
            'permissions' => ['*'],
        ],
        'admin' => [
            'name' => 'Administrator',
            'permissions' => [
                'manage_team',
                'manage_products',
                'manage_orders',
                'manage_settings',
                'view_analytics',
                'manage_integrations',
            ],
        ],
        'agent' => [
            'name' => 'Sales Agent',
            'permissions' => [
                'view_conversations',
                'takeover_conversations',
                'view_orders',
                'create_orders',
            ],
        ],
        'viewer' => [
            'name' => 'Viewer',
            'permissions' => [
                'view_conversations',
                'view_orders',
                'view_analytics',
            ],
        ],
    ];

    /**
     * Invite team member
     */
    public function inviteUser(string $email, string $role): TeamInvitation
    {
        $tenant = app('tenant');

        // Check team member limit
        $currentCount = User::where('tenant_id', $tenant->id)->count();
        $limit = app(ConfigManager::class)->getLimits()['team_members'];

        if ($limit !== 'unlimited' && $currentCount >= $limit) {
            throw new TeamLimitExceededException();
        }

        $token = Str::random(64);

        $invitation = TeamInvitation::create([
            'tenant_id' => $tenant->id,
            'email' => $email,
            'role' => $role,
            'token' => hash('sha256', $token),
            'invited_by' => auth()->id(),
            'expires_at' => now()->addDays(7),
        ]);

        // Send invitation email
        Mail::to($email)->send(new TeamInvitationMail($invitation, $token));

        return $invitation;
    }

    /**
     * Accept invitation
     */
    public function acceptInvitation(string $token, array $userData): User
    {
        $hashedToken = hash('sha256', $token);

        $invitation = TeamInvitation::where('token', $hashedToken)
            ->where('expires_at', '>', now())
            ->where('accepted_at', null)
            ->firstOrFail();

        $user = User::create([
            'tenant_id' => $invitation->tenant_id,
            'name' => $userData['name'],
            'email' => $invitation->email,
            'password' => Hash::make($userData['password']),
            'role' => $invitation->role,
        ]);

        $invitation->update(['accepted_at' => now()]);

        return $user;
    }

    /**
     * Check permission
     */
    public function can(User $user, string $permission): bool
    {
        $rolePermissions = self::ROLES[$user->role]['permissions'] ?? [];

        if (in_array('*', $rolePermissions)) {
            return true;
        }

        return in_array($permission, $rolePermissions);
    }

    /**
     * Update user role
     */
    public function updateRole(User $user, string $newRole): void
    {
        if (!isset(self::ROLES[$newRole])) {
            throw new InvalidRoleException($newRole);
        }

        // Prevent demoting the last owner
        if ($user->role === 'owner') {
            $ownerCount = User::where('tenant_id', $user->tenant_id)
                ->where('role', 'owner')
                ->count();

            if ($ownerCount <= 1 && $newRole !== 'owner') {
                throw new CannotDemoteLastOwnerException();
            }
        }

        $user->update(['role' => $newRole]);
    }
}
```

---

## Database Schema

```sql
-- Tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    owner_email VARCHAR(255) NOT NULL,
    
    industry VARCHAR(100),
    description TEXT,
    
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#1E40AF',
    
    custom_domain VARCHAR(255) UNIQUE,
    
    plan VARCHAR(50) DEFAULT 'trial',
    trial_ends_at TIMESTAMP,
    
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleting
    suspended_at TIMESTAMP,
    suspension_reason TEXT,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_tenants_slug (slug),
    INDEX idx_tenants_status (status),
    INDEX idx_tenants_domain (custom_domain)
);

-- Tenant Settings
CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, key),
    INDEX idx_settings_tenant (tenant_id)
);

-- Tenant API Keys
CREATE TABLE tenant_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE,
    key_preview VARCHAR(20) NOT NULL, -- First 8 chars for identification
    environment VARCHAR(10) DEFAULT 'live', -- live, test
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_api_keys_tenant (tenant_id),
    INDEX idx_api_keys_hash (key_hash)
);

-- Custom Domains
CREATE TABLE tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    verification_token VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_verification',
    verified_at TIMESTAMP,
    ssl_provisioned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_domains_tenant (tenant_id),
    INDEX idx_domains_domain (domain)
);

-- Team Invitations
CREATE TABLE team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    token VARCHAR(64) NOT NULL,
    invited_by UUID REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_invitations_tenant (tenant_id),
    INDEX idx_invitations_token (token)
);

-- Tenant Usage
CREATE TABLE tenant_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    period VARCHAR(7) NOT NULL, -- YYYY-MM
    metric VARCHAR(50) NOT NULL,
    value INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, period, metric),
    INDEX idx_usage_tenant (tenant_id),
    INDEX idx_usage_period (period)
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, past_due
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP,
    payment_provider VARCHAR(50), -- stripe, paystack
    external_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_subscriptions_tenant (tenant_id),
    INDEX idx_subscriptions_status (status)
);

-- Invoices (platform billing)
CREATE TABLE platform_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    subscription_id UUID REFERENCES subscriptions(id),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    line_items JSONB NOT NULL,
    paid_at TIMESTAMP,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_platform_invoices_tenant (tenant_id),
    INDEX idx_platform_invoices_status (status)
);
```

---

## Configuration

```php
// config/tenant.php

return [
    'resolution' => [
        'strategies' => ['api_key', 'token', 'subdomain', 'domain'],
        'cache_ttl' => 3600,
    ],

    'isolation' => [
        'database' => 'shared', // 'shared' (tenant_id) or 'separate' (separate databases)
        'vector_store' => 'namespace', // 'namespace' per tenant
        'file_storage' => 'prefix', // 'prefix' per tenant in same bucket
    ],

    'onboarding' => [
        'trial_days' => 14,
        'require_phone_verification' => true,
        'auto_provision_whatsapp' => true,
    ],

    'limits' => [
        'api_keys_per_tenant' => 10,
        'custom_domains' => 1, // Enterprise gets more
    ],

    'cleanup' => [
        'delete_after_days' => 30, // Days after account deletion request
        'anonymize_conversations' => true,
    ],
];
```

---

## Next Steps

Continue to: [Database Schema →](07-DATABASE-SCHEMA.md)
