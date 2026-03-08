# Security & Scalability

## Overview

This document covers the security architecture, compliance considerations, and scalability strategies for the AI Commerce Automation Platform.

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    EDGE SECURITY (Cloudflare/AWS)                     │  │
│  │  • DDoS Protection  • WAF Rules  • Bot Detection  • Rate Limiting     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      API GATEWAY LAYER                                │  │
│  │  • TLS 1.3 Termination  • Authentication  • Request Validation        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    APPLICATION SECURITY                               │  │
│  │  • RBAC  • Tenant Isolation  • Input Sanitization  • CSRF Protection  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      DATA SECURITY                                    │  │
│  │  • Encryption at Rest  • Encryption in Transit  • Key Management      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    AUDIT & MONITORING                                 │  │
│  │  • Access Logs  • Security Events  • Anomaly Detection  • Alerts      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization

### Authentication Methods

#### 1. JWT Token Authentication (Dashboard/Admin)

```php
<?php

namespace App\Services\Auth;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;

class JWTAuthService
{
    private const TOKEN_TTL = 3600; // 1 hour
    private const REFRESH_TTL = 604800; // 7 days
    
    public function generateTokenPair(User $user): TokenPair
    {
        $now = time();
        
        // Access token
        $accessPayload = [
            'iss' => config('app.url'),
            'sub' => $user->id,
            'iat' => $now,
            'exp' => $now + self::TOKEN_TTL,
            'tenant_id' => $user->tenant_id,
            'roles' => $user->roles->pluck('name')->toArray(),
        ];
        
        $accessToken = JWT::encode(
            $accessPayload,
            config('auth.jwt.secret'),
            'HS256'
        );
        
        // Refresh token
        $refreshToken = bin2hex(random_bytes(32));
        
        // Store refresh token
        $user->refreshTokens()->create([
            'token' => hash('sha256', $refreshToken),
            'expires_at' => now()->addSeconds(self::REFRESH_TTL),
            'user_agent' => request()->userAgent(),
            'ip_address' => request()->ip(),
        ]);
        
        return new TokenPair(
            accessToken: $accessToken,
            refreshToken: $refreshToken,
            expiresIn: self::TOKEN_TTL,
        );
    }
    
    public function validateToken(string $token): ?TokenPayload
    {
        try {
            $decoded = JWT::decode(
                $token,
                new Key(config('auth.jwt.secret'), 'HS256')
            );
            
            return new TokenPayload(
                userId: $decoded->sub,
                tenantId: $decoded->tenant_id,
                roles: $decoded->roles,
                expiresAt: $decoded->exp,
            );
        } catch (\Exception $e) {
            return null;
        }
    }
}
```

#### 2. API Key Authentication (External Integrations)

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\TenantApiKey;

class AuthenticateApiKey
{
    public function handle(Request $request, Closure $next)
    {
        $apiKey = $request->header('X-API-Key');
        
        if (!$apiKey) {
            return response()->json([
                'error' => 'API key required',
            ], 401);
        }
        
        // Hash the key for lookup
        $hashedKey = hash('sha256', $apiKey);
        
        $apiKeyModel = TenantApiKey::where('key_hash', $hashedKey)
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->first();
        
        if (!$apiKeyModel) {
            return response()->json([
                'error' => 'Invalid API key',
            ], 401);
        }
        
        // Check rate limits
        if (!$this->checkRateLimit($apiKeyModel)) {
            return response()->json([
                'error' => 'Rate limit exceeded',
            ], 429);
        }
        
        // Set tenant context
        $request->merge([
            'tenant' => $apiKeyModel->tenant,
            'api_key' => $apiKeyModel,
        ]);
        
        // Update last used
        $apiKeyModel->touch('last_used_at');
        
        return $next($request);
    }
    
    private function checkRateLimit(TenantApiKey $apiKey): bool
    {
        $key = "rate_limit:{$apiKey->id}";
        $limit = $apiKey->rate_limit ?? 200; // requests per minute
        
        $current = Redis::incr($key);
        if ($current === 1) {
            Redis::expire($key, 60);
        }
        
        return $current <= $limit;
    }
}
```

### Role-Based Access Control (RBAC)

```php
<?php

// Permission definitions
return [
    'roles' => [
        'owner' => [
            'description' => 'Full access to all features',
            'permissions' => ['*'],
        ],
        'admin' => [
            'description' => 'Manage operations',
            'permissions' => [
                'products.*',
                'orders.*',
                'customers.*',
                'conversations.*',
                'integrations.view',
                'analytics.view',
                'team.view',
            ],
        ],
        'agent' => [
            'description' => 'Handle customer conversations',
            'permissions' => [
                'conversations.*',
                'orders.view',
                'orders.update',
                'customers.view',
                'products.view',
            ],
        ],
        'viewer' => [
            'description' => 'Read-only access',
            'permissions' => [
                'products.view',
                'orders.view',
                'customers.view',
                'analytics.view',
            ],
        ],
    ],
    
    'permissions' => [
        'products' => ['view', 'create', 'update', 'delete'],
        'orders' => ['view', 'create', 'update', 'cancel', 'refund'],
        'customers' => ['view', 'create', 'update', 'delete'],
        'conversations' => ['view', 'respond', 'handover', 'close'],
        'integrations' => ['view', 'create', 'update', 'delete'],
        'analytics' => ['view', 'export'],
        'team' => ['view', 'invite', 'update', 'remove'],
        'settings' => ['view', 'update'],
        'billing' => ['view', 'update'],
    ],
];
```

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = $request->user();
        
        if (!$user->hasPermission($permission)) {
            return response()->json([
                'error' => 'Insufficient permissions',
                'required' => $permission,
            ], 403);
        }
        
        return $next($request);
    }
}

// Usage in routes
Route::post('/products', [ProductController::class, 'store'])
    ->middleware('permission:products.create');
```

---

## Data Security

### Encryption

```php
<?php

namespace App\Services\Security;

use Illuminate\Support\Facades\Crypt;

class EncryptionService
{
    /**
     * Encrypt sensitive data using application key
     */
    public function encrypt(string $data): string
    {
        return Crypt::encryptString($data);
    }
    
    /**
     * Decrypt data
     */
    public function decrypt(string $encrypted): string
    {
        return Crypt::decryptString($encrypted);
    }
    
    /**
     * Hash API keys for storage
     */
    public function hashApiKey(string $key): string
    {
        return hash('sha256', $key);
    }
    
    /**
     * Generate secure random API key
     */
    public function generateApiKey(string $prefix = 'ak'): string
    {
        $random = bin2hex(random_bytes(32));
        $env = app()->environment('production') ? 'live' : 'test';
        return "{$prefix}_{$env}_{$random}";
    }
}
```

### Sensitive Data Handling

```php
<?php

// Model attribute encryption
class TenantIntegration extends Model
{
    protected $casts = [
        'credentials' => 'encrypted:array', // Auto-encrypt/decrypt
    ];
    
    // Accessor to mask sensitive data in logs
    public function getCredentialsForLogging(): array
    {
        return collect($this->credentials)->map(function ($value, $key) {
            if (in_array($key, ['secret_key', 'api_secret', 'password'])) {
                return '***REDACTED***';
            }
            return $value;
        })->toArray();
    }
}
```

### Database Security

```sql
-- Row-Level Security (PostgreSQL)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON orders
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Audit trigger
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO transaction_audit_log (
        tenant_id, table_name, record_id, action, 
        old_values, new_values, user_id, ip_address
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) END,
        current_setting('app.current_user_id', true)::uuid,
        current_setting('app.client_ip', true)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to sensitive tables
CREATE TRIGGER orders_audit
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

---

## Webhook Security

### Signature Verification

```php
<?php

namespace App\Services\Webhooks;

class WebhookSignatureVerifier
{
    /**
     * Verify WhatsApp webhook signature
     */
    public function verifyWhatsApp(string $payload, string $signature): bool
    {
        $expected = hash_hmac(
            'sha256',
            $payload,
            config('services.whatsapp.app_secret')
        );
        
        return hash_equals("sha256={$expected}", $signature);
    }
    
    /**
     * Verify Paystack webhook signature
     */
    public function verifyPaystack(string $payload, string $signature): bool
    {
        $expected = hash_hmac(
            'sha512',
            $payload,
            config('services.paystack.secret_key')
        );
        
        return hash_equals($expected, $signature);
    }
    
    /**
     * Verify Flutterwave webhook signature
     */
    public function verifyFlutterwave(string $signature): bool
    {
        return hash_equals(
            config('services.flutterwave.secret_hash'),
            $signature
        );
    }
    
    /**
     * Verify Retell webhook
     */
    public function verifyRetell(string $payload, string $signature): bool
    {
        $expected = hash_hmac(
            'sha256',
            $payload,
            config('services.retell.api_key')
        );
        
        return hash_equals($expected, $signature);
    }
}
```

### Outbound Webhook Signing

```php
<?php

namespace App\Services\Webhooks;

class WebhookDispatcher
{
    public function dispatch(Webhook $webhook, array $payload): void
    {
        $timestamp = time();
        $body = json_encode($payload);
        
        // Create signature
        $signaturePayload = "{$timestamp}.{$body}";
        $signature = hash_hmac('sha256', $signaturePayload, $webhook->secret);
        
        // Send webhook
        Http::timeout(30)
            ->retry(3, 100)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'X-Webhook-Signature' => "sha256={$signature}",
                'X-Webhook-Timestamp' => $timestamp,
                'X-Webhook-ID' => $payload['id'],
            ])
            ->post($webhook->url, $payload);
    }
}
```

---

## Input Validation & Sanitization

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer_id' => [
                'required',
                'uuid',
                Rule::exists('customers', 'id')->where('tenant_id', $this->tenant->id),
            ],
            'items' => 'required|array|min:1|max:50',
            'items.*.product_id' => [
                'required',
                'uuid',
                Rule::exists('products', 'id')->where('tenant_id', $this->tenant->id),
            ],
            'items.*.quantity' => 'required|integer|min:1|max:999',
            'shipping_address' => 'required|array',
            'shipping_address.line1' => 'required|string|max:255',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.country' => 'required|string|size:2',
            'notes' => 'nullable|string|max:1000',
        ];
    }
    
    protected function prepareForValidation(): void
    {
        // Sanitize string inputs
        $this->merge([
            'notes' => $this->notes ? strip_tags($this->notes) : null,
        ]);
    }
}
```

### SQL Injection Prevention

```php
<?php

// Always use parameterized queries (Eloquent does this automatically)
// BAD:
$products = DB::select("SELECT * FROM products WHERE name = '{$name}'");

// GOOD:
$products = Product::where('name', $name)->get();

// For raw queries, use bindings:
$products = DB::select(
    "SELECT * FROM products WHERE name = ? AND tenant_id = ?",
    [$name, $tenantId]
);
```

### XSS Prevention

```php
<?php

// Always escape output in Blade templates
// Blade {{ }} automatically escapes
{{ $product->name }}         // Safe - escaped
{!! $product->name !!}       // Dangerous - raw HTML

// For JSON responses, data is safe but sanitize on input
public function store(Request $request)
{
    $validated = $request->validate([
        'description' => 'required|string|max:5000',
    ]);
    
    // Additional sanitization for rich text
    $validated['description'] = clean($validated['description']); // HTMLPurifier
    
    return Product::create($validated);
}
```

---

## Compliance

### GDPR Compliance

```php
<?php

namespace App\Services\Compliance;

class GDPRService
{
    /**
     * Export all customer data (Right to Access)
     */
    public function exportCustomerData(Customer $customer): array
    {
        return [
            'personal_info' => [
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'created_at' => $customer->created_at,
            ],
            'orders' => $customer->orders->map(fn($o) => [
                'order_number' => $o->order_number,
                'total' => $o->total,
                'created_at' => $o->created_at,
            ]),
            'conversations' => $customer->conversations->map(fn($c) => [
                'channel' => $c->channel,
                'messages_count' => $c->messages->count(),
                'created_at' => $c->created_at,
            ]),
        ];
    }
    
    /**
     * Delete all customer data (Right to Erasure)
     */
    public function deleteCustomerData(Customer $customer): void
    {
        DB::transaction(function () use ($customer) {
            // Anonymize conversations (keep for analytics)
            $customer->conversations()->update([
                'customer_id' => null,
            ]);
            
            // Delete personal data but keep order records for accounting
            $customer->orders()->update([
                'customer_name' => '[DELETED]',
                'customer_email' => null,
                'customer_phone' => null,
            ]);
            
            // Delete customer record
            $customer->delete();
        });
        
        // Log deletion for audit
        AuditLog::create([
            'action' => 'gdpr_deletion',
            'subject_type' => Customer::class,
            'subject_id' => $customer->id,
        ]);
    }
}
```

### POPIA Compliance (South Africa)

```php
<?php

// Consent tracking
class ConsentService
{
    public function recordConsent(
        Customer $customer,
        string $purpose,
        string $channel
    ): void {
        $customer->consents()->create([
            'purpose' => $purpose, // 'marketing', 'data_processing', etc.
            'channel' => $channel,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'consented_at' => now(),
        ]);
    }
    
    public function hasConsent(Customer $customer, string $purpose): bool
    {
        return $customer->consents()
            ->where('purpose', $purpose)
            ->whereNull('withdrawn_at')
            ->exists();
    }
    
    public function withdrawConsent(Customer $customer, string $purpose): void
    {
        $customer->consents()
            ->where('purpose', $purpose)
            ->whereNull('withdrawn_at')
            ->update(['withdrawn_at' => now()]);
    }
}
```

### Data Retention

```php
<?php

namespace App\Console\Commands;

class DataRetentionCleanup extends Command
{
    protected $signature = 'data:cleanup';
    
    public function handle(): void
    {
        // Delete old conversations (configurable per tenant)
        Conversation::query()
            ->where('closed_at', '<', now()->subMonths(12))
            ->whereHas('tenant', fn($q) => $q->where('retention_months', '<=', 12))
            ->chunk(100, function ($conversations) {
                foreach ($conversations as $conv) {
                    $conv->messages()->delete();
                    $conv->delete();
                }
            });
        
        // Delete old audit logs (keep 2 years)
        TransactionAuditLog::where('created_at', '<', now()->subYears(2))
            ->delete();
        
        // Delete expired sessions
        Session::where('last_activity', '<', now()->subHours(24))
            ->delete();
    }
}
```

---

## Scalability Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SCALABILITY ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         LOAD BALANCER                                │   │
│   │                    (AWS ALB / Cloudflare LB)                        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│            ┌───────────────────────┼───────────────────────┐                │
│            │                       │                       │                │
│            ▼                       ▼                       ▼                │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│   │   API Server    │    │   API Server    │    │   API Server    │        │
│   │   (Laravel)     │    │   (Laravel)     │    │   (Laravel)     │        │
│   │   Instance 1    │    │   Instance 2    │    │   Instance N    │        │
│   └────────┬────────┘    └────────┬────────┘    └────────┬────────┘        │
│            │                       │                       │                │
│            └───────────────────────┼───────────────────────┘                │
│                                    │                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      REDIS CLUSTER                                   │   │
│   │     ┌─────────┐    ┌─────────┐    ┌─────────┐                       │   │
│   │     │ Cache   │    │ Session │    │ Queue   │                       │   │
│   │     │ Primary │    │ Primary │    │ Primary │                       │   │
│   │     └────┬────┘    └────┬────┘    └────┬────┘                       │   │
│   │          │              │              │                             │   │
│   │     ┌────┴────┐    ┌────┴────┐    ┌────┴────┐                       │   │
│   │     │ Replica │    │ Replica │    │ Replica │                       │   │
│   │     └─────────┘    └─────────┘    └─────────┘                       │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    POSTGRESQL CLUSTER                                │   │
│   │     ┌──────────────────┐         ┌──────────────────┐               │   │
│   │     │     PRIMARY      │────────▶│    READ REPLICA   │               │   │
│   │     │   (Read/Write)   │         │   (Read Only)     │               │   │
│   │     └──────────────────┘         └──────────────────┘               │   │
│   │                                                                      │   │
│   │     Connection Pooling: PgBouncer                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     QUEUE WORKERS                                    │   │
│   │     ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐          │   │
│   │     │Worker 1 │   │Worker 2 │   │Worker 3 │   │Worker N │          │   │
│   │     │(default)│   │(high)   │   │(ai)     │   │(sync)   │          │   │
│   │     └─────────┘   └─────────┘   └─────────┘   └─────────┘          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Horizontal Scaling Strategy

```php
<?php

// config/queue.php - Queue configuration for scaling
return [
    'default' => env('QUEUE_CONNECTION', 'redis'),
    
    'connections' => [
        'redis' => [
            'driver' => 'redis',
            'connection' => 'queue',
            'queue' => 'default',
            'retry_after' => 90,
            'block_for' => null,
        ],
    ],
];

// Queue worker supervisor config (Supervisor)
// /etc/supervisor/conf.d/laravel-worker.conf
/*
[program:laravel-worker-default]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/html/artisan queue:work redis --queue=default --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=4

[program:laravel-worker-high]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/html/artisan queue:work redis --queue=high --sleep=1 --tries=3
autostart=true
autorestart=true
numprocs=2

[program:laravel-worker-ai]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/html/artisan queue:work redis --queue=ai --sleep=1 --tries=2 --timeout=120
autostart=true
autorestart=true
numprocs=4
*/
```

### Database Scaling

```php
<?php

// config/database.php - Read/Write splitting
return [
    'connections' => [
        'pgsql' => [
            'read' => [
                'host' => [
                    env('DB_READ_HOST_1'),
                    env('DB_READ_HOST_2'),
                ],
            ],
            'write' => [
                'host' => [
                    env('DB_WRITE_HOST'),
                ],
            ],
            'sticky' => true, // Use write connection after write
            'driver' => 'pgsql',
            'database' => env('DB_DATABASE'),
            'username' => env('DB_USERNAME'),
            'password' => env('DB_PASSWORD'),
        ],
    ],
];
```

### Caching Strategy

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    // Cache TTLs by type
    private const TTL = [
        'tenant_config' => 3600,      // 1 hour
        'product' => 300,              // 5 minutes
        'product_list' => 60,          // 1 minute
        'inventory' => 30,             // 30 seconds
        'session' => 86400,            // 24 hours
    ];
    
    /**
     * Multi-level caching for products
     */
    public function getProduct(string $tenantId, string $productId): ?Product
    {
        $key = "product:{$tenantId}:{$productId}";
        
        return Cache::tags(['products', "tenant:{$tenantId}"])
            ->remember($key, self::TTL['product'], function () use ($productId) {
                return Product::find($productId);
            });
    }
    
    /**
     * Invalidate tenant cache on updates
     */
    public function invalidateTenantCache(string $tenantId): void
    {
        Cache::tags(["tenant:{$tenantId}"])->flush();
    }
    
    /**
     * Cache tenant configuration
     */
    public function getTenantConfig(string $tenantId): array
    {
        return Cache::remember(
            "tenant_config:{$tenantId}",
            self::TTL['tenant_config'],
            fn() => Tenant::find($tenantId)->settings
        );
    }
}
```

### Auto-Scaling Configuration (AWS)

```yaml
# Auto Scaling Group configuration
Resources:
  APIAutoScalingGroup:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      LaunchTemplate:
        LaunchTemplateId: !Ref APILaunchTemplate
        Version: !GetAtt APILaunchTemplate.LatestVersionNumber
      MinSize: 2
      MaxSize: 20
      DesiredCapacity: 4
      TargetGroupARNs:
        - !Ref APITargetGroup
      HealthCheckType: ELB
      HealthCheckGracePeriod: 300
      Tags:
        - Key: Name
          Value: api-server
          PropagateAtLaunch: true

  CPUScalingPolicy:
    Type: AWS::AutoScaling::ScalingPolicy
    Properties:
      AutoScalingGroupName: !Ref APIAutoScalingGroup
      PolicyType: TargetTrackingScaling
      TargetTrackingConfiguration:
        PredefinedMetricSpecification:
          PredefinedMetricType: ASGAverageCPUUtilization
        TargetValue: 70.0
        ScaleInCooldown: 300
        ScaleOutCooldown: 60

  RequestCountScalingPolicy:
    Type: AWS::AutoScaling::ScalingPolicy
    Properties:
      AutoScalingGroupName: !Ref APIAutoScalingGroup
      PolicyType: TargetTrackingScaling
      TargetTrackingConfiguration:
        PredefinedMetricSpecification:
          PredefinedMetricType: ALBRequestCountPerTarget
          ResourceLabel: !Sub "${ALB.FullName}/${APITargetGroup.TargetGroupFullName}"
        TargetValue: 1000.0
```

---

## Performance Optimization

### Database Indexing

```sql
-- Critical indexes for performance
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_tenant_created ON orders(tenant_id, created_at DESC);
CREATE INDEX idx_products_tenant_active ON products(tenant_id) WHERE status = 'active';
CREATE INDEX idx_conversations_tenant_active ON conversations(tenant_id, status) 
    WHERE status IN ('active', 'pending');
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Full-text search
CREATE INDEX idx_products_search ON products USING gin(
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- Partial indexes for common queries
CREATE INDEX idx_orders_pending ON orders(tenant_id, created_at) 
    WHERE status = 'pending';
```

### Query Optimization

```php
<?php

// Use eager loading to prevent N+1
$orders = Order::with(['customer', 'items.product'])
    ->where('tenant_id', $tenantId)
    ->where('status', 'pending')
    ->get();

// Use cursor for large datasets
Order::where('tenant_id', $tenantId)
    ->cursor()
    ->each(function ($order) {
        // Process one at a time, memory efficient
    });

// Use chunk for batch processing
Order::where('tenant_id', $tenantId)
    ->chunk(100, function ($orders) {
        foreach ($orders as $order) {
            // Process
        }
    });
```

### Response Compression

```php
<?php

// Enable gzip compression in middleware
namespace App\Http\Middleware;

class CompressResponse
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        
        if ($this->shouldCompress($request, $response)) {
            $content = gzencode($response->getContent(), 6);
            $response->setContent($content);
            $response->headers->set('Content-Encoding', 'gzip');
            $response->headers->set('Content-Length', strlen($content));
        }
        
        return $response;
    }
}
```

---

## Monitoring & Alerting

### Health Checks

```php
<?php

Route::get('/health', function () {
    $checks = [
        'database' => fn() => DB::connection()->getPdo(),
        'redis' => fn() => Redis::ping(),
        'queue' => fn() => Queue::size('default') < 10000,
    ];
    
    $results = [];
    $healthy = true;
    
    foreach ($checks as $name => $check) {
        try {
            $check();
            $results[$name] = 'ok';
        } catch (\Exception $e) {
            $results[$name] = 'failed';
            $healthy = false;
        }
    }
    
    return response()->json([
        'status' => $healthy ? 'healthy' : 'unhealthy',
        'checks' => $results,
        'timestamp' => now()->toIso8601String(),
    ], $healthy ? 200 : 503);
});
```

### Metrics Collection

```php
<?php

namespace App\Services\Monitoring;

class MetricsCollector
{
    public function recordRequestMetrics(Request $request, Response $response, float $duration): void
    {
        $labels = [
            'method' => $request->method(),
            'endpoint' => $request->route()?->uri() ?? 'unknown',
            'status' => $response->getStatusCode(),
            'tenant' => $request->tenant?->id ?? 'none',
        ];
        
        // Record to Prometheus/CloudWatch
        Metrics::histogram('http_request_duration_seconds', $duration, $labels);
        Metrics::counter('http_requests_total', $labels);
    }
    
    public function recordAIMetrics(string $tenantId, int $tokensUsed, float $latency): void
    {
        Metrics::counter('ai_tokens_used_total', ['tenant' => $tenantId], $tokensUsed);
        Metrics::histogram('ai_response_latency_seconds', $latency, ['tenant' => $tenantId]);
    }
}
```

### Alerting Rules

```yaml
# Prometheus alerting rules
groups:
  - name: platform-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P95 latency above 2 seconds"
          
      - alert: QueueBacklog
        expr: redis_queue_length > 5000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Queue backlog growing"
          
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connections above 80%"
```

---

## Disaster Recovery

### Backup Strategy

```yaml
# Database backup schedule
backup:
  database:
    full:
      schedule: "0 2 * * *"  # Daily at 2 AM
      retention: 30  # days
    incremental:
      schedule: "0 */4 * * *"  # Every 4 hours
      retention: 7  # days
    
  redis:
    rdb:
      schedule: "0 */6 * * *"  # Every 6 hours
      retention: 7
    
  files:
    uploads:
      schedule: "0 3 * * *"  # Daily at 3 AM
      retention: 90
```

### Recovery Time Objectives

| Component | RTO | RPO |
|-----------|-----|-----|
| API Servers | 5 min | N/A |
| Database | 15 min | 4 hours |
| Redis Cache | 5 min | 1 hour |
| File Storage | 30 min | 24 hours |

---

## Security Checklist

- [ ] TLS 1.3 enabled for all connections
- [ ] API keys hashed before storage
- [ ] Webhook signatures verified
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output escaping)
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Tenant isolation enforced
- [ ] Sensitive data encrypted at rest
- [ ] Audit logging enabled
- [ ] Regular security updates
- [ ] Penetration testing scheduled
- [ ] GDPR/POPIA compliance documented
- [ ] Backup and recovery tested

---

## Next Steps

- See [MVP Roadmap](./11-MVP-ROADMAP.md) for implementation timeline
