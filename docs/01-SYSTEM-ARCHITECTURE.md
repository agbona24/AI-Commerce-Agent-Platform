# System Architecture Overview

## Executive Summary

The AI Commerce Automation Platform is a multi-tenant SaaS system that enables businesses to automate sales conversations through WhatsApp and Voice AI. The architecture is designed around five core engines that work together to handle knowledge retrieval, transaction processing, communication management, external integrations, and multi-tenant isolation.

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CUSTOMER INTERACTION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│     ┌──────────────┐           ┌──────────────┐           ┌──────────────┐          │
│     │   WhatsApp   │           │  Voice Call  │           │   Web Chat   │          │
│     │   Customer   │           │   Customer   │           │  (Future)    │          │
│     └──────┬───────┘           └──────┬───────┘           └──────┬───────┘          │
│            │                          │                          │                   │
└────────────┼──────────────────────────┼──────────────────────────┼───────────────────┘
             │                          │                          │
             ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              COMMUNICATION ENGINE                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ WhatsApp        │  │ Voice           │  │ Conversation    │  │ Escalation     │  │
│  │ Adapter         │  │ Adapter         │  │ Manager         │  │ Manager        │  │
│  │                 │  │ (Retell/Vapi)   │  │                 │  │                │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  └────────┬───────┘  │
│           │                    │                    │                    │          │
│           └────────────────────┴────────────────────┴────────────────────┘          │
│                                         │                                            │
│                               ┌─────────▼────────┐                                  │
│                               │  Message Queue   │                                  │
│                               │  (Redis)         │                                  │
│                               └─────────┬────────┘                                  │
└─────────────────────────────────────────┼────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AI ORCHESTRATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                          AI Agent Controller                                 │    │
│  │                                                                              │    │
│  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────────┐  │    │
│  │   │ Intent       │   │ Context      │   │ Tool         │   │ Response    │  │    │
│  │   │ Classifier   │   │ Manager      │   │ Executor     │   │ Generator   │  │    │
│  │   └──────────────┘   └──────────────┘   └──────────────┘   └─────────────┘  │    │
│  │                                                                              │    │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│                                         │ Tool Calls                                 │
│                                         ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                           Available Tools                                     │   │
│  │  • search_products()    • check_inventory()    • create_order()              │   │
│  │  • get_product_info()   • create_cart()        • generate_invoice()          │   │
│  │  • search_faq()         • add_to_cart()        • create_payment_link()       │   │
│  │  • get_policy()         • get_cart()           • check_payment_status()      │   │
│  │  • get_recommendations()                       • escalate_to_human()         │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└───────────────┬─────────────────────────────────┬────────────────────────────────────┘
                │                                 │
                ▼                                 ▼
┌───────────────────────────────────┐ ┌───────────────────────────────────────────────┐
│       KNOWLEDGE ENGINE            │ │           TRANSACTION ENGINE                   │
├───────────────────────────────────┤ ├───────────────────────────────────────────────┤
│                                   │ │                                                │
│  ┌─────────────────────────────┐  │ │  ┌──────────────┐   ┌──────────────────────┐  │
│  │   Structured Data Layer     │  │ │  │ Cart Service │   │ Order Service        │  │
│  │   (Real-time API/DB)        │  │ │  └──────────────┘   └──────────────────────┘  │
│  │                             │  │ │                                                │
│  │  • Product Catalog          │  │ │  ┌──────────────┐   ┌──────────────────────┐  │
│  │  • Inventory Levels         │  │ │  │ Invoice Svc  │   │ Payment Service      │  │
│  │  • Pricing                  │  │ │  └──────────────┘   └──────────────────────┘  │
│  │  • Order Status             │  │ │                                                │
│  └─────────────────────────────┘  │ │  ┌──────────────────────────────────────────┐ │
│                                   │ │  │ Webhook Handler                          │ │
│  ┌─────────────────────────────┐  │ │  │ • Payment confirmation                   │ │
│  │   Unstructured Data Layer   │  │ │  │ • Idempotency checks                     │ │
│  │   (RAG / Embeddings)        │  │ │  │ • Audit logging                          │ │
│  │                             │  │ │  └──────────────────────────────────────────┘ │
│  │  • FAQs                     │  │ │                                                │
│  │  • Policies                 │  │ └────────────────────────────────────────────────┘
│  │  • Sales Scripts            │  │
│  │  • Support Docs             │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │   Vector Database           │  │
│  │   (Pinecone / pgvector)     │  │
│  └─────────────────────────────┘  │
│                                   │
└───────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              INTEGRATION ENGINE                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                    Unified Integration Interface                               │  │
│  │   fetchProducts() │ checkInventory() │ createOrder() │ processPayment()       │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                         │                                            │
│      ┌──────────────────────────────────┼──────────────────────────────────┐        │
│      │                                  │                                   │        │
│      ▼                                  ▼                                   ▼        │
│  ┌──────────────────┐  ┌────────────────────────────┐  ┌──────────────────────────┐ │
│  │ Commerce Adapters│  │ Payment Gateway Adapters   │  │ ERP/CRM Adapters         │ │
│  │                  │  │                            │  │                          │ │
│  │ • Shopify        │  │ • Paystack                 │  │ • Custom ERP API         │ │
│  │ • Magento        │  │ • Flutterwave              │  │ • HubSpot                │ │
│  │ • WooCommerce    │  │ • Stripe                   │  │ • Salesforce             │ │
│  │ • Custom API     │  │                            │  │ • Custom CRM             │ │
│  └──────────────────┘  └────────────────────────────┘  └──────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              TENANT ENGINE                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         Tenant Context / Isolation                             │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────────────┐     │
│   │ Tenant A    │   │ Tenant B    │   │ Tenant C    │   │ Tenant N...         │     │
│   │             │   │             │   │             │   │                     │     │
│   │ • Config    │   │ • Config    │   │ • Config    │   │ • Config            │     │
│   │ • API Keys  │   │ • API Keys  │   │ • API Keys  │   │ • API Keys          │     │
│   │ • Catalog   │   │ • Catalog   │   │ • Catalog   │   │ • Catalog           │     │
│   │ • Knowledge │   │ • Knowledge │   │ • Knowledge │   │ • Knowledge         │     │
│   │ • Branding  │   │ • Branding  │   │ • Branding  │   │ • Branding          │     │
│   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────────────┘     │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                  │
│   │   PostgreSQL     │  │     Redis        │  │   S3 / Spaces    │                  │
│   │   (Primary DB)   │  │   (Cache/Queue)  │  │   (File Storage) │                  │
│   │                  │  │                  │  │                  │                  │
│   │  • Tenants       │  │  • Sessions      │  │  • Documents     │                  │
│   │  • Users         │  │  • Message Queue │  │  • Invoices      │                  │
│   │  • Products      │  │  • Rate Limits   │  │  • Receipts      │                  │
│   │  • Orders        │  │  • Cache         │  │  • Voice files   │                  │
│   │  • Conversations │  │                  │  │                  │                  │
│   │  • Payments      │  │                  │  │                  │                  │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘                  │
│                                                                                      │
│   ┌──────────────────────────────────────────────────────────────────────────────┐  │
│   │              Pinecone / pgvector (Vector Database)                            │  │
│   │              • FAQ Embeddings    • Policy Embeddings    • Document Embeddings │  │
│   └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Overview

### 1. Customer Interaction Layer
Entry points for customer communication:
- **WhatsApp**: Via WhatsApp Cloud API
- **Voice**: Via Retell AI / Vapi with real-time AI responses
- **Web Chat**: Future expansion channel

### 2. Communication Engine
Manages all inbound/outbound messaging:
- Channel-specific adapters (WhatsApp, Voice)
- Unified conversation management
- Session persistence
- Human takeover routing
- Message queuing for reliability

### 3. AI Orchestration Layer
The "brain" of the system:
- Receives messages from Communication Engine
- Classifies user intent
- Maintains conversation context
- Decides which tools to call
- Generates appropriate responses
- Handles multi-turn conversations

### 4. Knowledge Engine
Split into two retrieval strategies:
- **Structured Data**: Real-time API/DB queries for products, inventory, pricing
- **Unstructured Data**: RAG-based retrieval for FAQs, policies, support content

### 5. Transaction Engine
Handles all commercial operations:
- Cart management (add, update, remove items)
- Order creation and tracking
- Invoice generation
- Payment link creation
- Webhook processing for payment confirmations

### 6. Integration Engine
Standardized interface for external systems:
- Commerce platforms (Shopify, Magento, WooCommerce)
- Payment gateways (Paystack, Flutterwave, Stripe)
- ERP systems (custom connectors)
- CRM systems (HubSpot, Salesforce)

### 7. Tenant Engine
Multi-tenancy management:
- Per-tenant configuration
- Data isolation
- API key management
- Billing and usage tracking
- White-label branding

### 8. Data Layer
Persistent storage:
- **PostgreSQL**: Primary transactional database
- **Redis**: Caching, sessions, job queues
- **S3/DigitalOcean Spaces**: File storage
- **Pinecone/pgvector**: Vector embeddings

---

## Request Flow Example

### Customer Message: "Do you have iPhone 14 Pro in stock?"

```
1. WhatsApp Cloud API → Webhook received
                          │
2. Communication Engine → Parse message, identify tenant
                          │
3. AI Orchestration     → Classify intent: PRODUCT_INQUIRY
                          │
4. Tool Execution       → search_products("iPhone 14 Pro")
                          │
5. Knowledge Engine     → Query product catalog
                          │
6. Integration Engine   → Fetch from Shopify/internal DB
                          │
7. Tool Execution       → check_inventory(product_id)
                          │
8. Integration Engine   → Query ERP/inventory system
                          │
9. AI Orchestration     → Generate response with stock info
                          │
10. Communication Engine → Send WhatsApp message
                          │
11. Conversation saved  → PostgreSQL + Redis session update
```

---

## Admin Dashboard Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ADMIN DASHBOARD (React)                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  Navigation: Home │ Conversations │ Orders │ Products │ Analytics │ Settings  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────────────────┐ │
│  │ Live Conversations │  │ Order Management   │  │ Analytics Dashboard            │ │
│  │                    │  │                    │  │                                │ │
│  │ • Active chats     │  │ • Pending orders   │  │ • Conversion rate              │ │
│  │ • Human takeover   │  │ • Payment status   │  │ • Order completion             │ │
│  │ • Transcripts      │  │ • Fulfillment      │  │ • AI handoff rate              │ │
│  │ • Search history   │  │ • Refunds          │  │ • Revenue tracking             │ │
│  └────────────────────┘  └────────────────────┘  └────────────────────────────────┘ │
│                                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────────────────┐ │
│  │ Product Catalog    │  │ Knowledge Base     │  │ Integration Settings           │ │
│  │                    │  │                    │  │                                │ │
│  │ • Add/Edit products│  │ • FAQs             │  │ • WhatsApp setup               │ │
│  │ • Bulk import      │  │ • Policies         │  │ • Payment gateway              │ │
│  │ • Inventory sync   │  │ • Sales scripts    │  │ • ERP connection               │ │
│  │ • Pricing rules    │  │ • Document upload  │  │ • CRM sync                     │ │
│  └────────────────────┘  └────────────────────┘  └────────────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Scalability Architecture

```
                            ┌─────────────────────────┐
                            │      Load Balancer      │
                            │    (AWS ALB / Nginx)    │
                            └───────────┬─────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
            │   API Pod 1   │   │   API Pod 2   │   │   API Pod N   │
            │   (Laravel)   │   │   (Laravel)   │   │   (Laravel)   │
            └───────────────┘   └───────────────┘   └───────────────┘
                    │                   │                   │
                    └───────────────────┴───────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
            │ Queue Worker 1│   │ Queue Worker 2│   │ Queue Worker N│
            │ (AI + Jobs)   │   │ (Webhooks)    │   │ (Sync)        │
            └───────────────┘   └───────────────┘   └───────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
                    ▼                                       ▼
            ┌───────────────────────────┐   ┌───────────────────────────┐
            │  PostgreSQL Primary       │   │  PostgreSQL Replica       │
            │  (Write)                  │   │  (Read)                   │
            └───────────────────────────┘   └───────────────────────────┘
                                        │
                                        ▼
                            ┌───────────────────────────┐
                            │     Redis Cluster         │
                            │  (Sessions, Queues, Cache)│
                            └───────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY LAYERS                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │ EDGE SECURITY                                                                │    │
│  │ • CloudFlare WAF / DDoS Protection                                          │    │
│  │ • SSL/TLS Termination                                                        │    │
│  │ • Rate Limiting (per IP, per tenant)                                         │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │ APPLICATION SECURITY                                                         │    │
│  │ • OAuth 2.0 / JWT Authentication                                             │    │
│  │ • API Key validation (per tenant)                                            │    │
│  │ • Webhook signature verification                                             │    │
│  │ • Input validation & sanitization                                            │    │
│  │ • CSRF protection                                                            │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │ DATA SECURITY                                                                │    │
│  │ • Per-tenant data isolation (tenant_id in all queries)                       │    │
│  │ • Encrypted secrets (AES-256)                                                │    │
│  │ • PII encryption at rest                                                     │    │
│  │ • Database connection encryption                                             │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │ AUDIT & COMPLIANCE                                                           │    │
│  │ • Full transaction audit logs                                                │    │
│  │ • Conversation logs (with retention policy)                                  │    │
│  │ • GDPR/POPIA data handling                                                   │    │
│  │ • PCI DSS consideration (tokenized payments)                                 │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Next Steps

Continue to the detailed engine specifications:

1. [Knowledge Engine →](02-KNOWLEDGE-ENGINE.md)
2. [Transaction Engine →](03-TRANSACTION-ENGINE.md)
3. [Communication Engine →](04-COMMUNICATION-ENGINE.md)
4. [Integration Engine →](05-INTEGRATION-ENGINE.md)
5. [Tenant Engine →](06-TENANT-ENGINE.md)
