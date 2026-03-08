# Integration Engine

## Overview

The Integration Engine provides a standardized interface for connecting external systems: commerce platforms (Shopify, Magento, WooCommerce), payment gateways (Paystack, Flutterwave, Stripe), ERP systems, and CRMs. It abstracts away the complexity of different APIs behind unified internal interfaces.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              INTEGRATION ENGINE                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                     Unified Integration Interface                              │ │
│   │                                                                                │ │
│   │   Commerce Interface     Payment Interface     ERP Interface     CRM Interface│ │
│   │   ─────────────────     ─────────────────     ─────────────     ─────────────│ │
│   │   • fetchProducts()     • createPayment()     • syncOrder()     • syncCustomer│ │
│   │   • getProduct()        • verifyPayment()     • getStock()      • getCustomer()│ │
│   │   • syncInventory()     • refund()            • updateStock()   • createLead() │ │
│   │   • createOrder()       • getTransaction()    • getOrder()      • updateContact│ │
│   └───────────────────────────────────────────────────────────────────────────────┘ │
│                                           │                                          │
│                                           ▼                                          │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                        Adapter Factory                                         │ │
│   │                                                                                │ │
│   │   Creates appropriate adapter based on tenant configuration                   │ │
│   │   Manages adapter lifecycle and connection pooling                            │ │
│   └───────────────────────────────────────────────────────────────────────────────┘ │
│                                           │                                          │
│         ┌─────────────────────────────────┼─────────────────────────────────┐       │
│         │                │                │                │                │       │
│         ▼                ▼                ▼                ▼                ▼       │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   │
│   │ Commerce  │   │ Payment   │   │ ERP       │   │ CRM       │   │ Custom    │   │
│   │ Adapters  │   │ Adapters  │   │ Adapters  │   │ Adapters  │   │ Adapters  │   │
│   │           │   │           │   │           │   │           │   │           │   │
│   │ • Shopify │   │ • Paystack│   │ • Generic │   │ • HubSpot │   │ • REST    │   │
│   │ • Magento │   │ • Flutter │   │ • SAP     │   │ • Salesforce   │ • GraphQL │   │
│   │ • Woo     │   │ • Stripe  │   │ • Custom  │   │ • Custom  │   │ • SOAP    │   │
│   │ • Custom  │   │           │   │           │   │           │   │           │   │
│   └───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘   │
│         │                │                │                │                │       │
│         └────────────────┴────────────────┴────────────────┴────────────────┘       │
│                                           │                                          │
│                                           ▼                                          │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                        Connection Manager                                      │ │
│   │                                                                                │ │
│   │   • Credential encryption/decryption                                          │ │
│   │   • Connection pooling                                                         │ │
│   │   • Rate limiting per API                                                      │ │
│   │   • Retry with exponential backoff                                            │ │
│   │   • Circuit breaker for failing services                                      │ │
│   └───────────────────────────────────────────────────────────────────────────────┘ │
│                                           │                                          │
│                                           ▼                                          │
│   ┌───────────────────────────────────────────────────────────────────────────────┐ │
│   │                        Sync Manager                                            │ │
│   │                                                                                │ │
│   │   • Scheduled sync jobs                                                        │ │
│   │   • Webhook handlers                                                           │ │
│   │   • Conflict resolution                                                        │ │
│   │   • Sync status tracking                                                       │ │
│   └───────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Unified Interfaces

### Commerce Interface

```php
<?php

namespace App\Engines\Integration\Contracts;

interface CommerceAdapterInterface
{
    /**
     * Fetch products from external system
     */
    public function fetchProducts(
        array $filters = [],
        int $page = 1,
        int $perPage = 50
    ): ProductCollection;

    /**
     * Get single product by external ID
     */
    public function getProduct(string $externalId): ?ExternalProduct;

    /**
     * Sync product to our database
     */
    public function syncProduct(string $externalId): Product;

    /**
     * Fetch all products and sync
     */
    public function syncAllProducts(): SyncResult;

    /**
     * Get inventory levels
     */
    public function getInventory(array $productIds = []): array;

    /**
     * Update inventory after order
     */
    public function updateInventory(
        string $productId,
        int $quantityChange,
        string $reason
    ): bool;

    /**
     * Create order in external system
     */
    public function createOrder(Order $order): ExternalOrder;

    /**
     * Update order status in external system
     */
    public function updateOrderStatus(
        string $externalOrderId,
        string $status
    ): bool;

    /**
     * Get order from external system
     */
    public function getOrder(string $externalOrderId): ?ExternalOrder;

    /**
     * Test connection
     */
    public function testConnection(): ConnectionTestResult;
}
```

### Payment Interface

```php
<?php

namespace App\Engines\Integration\Contracts;

interface PaymentAdapterInterface
{
    /**
     * Create payment / initialize transaction
     */
    public function createPayment(PaymentRequest $request): PaymentInitiation;

    /**
     * Verify payment status
     */
    public function verifyPayment(string $reference): PaymentVerification;

    /**
     * Process refund
     */
    public function refund(RefundRequest $request): RefundResult;

    /**
     * Get transaction details
     */
    public function getTransaction(string $reference): ?Transaction;

    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature(
        string $payload,
        string $signature
    ): bool;

    /**
     * Parse webhook payload
     */
    public function parseWebhook(array $payload): WebhookEvent;

    /**
     * Get supported currencies
     */
    public function getSupportedCurrencies(): array;

    /**
     * Test connection
     */
    public function testConnection(): ConnectionTestResult;
}
```

### ERP Interface

```php
<?php

namespace App\Engines\Integration\Contracts;

interface ERPAdapterInterface
{
    /**
     * Sync order to ERP
     */
    public function syncOrder(Order $order): ERPSyncResult;

    /**
     * Get inventory from ERP
     */
    public function getInventory(array $skus = []): array;

    /**
     * Update inventory in ERP
     */
    public function updateInventory(
        string $sku,
        int $quantity,
        string $reason
    ): bool;

    /**
     * Get customer from ERP
     */
    public function getCustomer(string $identifier): ?ERPCustomer;

    /**
     * Sync customer to ERP
     */
    public function syncCustomer(Customer $customer): ERPSyncResult;

    /**
     * Get pricing from ERP
     */
    public function getPricing(array $skus, ?string $customerId = null): array;

    /**
     * Get order status from ERP
     */
    public function getOrderStatus(string $erpOrderId): OrderStatus;

    /**
     * Test connection
     */
    public function testConnection(): ConnectionTestResult;
}
```

### CRM Interface

```php
<?php

namespace App\Engines\Integration\Contracts;

interface CRMAdapterInterface
{
    /**
     * Create or update contact
     */
    public function upsertContact(Customer $customer): CRMContact;

    /**
     * Get contact by identifier
     */
    public function getContact(string $identifier): ?CRMContact;

    /**
     * Create deal/opportunity
     */
    public function createDeal(Order $order): CRMDeal;

    /**
     * Update deal status
     */
    public function updateDeal(string $dealId, array $data): CRMDeal;

    /**
     * Log activity/note
     */
    public function logActivity(
        string $contactId,
        string $type,
        string $content
    ): bool;

    /**
     * Sync conversation as activity
     */
    public function syncConversation(Conversation $conversation): bool;

    /**
     * Test connection
     */
    public function testConnection(): ConnectionTestResult;
}
```

---

## Adapter Implementations

### Shopify Adapter

```php
<?php

namespace App\Engines\Integration\Adapters\Commerce;

class ShopifyAdapter implements CommerceAdapterInterface
{
    private ShopifyClient $client;
    private string $shopDomain;
    private string $accessToken;

    public function __construct(array $config)
    {
        $this->shopDomain = $config['shop_domain'];
        $this->accessToken = $config['access_token'];
        $this->client = new ShopifyClient([
            'base_uri' => "https://{$this->shopDomain}/admin/api/2024-01/",
            'headers' => [
                'X-Shopify-Access-Token' => $this->accessToken,
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    public function fetchProducts(
        array $filters = [],
        int $page = 1,
        int $perPage = 50
    ): ProductCollection {
        $response = $this->client->get('products.json', [
            'query' => [
                'limit' => $perPage,
                'page_info' => $page > 1 ? $this->getPageInfo($page) : null,
                ...($filters['status'] ?? ['status' => 'active']),
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        return new ProductCollection(
            array_map(fn($p) => $this->mapProduct($p), $data['products']),
            $this->extractNextPage($response)
        );
    }

    public function getProduct(string $externalId): ?ExternalProduct
    {
        try {
            $response = $this->client->get("products/{$externalId}.json");
            $data = json_decode($response->getBody(), true);
            return $this->mapProduct($data['product']);
        } catch (ClientException $e) {
            if ($e->getResponse()->getStatusCode() === 404) {
                return null;
            }
            throw $e;
        }
    }

    public function getInventory(array $productIds = []): array
    {
        $inventoryItemIds = $this->getInventoryItemIds($productIds);
        
        $response = $this->client->get('inventory_levels.json', [
            'query' => [
                'inventory_item_ids' => implode(',', $inventoryItemIds),
            ],
        ]);

        $data = json_decode($response->getBody(), true);
        
        return $this->mapInventoryLevels($data['inventory_levels']);
    }

    public function createOrder(Order $order): ExternalOrder
    {
        $response = $this->client->post('orders.json', [
            'json' => [
                'order' => $this->mapOrderToShopify($order),
            ],
        ]);

        $data = json_decode($response->getBody(), true);
        return $this->mapExternalOrder($data['order']);
    }

    private function mapProduct(array $shopifyProduct): ExternalProduct
    {
        return new ExternalProduct([
            'external_id' => (string) $shopifyProduct['id'],
            'name' => $shopifyProduct['title'],
            'description' => $shopifyProduct['body_html'],
            'price' => $shopifyProduct['variants'][0]['price'] ?? 0,
            'sku' => $shopifyProduct['variants'][0]['sku'] ?? null,
            'images' => array_map(fn($i) => $i['src'], $shopifyProduct['images']),
            'variants' => array_map(fn($v) => $this->mapVariant($v), $shopifyProduct['variants']),
            'status' => $shopifyProduct['status'],
            'vendor' => $shopifyProduct['vendor'],
            'product_type' => $shopifyProduct['product_type'],
            'tags' => explode(', ', $shopifyProduct['tags'] ?? ''),
            'raw' => $shopifyProduct,
        ]);
    }
}
```

### Paystack Adapter

```php
<?php

namespace App\Engines\Integration\Adapters\Payment;

class PaystackAdapter implements PaymentAdapterInterface
{
    private const BASE_URL = 'https://api.paystack.co';
    private HttpClient $client;
    private string $secretKey;

    public function __construct(array $config)
    {
        $this->secretKey = $config['secret_key'];
        $this->client = new HttpClient([
            'base_uri' => self::BASE_URL,
            'headers' => [
                'Authorization' => "Bearer {$this->secretKey}",
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    public function createPayment(PaymentRequest $request): PaymentInitiation
    {
        $response = $this->client->post('/transaction/initialize', [
            'json' => [
                'amount' => $request->amount * 100, // Paystack uses kobo/cents
                'email' => $request->customerEmail,
                'reference' => $request->reference,
                'callback_url' => $request->callbackUrl,
                'metadata' => [
                    'order_id' => $request->orderId,
                    'tenant_id' => $request->tenantId,
                    'custom_fields' => $request->metadata,
                ],
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        if (!$data['status']) {
            throw new PaymentInitializationException($data['message']);
        }

        return new PaymentInitiation([
            'reference' => $data['data']['reference'],
            'payment_url' => $data['data']['authorization_url'],
            'access_code' => $data['data']['access_code'],
        ]);
    }

    public function verifyPayment(string $reference): PaymentVerification
    {
        $response = $this->client->get("/transaction/verify/{$reference}");
        $data = json_decode($response->getBody(), true);

        return new PaymentVerification([
            'reference' => $data['data']['reference'],
            'status' => $this->mapStatus($data['data']['status']),
            'amount' => $data['data']['amount'] / 100,
            'currency' => $data['data']['currency'],
            'paid_at' => $data['data']['paid_at'] ? Carbon::parse($data['data']['paid_at']) : null,
            'channel' => $data['data']['channel'],
            'gateway_response' => $data['data']['gateway_response'],
            'customer_email' => $data['data']['customer']['email'],
            'metadata' => $data['data']['metadata'],
            'raw' => $data['data'],
        ]);
    }

    public function refund(RefundRequest $request): RefundResult
    {
        $response = $this->client->post('/refund', [
            'json' => [
                'transaction' => $request->transactionReference,
                'amount' => $request->amount ? $request->amount * 100 : null,
                'merchant_note' => $request->reason,
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        return new RefundResult([
            'reference' => $data['data']['transaction']['reference'],
            'status' => $data['data']['status'],
            'amount' => $data['data']['amount'] / 100,
        ]);
    }

    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $computed = hash_hmac('sha512', $payload, $this->secretKey);
        return hash_equals($computed, $signature);
    }

    public function parseWebhook(array $payload): WebhookEvent
    {
        return new WebhookEvent([
            'event' => $payload['event'],
            'reference' => $payload['data']['reference'],
            'status' => $this->mapStatus($payload['data']['status']),
            'amount' => $payload['data']['amount'] / 100,
            'metadata' => $payload['data']['metadata'],
            'raw' => $payload,
        ]);
    }

    private function mapStatus(string $paystackStatus): string
    {
        return match($paystackStatus) {
            'success' => 'successful',
            'failed', 'abandoned' => 'failed',
            'pending' => 'pending',
            default => 'unknown',
        };
    }
}
```

### Flutterwave Adapter

```php
<?php

namespace App\Engines\Integration\Adapters\Payment;

class FlutterwaveAdapter implements PaymentAdapterInterface
{
    private const BASE_URL = 'https://api.flutterwave.com/v3';
    private HttpClient $client;
    private string $secretKey;

    public function __construct(array $config)
    {
        $this->secretKey = $config['secret_key'];
        $this->client = new HttpClient([
            'base_uri' => self::BASE_URL,
            'headers' => [
                'Authorization' => "Bearer {$this->secretKey}",
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    public function createPayment(PaymentRequest $request): PaymentInitiation
    {
        $response = $this->client->post('/payments', [
            'json' => [
                'tx_ref' => $request->reference,
                'amount' => $request->amount,
                'currency' => $request->currency ?? 'NGN',
                'redirect_url' => $request->callbackUrl,
                'customer' => [
                    'email' => $request->customerEmail,
                    'phonenumber' => $request->customerPhone,
                    'name' => $request->customerName,
                ],
                'meta' => [
                    'order_id' => $request->orderId,
                    'tenant_id' => $request->tenantId,
                ],
                'customizations' => [
                    'title' => $request->businessName ?? 'Payment',
                    'logo' => $request->logoUrl,
                ],
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        return new PaymentInitiation([
            'reference' => $request->reference,
            'payment_url' => $data['data']['link'],
        ]);
    }

    public function verifyPayment(string $reference): PaymentVerification
    {
        $response = $this->client->get("/transactions/verify_by_reference", [
            'query' => ['tx_ref' => $reference],
        ]);

        $data = json_decode($response->getBody(), true);
        $txn = $data['data'];

        return new PaymentVerification([
            'reference' => $txn['tx_ref'],
            'status' => $this->mapStatus($txn['status']),
            'amount' => $txn['amount'],
            'currency' => $txn['currency'],
            'paid_at' => Carbon::parse($txn['created_at']),
            'channel' => $txn['payment_type'],
            'gateway_response' => $txn['processor_response'],
            'customer_email' => $txn['customer']['email'],
            'raw' => $txn,
        ]);
    }

    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        return $signature === config('integrations.flutterwave.webhook_secret');
    }

    private function mapStatus(string $flwStatus): string
    {
        return match($flwStatus) {
            'successful' => 'successful',
            'failed' => 'failed',
            'pending' => 'pending',
            default => 'unknown',
        };
    }
}
```

### Stripe Adapter

```php
<?php

namespace App\Engines\Integration\Adapters\Payment;

use Stripe\StripeClient;

class StripeAdapter implements PaymentAdapterInterface
{
    private StripeClient $stripe;

    public function __construct(array $config)
    {
        $this->stripe = new StripeClient($config['secret_key']);
    }

    public function createPayment(PaymentRequest $request): PaymentInitiation
    {
        $session = $this->stripe->checkout->sessions->create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($request->currency ?? 'usd'),
                    'product_data' => [
                        'name' => "Order {$request->orderId}",
                    ],
                    'unit_amount' => (int) ($request->amount * 100),
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => $request->callbackUrl . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $request->cancelUrl ?? $request->callbackUrl,
            'metadata' => [
                'order_id' => $request->orderId,
                'tenant_id' => $request->tenantId,
                'reference' => $request->reference,
            ],
        ]);

        return new PaymentInitiation([
            'reference' => $request->reference,
            'payment_url' => $session->url,
            'session_id' => $session->id,
        ]);
    }

    public function verifyPayment(string $reference): PaymentVerification
    {
        // Find payment intent by metadata
        $sessions = $this->stripe->checkout->sessions->all([
            'limit' => 1,
        ]);

        // Find by reference in metadata
        foreach ($sessions->data as $session) {
            if (($session->metadata['reference'] ?? null) === $reference) {
                return new PaymentVerification([
                    'reference' => $reference,
                    'status' => $this->mapStatus($session->payment_status),
                    'amount' => $session->amount_total / 100,
                    'currency' => strtoupper($session->currency),
                    'customer_email' => $session->customer_details->email ?? null,
                    'raw' => $session->toArray(),
                ]);
            }
        }

        throw new PaymentNotFoundException($reference);
    }

    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        try {
            \Stripe\Webhook::constructEvent(
                $payload,
                $signature,
                config('integrations.stripe.webhook_secret')
            );
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function mapStatus(string $stripeStatus): string
    {
        return match($stripeStatus) {
            'paid' => 'successful',
            'unpaid' => 'pending',
            'no_payment_required' => 'successful',
            default => 'unknown',
        };
    }
}
```

---

## Adapter Factory

```php
<?php

namespace App\Engines\Integration;

class AdapterFactory
{
    /**
     * Create commerce adapter for tenant
     */
    public function createCommerceAdapter(Tenant $tenant): CommerceAdapterInterface
    {
        $config = $tenant->getIntegration('commerce');

        return match($config['provider']) {
            'shopify' => new ShopifyAdapter($config['credentials']),
            'magento' => new MagentoAdapter($config['credentials']),
            'woocommerce' => new WooCommerceAdapter($config['credentials']),
            'custom' => new CustomCommerceAdapter($config['credentials']),
            default => new InternalCommerceAdapter($tenant->id),
        };
    }

    /**
     * Create payment adapter for tenant
     */
    public function createPaymentAdapter(
        Tenant $tenant,
        ?string $gateway = null
    ): PaymentAdapterInterface {
        $gateway = $gateway ?? $tenant->getDefaultPaymentGateway();
        $config = $tenant->getPaymentConfig($gateway);

        return match($gateway) {
            'paystack' => new PaystackAdapter($config),
            'flutterwave' => new FlutterwaveAdapter($config),
            'stripe' => new StripeAdapter($config),
            default => throw new UnsupportedGatewayException($gateway),
        };
    }

    /**
     * Create ERP adapter for tenant
     */
    public function createERPAdapter(Tenant $tenant): ?ERPAdapterInterface
    {
        $config = $tenant->getIntegration('erp');

        if (!$config) {
            return null;
        }

        return match($config['provider']) {
            'sap' => new SAPAdapter($config['credentials']),
            'custom_api' => new CustomERPAdapter($config['credentials']),
            default => null,
        };
    }

    /**
     * Create CRM adapter for tenant
     */
    public function createCRMAdapter(Tenant $tenant): ?CRMAdapterInterface
    {
        $config = $tenant->getIntegration('crm');

        if (!$config) {
            return null;
        }

        return match($config['provider']) {
            'hubspot' => new HubSpotAdapter($config['credentials']),
            'salesforce' => new SalesforceAdapter($config['credentials']),
            'custom' => new CustomCRMAdapter($config['credentials']),
            default => null,
        };
    }
}
```

---

## Connection Manager

```php
<?php

namespace App\Engines\Integration;

class ConnectionManager
{
    private EncryptionService $encryption;
    private CircuitBreaker $circuitBreaker;

    /**
     * Get decrypted credentials for integration
     */
    public function getCredentials(string $tenantId, string $integrationType): array
    {
        $integration = TenantIntegration::where('tenant_id', $tenantId)
            ->where('type', $integrationType)
            ->first();

        if (!$integration) {
            throw new IntegrationNotConfiguredException($integrationType);
        }

        return $this->encryption->decrypt($integration->credentials);
    }

    /**
     * Store encrypted credentials
     */
    public function storeCredentials(
        string $tenantId,
        string $integrationType,
        array $credentials
    ): void {
        TenantIntegration::updateOrCreate(
            ['tenant_id' => $tenantId, 'type' => $integrationType],
            [
                'credentials' => $this->encryption->encrypt($credentials),
                'status' => 'active',
            ]
        );
    }

    /**
     * Execute with circuit breaker
     */
    public function executeWithCircuitBreaker(
        string $service,
        callable $operation
    ): mixed {
        if ($this->circuitBreaker->isOpen($service)) {
            throw new ServiceUnavailableException($service);
        }

        try {
            $result = $operation();
            $this->circuitBreaker->recordSuccess($service);
            return $result;
        } catch (\Exception $e) {
            $this->circuitBreaker->recordFailure($service);
            throw $e;
        }
    }

    /**
     * Execute with retry
     */
    public function executeWithRetry(
        callable $operation,
        int $maxAttempts = 3,
        int $delayMs = 1000
    ): mixed {
        $attempts = 0;
        $lastException = null;

        while ($attempts < $maxAttempts) {
            try {
                return $operation();
            } catch (RetryableException $e) {
                $lastException = $e;
                $attempts++;
                
                if ($attempts < $maxAttempts) {
                    usleep($delayMs * 1000 * pow(2, $attempts - 1)); // Exponential backoff
                }
            }
        }

        throw $lastException;
    }
}
```

---

## Sync Manager

```php
<?php

namespace App\Engines\Integration;

class SyncManager
{
    /**
     * Sync products from external commerce platform
     */
    public function syncProducts(string $tenantId): SyncResult
    {
        $adapter = $this->adapterFactory->createCommerceAdapter(
            Tenant::find($tenantId)
        );

        $synced = 0;
        $failed = 0;
        $page = 1;

        do {
            $products = $adapter->fetchProducts([], $page, 50);

            foreach ($products->items as $externalProduct) {
                try {
                    $this->syncProduct($tenantId, $externalProduct);
                    $synced++;
                } catch (\Exception $e) {
                    $failed++;
                    Log::error("Product sync failed", [
                        'tenant_id' => $tenantId,
                        'external_id' => $externalProduct->external_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $page++;
        } while ($products->hasMore);

        return new SyncResult($synced, $failed);
    }

    /**
     * Sync inventory levels
     */
    public function syncInventory(string $tenantId): SyncResult
    {
        $adapter = $this->adapterFactory->createCommerceAdapter(
            Tenant::find($tenantId)
        );

        $products = Product::where('tenant_id', $tenantId)
            ->whereNotNull('external_id')
            ->get();

        $externalIds = $products->pluck('external_id')->toArray();
        $inventoryLevels = $adapter->getInventory($externalIds);

        $synced = 0;
        foreach ($inventoryLevels as $externalId => $level) {
            Inventory::where('tenant_id', $tenantId)
                ->whereHas('product', fn($q) => $q->where('external_id', $externalId))
                ->update([
                    'quantity' => $level['quantity'],
                    'last_sync_at' => now(),
                ]);
            $synced++;
        }

        return new SyncResult($synced, 0);
    }

    /**
     * Sync order to ERP
     */
    public function syncOrderToERP(Order $order): ERPSyncResult
    {
        $erpAdapter = $this->adapterFactory->createERPAdapter($order->tenant);

        if (!$erpAdapter) {
            return ERPSyncResult::skipped('No ERP configured');
        }

        try {
            $result = $erpAdapter->syncOrder($order);

            $order->update([
                'erp_order_id' => $result->externalId,
                'erp_synced' => true,
                'erp_synced_at' => now(),
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error("ERP sync failed", [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            // Queue for retry
            SyncOrderToERP::dispatch($order)->delay(now()->addMinutes(5));

            return ERPSyncResult::failed($e->getMessage());
        }
    }
}
```

---

## Database Schema

```sql
-- Tenant Integrations
CREATE TABLE tenant_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    type VARCHAR(50) NOT NULL, -- 'commerce', 'payment', 'erp', 'crm'
    provider VARCHAR(50) NOT NULL, -- 'shopify', 'paystack', etc.
    
    credentials BYTEA NOT NULL, -- Encrypted credentials
    config JSONB DEFAULT '{}', -- Non-sensitive configuration
    
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, error
    last_sync_at TIMESTAMP,
    last_error TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, type, provider),
    INDEX idx_integrations_tenant (tenant_id)
);

-- Webhook Endpoints (for external systems to call us)
CREATE TABLE integration_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    integration_id UUID NOT NULL REFERENCES tenant_integrations(id),
    
    endpoint_path VARCHAR(255) NOT NULL UNIQUE, -- /webhooks/tenant/{uuid}/shopify
    secret VARCHAR(255) NOT NULL,
    
    events JSONB DEFAULT '[]', -- ['orders/create', 'inventory/update']
    
    is_active BOOLEAN DEFAULT TRUE,
    last_received_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_webhooks_tenant (tenant_id),
    INDEX idx_webhooks_path (endpoint_path)
);

-- Sync Jobs
CREATE TABLE sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    integration_id UUID NOT NULL REFERENCES tenant_integrations(id),
    
    type VARCHAR(50) NOT NULL, -- 'full_sync', 'incremental', 'single_entity'
    entity_type VARCHAR(50), -- 'products', 'inventory', 'orders'
    entity_id VARCHAR(255), -- For single entity syncs
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    
    records_processed INT DEFAULT 0,
    records_succeeded INT DEFAULT 0,
    records_failed INT DEFAULT 0,
    
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    error_log JSONB DEFAULT '[]',
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_sync_jobs_tenant (tenant_id),
    INDEX idx_sync_jobs_status (status)
);

-- External ID Mapping
CREATE TABLE external_id_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    integration_id UUID NOT NULL REFERENCES tenant_integrations(id),
    
    entity_type VARCHAR(50) NOT NULL, -- 'product', 'order', 'customer'
    internal_id UUID NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, integration_id, entity_type, external_id),
    INDEX idx_mappings_internal (internal_id),
    INDEX idx_mappings_external (external_id)
);
```

---

## Configuration

```php
// config/integrations.php

return [
    'commerce' => [
        'shopify' => [
            'api_version' => '2024-01',
            'scopes' => [
                'read_products',
                'write_products',
                'read_inventory',
                'write_inventory',
                'read_orders',
                'write_orders',
            ],
        ],
        'woocommerce' => [
            'api_version' => 'wc/v3',
        ],
    ],

    'payments' => [
        'paystack' => [
            'base_url' => 'https://api.paystack.co',
            'webhook_ip_whitelist' => ['52.31.139.75', '52.49.173.169'],
        ],
        'flutterwave' => [
            'base_url' => 'https://api.flutterwave.com/v3',
        ],
        'stripe' => [
            'api_version' => '2023-10-16',
        ],
    ],

    'sync' => [
        'default_schedule' => 'hourly', // For full syncs
        'max_concurrent_syncs' => 5,
        'retry_failed_after_minutes' => 30,
    ],

    'circuit_breaker' => [
        'failure_threshold' => 5,
        'recovery_time_seconds' => 60,
    ],
];
```

---

## Next Steps

Continue to: [Tenant Engine →](06-TENANT-ENGINE.md)
