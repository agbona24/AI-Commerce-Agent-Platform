# Transaction Engine

## Overview

The Transaction Engine handles all commercial operations within the platform: cart management, order creation, invoice generation, payment processing, and ERP synchronization. It ensures reliable, idempotent operations with full audit logging.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              TRANSACTION ENGINE                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                        Transaction Orchestrator                                │  │
│  │        (Coordinates all transaction operations, ensures consistency)          │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                            │                                         │
│      ┌────────────────┬────────────────────┼────────────────────┬─────────────────┐ │
│      │                │                    │                    │                 │ │
│      ▼                ▼                    ▼                    ▼                 │ │
│  ┌──────────┐   ┌──────────┐        ┌──────────┐         ┌─────────────┐         │ │
│  │   Cart   │   │  Order   │        │ Invoice  │         │  Payment    │         │ │
│  │ Service  │   │ Service  │        │ Service  │         │  Service    │         │ │
│  │          │   │          │        │          │         │             │         │ │
│  │• create  │   │• create  │        │• generate│         │• createLink │         │ │
│  │• addItem │   │• update  │        │• send    │         │• verify     │         │ │
│  │• update  │   │• cancel  │        │• void    │         │• refund     │         │ │
│  │• clear   │   │• fulfill │        │• download│         │• webhook    │         │ │
│  └──────────┘   └──────────┘        └──────────┘         └─────────────┘         │ │
│       │              │                   │                     │                  │ │
│       └──────────────┴───────────────────┴─────────────────────┘                  │ │
│                                          │                                         │ │
│                                          ▼                                         │ │
│  ┌───────────────────────────────────────────────────────────────────────────────┐ │
│  │                           Webhook Handler                                      │ │
│  │                                                                                │ │
│  │  • Payment confirmation (Paystack, Flutterwave, Stripe)                       │ │
│  │  • Idempotency key validation                                                  │ │
│  │  • Signature verification                                                      │ │
│  │  • Retry handling                                                              │ │
│  └───────────────────────────────────────────────────────────────────────────────┘ │
│                                          │                                         │ │
│                                          ▼                                         │ │
│  ┌───────────────────────────────────────────────────────────────────────────────┐ │
│  │                           Audit Logger                                         │ │
│  │                                                                                │ │
│  │  • All cart operations                                                         │ │
│  │  • Order state changes                                                         │ │
│  │  • Payment events                                                              │ │
│  │  • ERP sync events                                                             │ │
│  └───────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Transaction Flow

### Complete Order Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ORDER LIFECYCLE                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   CART PHASE                                                                         │
│   ┌────────────────────────────────────────────────────────────────────────────┐    │
│   │  Customer: "Add iPhone 14 Pro 128GB to my cart"                            │    │
│   │                          │                                                  │    │
│   │    ┌─────────────────────▼─────────────────────┐                           │    │
│   │    │  CartService.addItem()                    │                           │    │
│   │    │  • Validate product exists                │                           │    │
│   │    │  • Check stock availability               │                           │    │
│   │    │  • Add to cart (Redis + DB)               │                           │    │
│   │    │  • Calculate totals                       │                           │    │
│   │    └───────────────────────────────────────────┘                           │    │
│   └────────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                               │
│                                      ▼                                               │
│   ORDER PHASE                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────┐    │
│   │  Customer: "I want to checkout"                                            │    │
│   │                          │                                                  │    │
│   │    ┌─────────────────────▼─────────────────────┐                           │    │
│   │    │  OrderService.createFromCart()            │                           │    │
│   │    │  • Lock cart                              │                           │    │
│   │    │  • Reserve inventory                      │                           │    │
│   │    │  • Create order record                    │                           │    │
│   │    │  • Generate order number                  │                           │    │
│   │    │  • Set status: PENDING_PAYMENT            │                           │    │
│   │    └───────────────────────────────────────────┘                           │    │
│   └────────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                               │
│                                      ▼                                               │
│   INVOICE PHASE                                                                      │
│   ┌────────────────────────────────────────────────────────────────────────────┐    │
│   │    ┌─────────────────────────────────────────────┐                         │    │
│   │    │  InvoiceService.generate()                  │                         │    │
│   │    │  • Create invoice record                    │                         │    │
│   │    │  • Generate invoice number                  │                         │    │
│   │    │  • Calculate taxes                          │                         │    │
│   │    │  • Generate PDF                             │                         │    │
│   │    └─────────────────────────────────────────────┘                         │    │
│   └────────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                               │
│                                      ▼                                               │
│   PAYMENT PHASE                                                                      │
│   ┌────────────────────────────────────────────────────────────────────────────┐    │
│   │    ┌─────────────────────────────────────────────┐                         │    │
│   │    │  PaymentService.createPaymentLink()         │                         │    │
│   │    │  • Call payment gateway API                 │                         │    │
│   │    │  • Generate unique payment reference        │                         │    │
│   │    │  • Store payment intent                     │                         │    │
│   │    │  • Return payment URL                       │                         │    │
│   │    └─────────────────────────────────────────────┘                         │    │
│   │                             │                                               │    │
│   │                             ▼                                               │    │
│   │    AI sends payment link via WhatsApp                                       │    │
│   │    Customer clicks link → Pays on gateway                                   │    │
│   │                             │                                               │    │
│   │                             ▼                                               │    │
│   │    ┌─────────────────────────────────────────────┐                         │    │
│   │    │  WebhookHandler.handlePaymentConfirmation() │                         │    │
│   │    │  • Verify signature                         │                         │    │
│   │    │  • Check idempotency                        │                         │    │
│   │    │  • Update payment status                    │                         │    │
│   │    │  • Trigger order completion                 │                         │    │
│   │    └─────────────────────────────────────────────┘                         │    │
│   └────────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                               │
│                                      ▼                                               │
│   COMPLETION PHASE                                                                   │
│   ┌────────────────────────────────────────────────────────────────────────────┐    │
│   │    ┌─────────────────────────────────────────────┐                         │    │
│   │    │  OrderService.markAsPaid()                  │                         │    │
│   │    │  • Update order status: PAID                │                         │    │
│   │    │  • Commit inventory reservation             │                         │    │
│   │    │  • Sync to ERP                              │                         │    │
│   │    │  • Generate receipt                         │                         │    │
│   │    │  • Send confirmation via WhatsApp           │                         │    │
│   │    └─────────────────────────────────────────────┘                         │    │
│   └────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Service Specifications

### 1. CartService

```php
<?php

namespace App\Engines\Transaction\Services;

use App\Engines\Transaction\DTOs\Cart;
use App\Engines\Transaction\DTOs\CartItem;

class CartService
{
    /**
     * Get or create cart for a conversation/customer
     */
    public function getOrCreateCart(
        string $tenantId,
        string $conversationId,
        ?string $customerId = null
    ): Cart;

    /**
     * Add item to cart
     * 
     * @throws ProductNotFoundException
     * @throws InsufficientStockException
     */
    public function addItem(
        string $cartId,
        string $productId,
        ?string $variantId,
        int $quantity
    ): Cart;

    /**
     * Update item quantity
     */
    public function updateItemQuantity(
        string $cartId,
        string $itemId,
        int $quantity
    ): Cart;

    /**
     * Remove item from cart
     */
    public function removeItem(
        string $cartId,
        string $itemId
    ): Cart;

    /**
     * Apply discount/coupon code
     */
    public function applyDiscount(
        string $cartId,
        string $couponCode
    ): Cart;

    /**
     * Clear cart
     */
    public function clearCart(string $cartId): void;

    /**
     * Get cart summary for AI response
     */
    public function getCartSummary(string $cartId): array;

    /**
     * Lock cart for checkout
     */
    public function lockForCheckout(string $cartId): bool;
}
```

**Cart DTO:**

```php
class Cart
{
    public string $id;
    public string $tenantId;
    public string $conversationId;
    public ?string $customerId;
    public array $items; // CartItem[]
    public float $subtotal;
    public float $discount;
    public float $tax;
    public float $total;
    public string $currency;
    public ?string $couponCode;
    public string $status; // 'active', 'locked', 'converted', 'abandoned'
    public Carbon $createdAt;
    public Carbon $updatedAt;
}

class CartItem
{
    public string $id;
    public string $productId;
    public ?string $variantId;
    public string $productName;
    public ?string $variantName;
    public int $quantity;
    public float $unitPrice;
    public float $lineTotal;
    public ?string $imageUrl;
}
```

### 2. OrderService

```php
<?php

namespace App\Engines\Transaction\Services;

class OrderService
{
    /**
     * Create order from cart
     * 
     * @throws CartEmptyException
     * @throws CartLockedException
     * @throws InsufficientStockException
     */
    public function createFromCart(
        string $cartId,
        array $customerInfo,
        ?array $shippingAddress = null
    ): Order;

    /**
     * Create order directly (without cart)
     */
    public function createDirect(
        string $tenantId,
        string $conversationId,
        array $items, // [['product_id', 'variant_id', 'quantity']]
        array $customerInfo,
        ?array $shippingAddress = null
    ): Order;

    /**
     * Get order by ID
     */
    public function getOrder(string $tenantId, string $orderId): ?Order;

    /**
     * Get order by order number
     */
    public function getOrderByNumber(string $tenantId, string $orderNumber): ?Order;

    /**
     * Update order status
     */
    public function updateStatus(
        string $orderId,
        string $status,
        ?string $reason = null
    ): Order;

    /**
     * Cancel order
     */
    public function cancel(string $orderId, string $reason): Order;

    /**
     * Mark order as paid (called by payment webhook)
     */
    public function markAsPaid(
        string $orderId,
        string $paymentReference,
        array $paymentDetails
    ): Order;

    /**
     * Get order status for AI response
     */
    public function getOrderStatusSummary(string $orderId): array;

    /**
     * Get customer's recent orders
     */
    public function getCustomerOrders(
        string $tenantId,
        string $customerId,
        int $limit = 10
    ): array;
}
```

**Order DTO:**

```php
class Order
{
    public string $id;
    public string $tenantId;
    public string $orderNumber; // Human-readable: ORD-2024-001234
    public string $conversationId;
    public ?string $customerId;
    
    public array $items; // OrderItem[]
    public float $subtotal;
    public float $discount;
    public float $tax;
    public float $shippingCost;
    public float $total;
    public string $currency;
    
    public array $customerInfo; // name, email, phone
    public ?array $shippingAddress;
    public ?array $billingAddress;
    
    public string $status;
    /*
     * Status values:
     * - pending_payment
     * - payment_processing
     * - paid
     * - processing
     * - shipped
     * - delivered
     * - cancelled
     * - refunded
     */
    
    public ?string $paymentReference;
    public ?string $invoiceId;
    public ?string $trackingNumber;
    
    public ?string $erpOrderId; // External ERP reference
    public bool $erpSynced;
    
    public Carbon $createdAt;
    public Carbon $updatedAt;
}
```

### 3. InvoiceService

```php
<?php

namespace App\Engines\Transaction\Services;

class InvoiceService
{
    /**
     * Generate invoice for order
     */
    public function generate(string $orderId): Invoice;

    /**
     * Get invoice
     */
    public function getInvoice(string $tenantId, string $invoiceId): ?Invoice;

    /**
     * Generate PDF
     */
    public function generatePDF(string $invoiceId): string; // Returns URL

    /**
     * Send invoice via channel (WhatsApp, email)
     */
    public function send(
        string $invoiceId,
        string $channel, // 'whatsapp', 'email'
        string $destination // phone or email
    ): bool;

    /**
     * Void invoice
     */
    public function void(string $invoiceId, string $reason): Invoice;

    /**
     * Generate receipt (post-payment)
     */
    public function generateReceipt(string $orderId): Receipt;
}
```

**Invoice DTO:**

```php
class Invoice
{
    public string $id;
    public string $tenantId;
    public string $invoiceNumber; // INV-2024-001234
    public string $orderId;
    
    public array $lineItems;
    public float $subtotal;
    public float $discount;
    public float $tax;
    public float $total;
    public string $currency;
    
    public array $customerInfo;
    public array $businessInfo; // From tenant settings
    
    public string $status; // 'draft', 'sent', 'paid', 'void'
    public ?string $pdfUrl;
    
    public Carbon $issuedAt;
    public Carbon $dueAt;
}
```

### 4. PaymentService

```php
<?php

namespace App\Engines\Transaction\Services;

class PaymentService
{
    /**
     * Create payment link for order
     */
    public function createPaymentLink(
        string $orderId,
        ?string $preferredGateway = null // 'paystack', 'flutterwave', 'stripe'
    ): PaymentLink;

    /**
     * Verify payment status
     */
    public function verifyPayment(
        string $paymentReference,
        string $gateway
    ): PaymentVerification;

    /**
     * Process refund
     */
    public function refund(
        string $orderId,
        float $amount,
        string $reason
    ): Refund;

    /**
     * Get payment status
     */
    public function getPaymentStatus(string $orderId): PaymentStatus;

    /**
     * Check if payment reference is already processed (idempotency)
     */
    public function isProcessed(string $paymentReference): bool;
}
```

**PaymentLink DTO:**

```php
class PaymentLink
{
    public string $id;
    public string $orderId;
    public string $gateway;
    public string $paymentUrl;
    public string $reference;
    public float $amount;
    public string $currency;
    public Carbon $expiresAt;
}
```

### 5. WebhookHandler

```php
<?php

namespace App\Engines\Transaction\Services;

class WebhookHandler
{
    /**
     * Handle incoming payment webhook
     */
    public function handlePaymentWebhook(
        string $gateway,
        array $payload,
        string $signature
    ): WebhookResult;

    /**
     * Verify webhook signature
     */
    private function verifySignature(
        string $gateway,
        array $payload,
        string $signature
    ): bool;

    /**
     * Check idempotency key
     */
    private function isAlreadyProcessed(string $idempotencyKey): bool;

    /**
     * Process successful payment
     */
    private function processSuccessfulPayment(
        string $orderId,
        string $reference,
        array $paymentDetails
    ): void;

    /**
     * Process failed payment
     */
    private function processFailedPayment(
        string $orderId,
        string $reference,
        string $reason
    ): void;
}
```

---

## Idempotency Design

### Payment Webhook Idempotency

```php
class IdempotencyService
{
    private const LOCK_TTL = 300; // 5 minutes

    /**
     * Attempt to acquire idempotency lock
     */
    public function acquireLock(string $key): bool
    {
        return Redis::set(
            "idempotency:{$key}",
            json_encode([
                'status' => 'processing',
                'timestamp' => now()->toIso8601String(),
            ]),
            'NX', // Only set if not exists
            'EX', self::LOCK_TTL
        );
    }

    /**
     * Mark operation as complete
     */
    public function markComplete(string $key, array $result): void
    {
        Redis::setex(
            "idempotency:{$key}",
            86400, // Keep for 24 hours
            json_encode([
                'status' => 'complete',
                'result' => $result,
                'timestamp' => now()->toIso8601String(),
            ])
        );
    }

    /**
     * Check if already processed
     */
    public function getExistingResult(string $key): ?array
    {
        $data = Redis::get("idempotency:{$key}");
        
        if (!$data) {
            return null;
        }

        $parsed = json_decode($data, true);
        
        if ($parsed['status'] === 'complete') {
            return $parsed['result'];
        }

        // Still processing - wait and retry
        throw new OperationInProgressException();
    }
}
```

### Webhook Processing Flow

```
Webhook Received
       │
       ▼
┌──────────────────┐
│ Verify Signature │
└────────┬─────────┘
         │ Valid
         ▼
┌──────────────────┐
│ Extract Key      │
│ (reference +     │
│  event_type)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│ Acquire Lock     │────▶│ Already Complete │
└────────┬─────────┘     │ Return 200 OK    │
         │ Lock acquired └──────────────────┘
         ▼
┌──────────────────┐
│ Process Payment  │
│ • Update order   │
│ • Commit stock   │
│ • Sync ERP       │
│ • Send receipt   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Mark Complete    │
│ Return 200 OK    │
└──────────────────┘
```

---

## Database Schema

```sql
-- Carts
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    conversation_id UUID NOT NULL,
    customer_id UUID REFERENCES customers(id),
    status VARCHAR(20) DEFAULT 'active', -- active, locked, converted, abandoned
    coupon_code VARCHAR(50),
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB DEFAULT '{}',
    locked_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_carts_tenant (tenant_id),
    INDEX idx_carts_conversation (conversation_id),
    INDEX idx_carts_customer (customer_id),
    INDEX idx_carts_status (status)
);

-- Cart Items
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_cart_items_cart (cart_id)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    conversation_id UUID NOT NULL,
    customer_id UUID REFERENCES customers(id),
    cart_id UUID REFERENCES carts(id),
    
    status VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
    -- pending_payment, payment_processing, paid, processing, 
    -- shipped, delivered, cancelled, refunded
    
    subtotal DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    
    shipping_address JSONB,
    billing_address JSONB,
    
    payment_gateway VARCHAR(50),
    payment_reference VARCHAR(255),
    payment_status VARCHAR(30),
    paid_at TIMESTAMP,
    
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    erp_order_id VARCHAR(100),
    erp_synced BOOLEAN DEFAULT FALSE,
    erp_synced_at TIMESTAMP,
    
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_orders_tenant (tenant_id),
    INDEX idx_orders_number (order_number),
    INDEX idx_orders_customer (customer_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_payment_ref (payment_reference),
    INDEX idx_orders_created (created_at DESC)
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    INDEX idx_order_items_order (order_id)
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES orders(id),
    
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, void
    
    subtotal DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    customer_info JSONB NOT NULL,
    business_info JSONB NOT NULL,
    line_items JSONB NOT NULL,
    
    pdf_url VARCHAR(500),
    
    issued_at TIMESTAMP DEFAULT NOW(),
    due_at TIMESTAMP,
    paid_at TIMESTAMP,
    voided_at TIMESTAMP,
    void_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_invoices_tenant (tenant_id),
    INDEX idx_invoices_order (order_id),
    INDEX idx_invoices_number (invoice_number)
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    
    gateway VARCHAR(50) NOT NULL, -- paystack, flutterwave, stripe
    reference VARCHAR(255) NOT NULL UNIQUE,
    gateway_reference VARCHAR(255),
    
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    
    status VARCHAR(30) NOT NULL, -- pending, successful, failed, refunded
    
    payment_url VARCHAR(500),
    payment_method VARCHAR(50), -- card, bank_transfer, ussd
    
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    
    gateway_response JSONB,
    metadata JSONB DEFAULT '{}',
    
    expires_at TIMESTAMP,
    paid_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_payments_tenant (tenant_id),
    INDEX idx_payments_order (order_id),
    INDEX idx_payments_reference (reference),
    INDEX idx_payments_status (status)
);

-- Refunds
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    payment_id UUID NOT NULL REFERENCES payments(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    reason TEXT NOT NULL,
    
    status VARCHAR(30) NOT NULL, -- pending, processing, successful, failed
    
    gateway_reference VARCHAR(255),
    gateway_response JSONB,
    
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_refunds_tenant (tenant_id),
    INDEX idx_refunds_payment (payment_id)
);

-- Audit Log
CREATE TABLE transaction_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    entity_type VARCHAR(50) NOT NULL, -- cart, order, payment, invoice
    entity_id UUID NOT NULL,
    
    action VARCHAR(50) NOT NULL, -- created, updated, status_changed, etc.
    old_values JSONB,
    new_values JSONB,
    
    actor_type VARCHAR(30), -- system, user, webhook, ai
    actor_id VARCHAR(255),
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_audit_tenant (tenant_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_created (created_at DESC)
);

-- Idempotency Keys
CREATE TABLE idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL UNIQUE,
    tenant_id UUID REFERENCES tenants(id),
    
    status VARCHAR(20) NOT NULL, -- processing, complete
    result JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    
    INDEX idx_idempotency_key (key),
    INDEX idx_idempotency_expires (expires_at)
);
```

---

## AI Tool Definitions

```json
{
  "tools": [
    {
      "name": "create_cart",
      "description": "Create a new shopping cart for the customer.",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": []
      }
    },
    {
      "name": "add_to_cart",
      "description": "Add a product to the customer's cart.",
      "parameters": {
        "type": "object",
        "properties": {
          "product_id": {
            "type": "string",
            "description": "The product ID to add"
          },
          "variant_id": {
            "type": "string",
            "description": "The variant ID (if applicable)"
          },
          "quantity": {
            "type": "integer",
            "description": "Quantity to add (default: 1)"
          }
        },
        "required": ["product_id"]
      }
    },
    {
      "name": "update_cart_item",
      "description": "Update quantity of an item in cart.",
      "parameters": {
        "type": "object",
        "properties": {
          "item_id": {
            "type": "string",
            "description": "The cart item ID"
          },
          "quantity": {
            "type": "integer",
            "description": "New quantity (0 to remove)"
          }
        },
        "required": ["item_id", "quantity"]
      }
    },
    {
      "name": "get_cart",
      "description": "Get the current cart contents and total.",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": []
      }
    },
    {
      "name": "create_order",
      "description": "Create an order from the current cart and generate a payment link.",
      "parameters": {
        "type": "object",
        "properties": {
          "customer_name": {
            "type": "string",
            "description": "Customer's full name"
          },
          "customer_phone": {
            "type": "string",
            "description": "Customer's phone number"
          },
          "customer_email": {
            "type": "string",
            "description": "Customer's email (optional)"
          },
          "shipping_address": {
            "type": "object",
            "description": "Shipping address if required"
          }
        },
        "required": ["customer_name", "customer_phone"]
      }
    },
    {
      "name": "get_order_status",
      "description": "Get the status of an order by order number.",
      "parameters": {
        "type": "object",
        "properties": {
          "order_number": {
            "type": "string",
            "description": "The order number (e.g., ORD-2024-001234)"
          }
        },
        "required": ["order_number"]
      }
    },
    {
      "name": "generate_payment_link",
      "description": "Generate a new payment link for an existing unpaid order.",
      "parameters": {
        "type": "object",
        "properties": {
          "order_id": {
            "type": "string",
            "description": "The order ID"
          }
        },
        "required": ["order_id"]
      }
    }
  ]
}
```

---

## Error Handling

```php
// Custom exceptions for Transaction Engine

namespace App\Engines\Transaction\Exceptions;

class CartNotFoundException extends TransactionException {}
class CartEmptyException extends TransactionException {}
class CartLockedException extends TransactionException {}
class ProductNotFoundException extends TransactionException {}
class InsufficientStockException extends TransactionException {}
class OrderNotFoundException extends TransactionException {}
class OrderAlreadyPaidException extends TransactionException {}
class PaymentFailedException extends TransactionException {}
class InvalidWebhookSignatureException extends TransactionException {}
class DuplicateOperationException extends TransactionException {}
```

---

## Configuration

```php
// config/transaction.php

return [
    'order' => [
        'number_prefix' => 'ORD',
        'number_format' => '{prefix}-{year}-{sequence:06}',
    ],

    'invoice' => [
        'number_prefix' => 'INV',
        'number_format' => '{prefix}-{year}-{sequence:06}',
        'default_due_days' => 7,
    ],

    'cart' => [
        'expiry_hours' => 24,
        'lock_timeout_minutes' => 30,
    ],

    'payment' => [
        'default_gateway' => env('DEFAULT_PAYMENT_GATEWAY', 'paystack'),
        'link_expiry_hours' => 24,
        'webhook_retry_limit' => 3,
    ],

    'inventory' => [
        'reservation_minutes' => 30,
        'auto_release_enabled' => true,
    ],

    'sync' => [
        'erp_sync_enabled' => env('ERP_SYNC_ENABLED', true),
        'sync_on_payment' => true,
        'retry_failed_syncs' => true,
    ],
];
```

---

## Next Steps

Continue to: [Communication Engine →](04-COMMUNICATION-ENGINE.md)
