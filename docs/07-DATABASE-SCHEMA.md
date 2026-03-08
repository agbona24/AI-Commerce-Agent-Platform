# Database Schema

## Overview

This document provides the complete PostgreSQL database schema for the AI Commerce Automation Platform. The schema is designed for multi-tenant SaaS with proper indexing, constraints, and relationships.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CORE ENTITIES                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐                │
│  │   tenants    │────────<│    users     │         │  customers   │                │
│  └──────┬───────┘         └──────────────┘         └──────┬───────┘                │
│         │                                                  │                         │
│         │    ┌─────────────────────────────────────────────┤                         │
│         │    │                    │                        │                         │
│         ▼    ▼                    ▼                        ▼                         │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐                │
│  │   products   │────────<│   variants   │         │conversations │                │
│  └──────┬───────┘         └──────────────┘         └──────┬───────┘                │
│         │                                                  │                         │
│         ▼                                                  ▼                         │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐                │
│  │  inventory   │         │    carts     │────────<│   messages   │                │
│  └──────────────┘         └──────┬───────┘         └──────────────┘                │
│                                  │                                                   │
│                                  ▼                                                   │
│                           ┌──────────────┐         ┌──────────────┐                │
│                           │    orders    │────────<│order_items   │                │
│                           └──────┬───────┘         └──────────────┘                │
│                                  │                                                   │
│                    ┌─────────────┼─────────────┐                                    │
│                    ▼             ▼             ▼                                    │
│             ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                     │
│             │   invoices   │ │   payments   │ │   refunds    │                     │
│             └──────────────┘ └──────────────┘ └──────────────┘                     │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Schema

### Tenant & Users

```sql
-- ============================================================================
-- TENANT & USER MANAGEMENT
-- ============================================================================

-- Tenants (businesses using the platform)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    owner_email VARCHAR(255) NOT NULL,
    
    -- Business info
    industry VARCHAR(100),
    description TEXT,
    address JSONB, -- {street, city, state, country, postal_code}
    phone VARCHAR(50),
    website VARCHAR(255),
    
    -- Branding
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#1E40AF',
    
    -- Custom domain (white-label)
    custom_domain VARCHAR(255) UNIQUE,
    
    -- Subscription
    plan VARCHAR(50) DEFAULT 'trial', -- trial, starter, professional, enterprise
    trial_ends_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleting, deleted
    suspended_at TIMESTAMP,
    suspension_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    onboarding_completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP -- Soft delete
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_domain ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_tenants_plan ON tenants(plan);

-- Users (team members of tenants)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMP,
    password VARCHAR(255) NOT NULL,
    
    role VARCHAR(50) DEFAULT 'viewer', -- owner, admin, agent, viewer
    
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    last_login_at TIMESTAMP,
    
    -- 2FA
    two_factor_secret TEXT,
    two_factor_confirmed_at TIMESTAMP,
    
    remember_token VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(tenant_id, role);

-- Tenant Settings
CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, key)
);

CREATE INDEX idx_settings_tenant ON tenant_settings(tenant_id);

-- Tenant API Keys
CREATE TABLE tenant_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE,
    key_preview VARCHAR(20) NOT NULL,
    
    environment VARCHAR(10) DEFAULT 'live', -- live, test
    permissions JSONB DEFAULT '[]',
    
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_keys_tenant ON tenant_api_keys(tenant_id);
CREATE INDEX idx_api_keys_hash ON tenant_api_keys(key_hash);

-- Phone Numbers
CREATE TABLE phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    country_code VARCHAR(5) NOT NULL,
    
    channel VARCHAR(20) NOT NULL, -- whatsapp, voice, both
    provider VARCHAR(50) NOT NULL, -- whatsapp_cloud, retell, vapi
    
    provider_id VARCHAR(255),
    provider_config JSONB DEFAULT '{}',
    
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, deactivated
    
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_phone_tenant ON phone_numbers(tenant_id);
CREATE INDEX idx_phone_number ON phone_numbers(phone_number);
```

### Products & Inventory

```sql
-- ============================================================================
-- PRODUCT CATALOG & INVENTORY
-- ============================================================================

-- Product Categories
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES product_categories(id),
    
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_categories_tenant ON product_categories(tenant_id);
CREATE INDEX idx_categories_parent ON product_categories(parent_id);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- External system reference
    external_id VARCHAR(255),
    external_source VARCHAR(50), -- shopify, magento, woocommerce, manual
    
    -- Basic info
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Categorization
    category_id UUID REFERENCES product_categories(id),
    tags JSONB DEFAULT '[]',
    
    -- Pricing
    price DECIMAL(12,2) NOT NULL,
    compare_at_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Media
    images JSONB DEFAULT '[]', -- [{url, alt, position}]
    
    -- Attributes
    attributes JSONB DEFAULT '{}', -- {brand, material, weight, etc.}
    
    -- Options (for variants)
    options JSONB DEFAULT '[]', -- [{name: "Size", values: ["S", "M", "L"]}]
    has_variants BOOLEAN DEFAULT FALSE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, draft, archived
    
    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,
    
    -- Tracking
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_sku ON products(tenant_id, sku);
CREATE INDEX idx_products_name ON products(tenant_id, name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(tenant_id, status);
CREATE INDEX idx_products_external ON products(tenant_id, external_id);

-- Full-text search index
CREATE INDEX idx_products_search ON products 
    USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Product Variants
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    external_id VARCHAR(255),
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL, -- e.g., "128GB - Black"
    
    price DECIMAL(12,2) NOT NULL,
    compare_at_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    
    -- Option values
    option_values JSONB DEFAULT '{}', -- {Size: "M", Color: "Blue"}
    
    image_url VARCHAR(500),
    
    -- Weight/dimensions for shipping
    weight DECIMAL(10,2),
    weight_unit VARCHAR(10) DEFAULT 'kg',
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_tenant ON product_variants(tenant_id);
CREATE INDEX idx_variants_sku ON product_variants(tenant_id, sku);

-- Inventory
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    
    low_stock_threshold INT DEFAULT 5,
    
    -- Location
    warehouse_location VARCHAR(100),
    
    -- Sync tracking
    last_sync_at TIMESTAMP,
    sync_source VARCHAR(50),
    
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, product_id, variant_id)
);

CREATE INDEX idx_inventory_tenant ON inventory(tenant_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_low_stock ON inventory(tenant_id) 
    WHERE quantity <= low_stock_threshold;

-- Stock Reservations (for pending orders)
CREATE TABLE stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    
    quantity INT NOT NULL,
    order_id UUID, -- Set when converted to order
    conversation_id UUID,
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, committed, released, expired
    
    expires_at TIMESTAMP NOT NULL,
    committed_at TIMESTAMP,
    released_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reservations_tenant ON stock_reservations(tenant_id);
CREATE INDEX idx_reservations_expires ON stock_reservations(expires_at) 
    WHERE status = 'pending';
```

### Customers & Conversations

```sql
-- ============================================================================
-- CUSTOMERS & CONVERSATIONS
-- ============================================================================

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- External references
    external_id VARCHAR(255),
    external_source VARCHAR(50),
    
    -- Contact info
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- WhatsApp specific
    whatsapp_id VARCHAR(50),
    whatsapp_name VARCHAR(255),
    
    -- Profile
    avatar_url VARCHAR(500),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50),
    
    -- Addresses
    default_shipping_address JSONB,
    default_billing_address JSONB,
    
    -- Stats
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    average_order_value DECIMAL(12,2),
    last_order_at TIMESTAMP,
    
    -- Tags and segments
    tags JSONB DEFAULT '[]',
    
    -- Marketing
    accepts_marketing BOOLEAN DEFAULT FALSE,
    marketing_opt_in_at TIMESTAMP,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_email ON customers(tenant_id, email);
CREATE INDEX idx_customers_phone ON customers(tenant_id, phone);
CREATE INDEX idx_customers_whatsapp ON customers(tenant_id, whatsapp_id);

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Channel info
    channel VARCHAR(20) NOT NULL, -- whatsapp, voice
    channel_id VARCHAR(100) NOT NULL, -- Phone number or call ID
    
    -- Customer
    customer_id UUID REFERENCES customers(id),
    customer_phone VARCHAR(50),
    customer_name VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, handed_over, ended, archived
    
    -- Human takeover
    handed_over_to UUID REFERENCES users(id),
    handover_reason TEXT,
    handover_started_at TIMESTAMP,
    handover_ended_at TIMESTAMP,
    
    -- Current context
    current_cart_id UUID,
    current_order_id UUID,
    last_intent VARCHAR(100),
    context JSONB DEFAULT '{}',
    
    -- Stats
    message_count INT DEFAULT 0,
    ai_message_count INT DEFAULT 0,
    human_message_count INT DEFAULT 0,
    
    -- Tracking
    started_at TIMESTAMP DEFAULT NOW(),
    last_activity_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX idx_conversations_channel ON conversations(channel, channel_id);
CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_status ON conversations(tenant_id, status);
CREATE INDEX idx_conversations_agent ON conversations(handed_over_to) 
    WHERE handed_over_to IS NOT NULL;
CREATE INDEX idx_conversations_recent ON conversations(tenant_id, last_activity_at DESC);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Direction and sender
    direction VARCHAR(10) NOT NULL, -- inbound, outbound
    sender_type VARCHAR(20) NOT NULL, -- customer, ai, agent
    sender_id VARCHAR(255),
    
    -- Content
    message_type VARCHAR(20) NOT NULL, -- text, image, audio, document, interactive
    content TEXT,
    media_url VARCHAR(500),
    media_type VARCHAR(50),
    media_size INT,
    
    -- Channel tracking
    channel VARCHAR(20) NOT NULL,
    external_id VARCHAR(255),
    
    -- Delivery status
    status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, read, failed
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    failed_reason TEXT,
    
    -- AI processing
    ai_intent VARCHAR(100),
    ai_confidence DECIMAL(4,3),
    tools_called JSONB, -- [{tool, params, result}]
    processing_time_ms INT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_tenant ON messages(tenant_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_external ON messages(external_id);
CREATE INDEX idx_messages_status ON messages(conversation_id, status);
```

### Orders & Transactions

```sql
-- ============================================================================
-- ORDERS & TRANSACTIONS
-- ============================================================================

-- Carts
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    customer_id UUID REFERENCES customers(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, locked, converted, abandoned
    
    -- Pricing
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Discount
    coupon_code VARCHAR(50),
    discount_breakdown JSONB,
    
    -- Timing
    locked_at TIMESTAMP,
    expires_at TIMESTAMP,
    converted_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_carts_tenant ON carts(tenant_id);
CREATE INDEX idx_carts_conversation ON carts(conversation_id);
CREATE INDEX idx_carts_customer ON carts(customer_id);
CREATE INDEX idx_carts_status ON carts(status);

-- Cart Items
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    
    -- Denormalized for history
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    image_url VARCHAR(500),
    
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL,
    
    -- Source
    conversation_id UUID,
    cart_id UUID REFERENCES carts(id),
    customer_id UUID REFERENCES customers(id),
    
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
    -- pending_payment, payment_processing, paid, processing, 
    -- shipped, delivered, cancelled, refunded
    
    -- Pricing
    subtotal DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Customer info (denormalized)
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    
    -- Addresses
    shipping_address JSONB,
    billing_address JSONB,
    
    -- Payment
    payment_gateway VARCHAR(50),
    payment_reference VARCHAR(255),
    payment_status VARCHAR(30),
    paid_at TIMESTAMP,
    
    -- Fulfillment
    fulfillment_status VARCHAR(30) DEFAULT 'unfulfilled',
    tracking_number VARCHAR(100),
    tracking_url VARCHAR(500),
    shipping_carrier VARCHAR(100),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- ERP sync
    erp_order_id VARCHAR(100),
    erp_synced BOOLEAN DEFAULT FALSE,
    erp_synced_at TIMESTAMP,
    erp_sync_error TEXT,
    
    -- Cancellation
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    
    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, order_number)
);

CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_conversation ON orders(conversation_id);
CREATE INDEX idx_orders_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_payment_ref ON orders(payment_reference);
CREATE INDEX idx_orders_created ON orders(tenant_id, created_at DESC);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    
    -- Denormalized for history
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(100),
    image_url VARCHAR(500),
    
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    
    -- Fulfillment
    fulfilled_quantity INT DEFAULT 0,
    
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Order Status History
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    
    comment TEXT,
    changed_by UUID REFERENCES users(id),
    changed_by_type VARCHAR(20), -- user, system, webhook
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_history_order ON order_status_history(order_id);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, void
    
    -- Amounts
    subtotal DECIMAL(12,2) NOT NULL,
    discount DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Details
    customer_info JSONB NOT NULL,
    business_info JSONB NOT NULL,
    line_items JSONB NOT NULL,
    
    -- PDF
    pdf_url VARCHAR(500),
    
    -- Dates
    issued_at TIMESTAMP DEFAULT NOW(),
    due_at TIMESTAMP,
    paid_at TIMESTAMP,
    voided_at TIMESTAMP,
    void_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, invoice_number)
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_order ON invoices(order_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id),
    
    -- Gateway
    gateway VARCHAR(50) NOT NULL, -- paystack, flutterwave, stripe
    reference VARCHAR(255) NOT NULL,
    gateway_reference VARCHAR(255),
    
    -- Amount
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    
    -- Status
    status VARCHAR(30) NOT NULL, -- pending, processing, successful, failed, refunded
    
    -- Payment link
    payment_url VARCHAR(500),
    
    -- Method
    payment_method VARCHAR(50), -- card, bank_transfer, ussd
    
    -- Customer
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    
    -- Gateway response
    gateway_response JSONB,
    failure_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timing
    expires_at TIMESTAMP,
    paid_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(reference)
);

CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_payments_gateway_ref ON payments(gateway_reference);
CREATE INDEX idx_payments_status ON payments(status);

-- Refunds
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payments(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    reason TEXT NOT NULL,
    
    status VARCHAR(30) NOT NULL, -- pending, processing, successful, failed
    
    gateway_reference VARCHAR(255),
    gateway_response JSONB,
    
    processed_at TIMESTAMP,
    processed_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refunds_tenant ON refunds(tenant_id);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_order ON refunds(order_id);
```

### Knowledge Base

```sql
-- ============================================================================
-- KNOWLEDGE BASE (RAG)
-- ============================================================================

-- Knowledge Documents
CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- faq, policy, script, support, product_doc
    
    content TEXT NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, draft, archived
    
    -- Processing
    is_indexed BOOLEAN DEFAULT FALSE,
    indexed_at TIMESTAMP,
    chunk_count INT DEFAULT 0,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_knowledge_tenant ON knowledge_documents(tenant_id);
CREATE INDEX idx_knowledge_type ON knowledge_documents(type);
CREATE INDEX idx_knowledge_status ON knowledge_documents(tenant_id, status);

-- Knowledge Chunks (for RAG)
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    token_count INT NOT NULL,
    
    -- Vector reference
    embedding_id VARCHAR(255), -- ID in Pinecone/pgvector
    
    -- Metadata for context
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chunks_document ON knowledge_chunks(document_id);
CREATE INDEX idx_chunks_tenant ON knowledge_chunks(tenant_id);

-- pgvector extension for local vector storage (alternative to Pinecone)
-- Uncomment if using pgvector
-- CREATE EXTENSION IF NOT EXISTS vector;
-- 
-- ALTER TABLE knowledge_chunks 
--     ADD COLUMN embedding vector(1536);
-- 
-- CREATE INDEX idx_chunks_embedding ON knowledge_chunks 
--     USING ivfflat (embedding vector_cosine_ops)
--     WITH (lists = 100);
```

### Integrations

```sql
-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

-- Tenant Integrations
CREATE TABLE tenant_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL, -- commerce, payment, erp, crm
    provider VARCHAR(50) NOT NULL, -- shopify, paystack, hubspot, etc.
    
    -- Encrypted credentials
    credentials BYTEA NOT NULL,
    
    -- Non-sensitive config
    config JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, error
    
    -- Sync tracking
    last_sync_at TIMESTAMP,
    last_error TEXT,
    error_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, type, provider)
);

CREATE INDEX idx_integrations_tenant ON tenant_integrations(tenant_id);

-- Integration Webhooks
CREATE TABLE integration_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES tenant_integrations(id),
    
    endpoint_path VARCHAR(255) NOT NULL UNIQUE,
    secret VARCHAR(255) NOT NULL,
    
    events JSONB DEFAULT '[]',
    
    is_active BOOLEAN DEFAULT TRUE,
    last_received_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_int_webhooks_tenant ON integration_webhooks(tenant_id);
CREATE INDEX idx_int_webhooks_path ON integration_webhooks(endpoint_path);

-- Sync Jobs
CREATE TABLE sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES tenant_integrations(id),
    
    type VARCHAR(50) NOT NULL, -- full_sync, incremental, single_entity
    entity_type VARCHAR(50), -- products, inventory, orders
    entity_id VARCHAR(255),
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    
    records_processed INT DEFAULT 0,
    records_succeeded INT DEFAULT 0,
    records_failed INT DEFAULT 0,
    
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    error_log JSONB DEFAULT '[]',
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_tenant ON sync_jobs(tenant_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
```

### Audit & Analytics

```sql
-- ============================================================================
-- AUDIT & ANALYTICS
-- ============================================================================

-- Transaction Audit Log
CREATE TABLE transaction_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    entity_type VARCHAR(50) NOT NULL, -- cart, order, payment, invoice
    entity_id UUID NOT NULL,
    
    action VARCHAR(50) NOT NULL, -- created, updated, status_changed, etc.
    
    old_values JSONB,
    new_values JSONB,
    
    actor_type VARCHAR(30), -- system, user, webhook, ai
    actor_id VARCHAR(255),
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON transaction_audit_log(tenant_id);
CREATE INDEX idx_audit_entity ON transaction_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON transaction_audit_log(created_at DESC);

-- Partition audit log by month for better performance
-- CREATE TABLE transaction_audit_log_template (LIKE transaction_audit_log INCLUDING ALL)
--     PARTITION BY RANGE (created_at);

-- Idempotency Keys
CREATE TABLE idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL UNIQUE,
    tenant_id UUID REFERENCES tenants(id),
    
    status VARCHAR(20) NOT NULL, -- processing, complete
    result JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_idempotency_key ON idempotency_keys(key);
CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);

-- Analytics Events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    event_type VARCHAR(50) NOT NULL,
    -- conversation_started, message_sent, product_viewed, 
    -- cart_created, order_placed, payment_completed, etc.
    
    entity_type VARCHAR(50),
    entity_id UUID,
    
    properties JSONB DEFAULT '{}',
    
    -- Attribution
    conversation_id UUID,
    customer_id UUID,
    channel VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_tenant ON analytics_events(tenant_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(tenant_id, created_at DESC);

-- Consider partitioning by month for large datasets
-- Daily aggregates for dashboard
CREATE TABLE analytics_daily_aggregates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    date DATE NOT NULL,
    
    -- Conversation metrics
    conversations_started INT DEFAULT 0,
    messages_received INT DEFAULT 0,
    messages_sent INT DEFAULT 0,
    ai_messages INT DEFAULT 0,
    human_messages INT DEFAULT 0,
    escalations INT DEFAULT 0,
    
    -- Commerce metrics
    carts_created INT DEFAULT 0,
    orders_placed INT DEFAULT 0,
    orders_completed INT DEFAULT 0,
    orders_cancelled INT DEFAULT 0,
    
    -- Revenue
    total_revenue DECIMAL(12,2) DEFAULT 0,
    average_order_value DECIMAL(12,2) DEFAULT 0,
    
    -- Conversion
    cart_to_order_rate DECIMAL(5,2),
    order_completion_rate DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, date)
);

CREATE INDEX idx_daily_agg_tenant ON analytics_daily_aggregates(tenant_id);
CREATE INDEX idx_daily_agg_date ON analytics_daily_aggregates(date DESC);
```

### Platform Billing

```sql
-- ============================================================================
-- PLATFORM BILLING
-- ============================================================================

-- Tenant Usage
CREATE TABLE tenant_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    period VARCHAR(7) NOT NULL, -- YYYY-MM
    metric VARCHAR(50) NOT NULL,
    value INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, period, metric)
);

CREATE INDEX idx_usage_tenant ON tenant_usage(tenant_id);
CREATE INDEX idx_usage_period ON tenant_usage(period);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, past_due, paused
    
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP,
    
    -- External payment
    payment_provider VARCHAR(50), -- stripe, paystack
    external_subscription_id VARCHAR(255),
    external_customer_id VARCHAR(255),
    
    -- Trial
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Platform Invoices
CREATE TABLE platform_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    subscription_id UUID REFERENCES subscriptions(id),
    
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, void
    
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    
    line_items JSONB NOT NULL,
    
    paid_at TIMESTAMP,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    
    pdf_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_platform_invoices_tenant ON platform_invoices(tenant_id);
CREATE INDEX idx_platform_invoices_status ON platform_invoices(status);
```

---

## Migrations Order

When running migrations, execute in this order:

1. `tenants`
2. `users`
3. `tenant_settings`
4. `tenant_api_keys`
5. `phone_numbers`
6. `product_categories`
7. `products`
8. `product_variants`
9. `inventory`
10. `stock_reservations`
11. `customers`
12. `conversations`
13. `messages`
14. `carts`
15. `cart_items`
16. `orders`
17. `order_items`
18. `order_status_history`
19. `invoices`
20. `payments`
21. `refunds`
22. `knowledge_documents`
23. `knowledge_chunks`
24. `tenant_integrations`
25. `integration_webhooks`
26. `sync_jobs`
27. `transaction_audit_log`
28. `idempotency_keys`
29. `analytics_events`
30. `analytics_daily_aggregates`
31. `tenant_usage`
32. `subscriptions`
33. `platform_invoices`

---

## Next Steps

Continue to: [AI Agent Workflow →](08-AI-AGENT-WORKFLOW.md)
