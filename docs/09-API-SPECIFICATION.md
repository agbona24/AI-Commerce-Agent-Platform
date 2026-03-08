# API Specification

## Overview

This document covers all REST API endpoints for the AI Commerce Automation Platform. The API follows REST conventions and uses JSON for request/response bodies.

---

## Base Configuration

```
Base URL: https://api.platform.com/v1
Content-Type: application/json
Authentication: Bearer Token (JWT) or API Key
```

### API Versioning

- Version included in URL path: `/v1/`, `/v2/`
- Major versions for breaking changes
- Minor/patch versions backward compatible

### Rate Limiting

| Plan | Requests/min | Requests/hour |
|------|-------------|---------------|
| Trial | 60 | 1,000 |
| Starter | 200 | 10,000 |
| Professional | 500 | 50,000 |
| Enterprise | Custom | Custom |

Rate limit headers:
```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1699900000
```

---

## Authentication

### API Key Authentication

```http
GET /v1/products
X-API-Key: ak_live_xxxxxxxxxxxxx
X-Tenant-ID: tenant_xxxxx
```

### JWT Token Authentication

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

---
Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "rt_xxxxxxxxxxxxx"
}
```

### Token Refresh

```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "rt_xxxxxxxxxxxxx"
}
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 25,
      "total": 150,
      "total_pages": 6
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": {
      "email": ["The email field is required."],
      "phone": ["The phone must be a valid number."]
    }
  },
  "request_id": "req_xxxxxxxxxxxxx"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Tenant Management APIs

### Create Tenant (Platform Admin)

```http
POST /v1/admin/tenants
Authorization: Bearer {platform_admin_token}

{
  "company_name": "Acme Store",
  "owner_email": "owner@acme.com",
  "owner_name": "John Doe",
  "plan": "starter",
  "industry": "retail",
  "country": "NG"
}

---
Response: 201 Created
{
  "success": true,
  "data": {
    "id": "tenant_xxxxx",
    "company_name": "Acme Store",
    "subdomain": "acme-store",
    "status": "active",
    "plan": "starter",
    "created_at": "2024-01-15T10:30:00Z",
    "owner": {
      "id": "user_xxxxx",
      "email": "owner@acme.com",
      "name": "John Doe"
    },
    "api_keys": {
      "live": "ak_live_xxxxx",
      "test": "ak_test_xxxxx"
    }
  }
}
```

### Get Tenant Details

```http
GET /v1/tenant
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": {
    "id": "tenant_xxxxx",
    "company_name": "Acme Store",
    "subdomain": "acme-store",
    "status": "active",
    "plan": "professional",
    "features": ["product_catalog", "orders", "whatsapp", "voice"],
    "settings": {
      "timezone": "Africa/Lagos",
      "currency": "NGN",
      "language": "en"
    },
    "usage": {
      "conversations_this_month": 1523,
      "orders_this_month": 87,
      "ai_tokens_used": 2500000
    }
  }
}
```

### Update Tenant Settings

```http
PATCH /v1/tenant/settings
Authorization: Bearer {token}

{
  "timezone": "Africa/Lagos",
  "currency": "NGN",
  "business_hours": {
    "monday": {"open": "09:00", "close": "18:00"},
    "tuesday": {"open": "09:00", "close": "18:00"},
    "saturday": null
  },
  "ai_config": {
    "agent_name": "Ayo",
    "tone": "friendly",
    "primary_language": "en"
  }
}

---
Response:
{
  "success": true,
  "data": {
    "settings": { ... }
  }
}
```

---

## Product APIs

### List Products

```http
GET /v1/products?page=1&per_page=25&category=electronics&in_stock=true
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": [
    {
      "id": "prod_xxxxx",
      "name": "Wireless Earbuds",
      "slug": "wireless-earbuds",
      "description": "Premium wireless earbuds with noise cancellation",
      "category": {
        "id": "cat_xxxxx",
        "name": "Electronics"
      },
      "price": {
        "amount": 25000,
        "currency": "NGN",
        "formatted": "₦25,000"
      },
      "inventory": {
        "quantity": 50,
        "in_stock": true
      },
      "images": [
        "https://cdn.platform.com/images/prod_xxxxx_1.jpg"
      ],
      "status": "active",
      "created_at": "2024-01-10T08:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 25,
      "total": 150,
      "total_pages": 6
    }
  }
}
```

### Create Product

```http
POST /v1/products
Authorization: Bearer {token}

{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with A17 Pro chip",
  "category_id": "cat_xxxxx",
  "price": 1500000,
  "cost_price": 1200000,
  "sku": "IP15PRO-256-BLK",
  "barcode": "1234567890123",
  "inventory_quantity": 25,
  "track_inventory": true,
  "images": [
    "data:image/jpeg;base64,/9j/4AAQ..."
  ],
  "variants": [
    {
      "name": "256GB - Black",
      "sku": "IP15PRO-256-BLK",
      "price": 1500000,
      "inventory_quantity": 10
    },
    {
      "name": "512GB - Black",
      "sku": "IP15PRO-512-BLK",
      "price": 1700000,
      "inventory_quantity": 15
    }
  ],
  "metadata": {
    "brand": "Apple",
    "warranty": "1 year"
  }
}

---
Response: 201 Created
{
  "success": true,
  "data": {
    "id": "prod_xxxxx",
    "name": "iPhone 15 Pro",
    ...
  }
}
```

### Get Product

```http
GET /v1/products/{product_id}
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": {
    "id": "prod_xxxxx",
    "name": "iPhone 15 Pro",
    "description": "Latest iPhone with A17 Pro chip",
    "variants": [...],
    "inventory": {...},
    ...
  }
}
```

### Update Product

```http
PATCH /v1/products/{product_id}
Authorization: Bearer {token}

{
  "price": 1450000,
  "description": "Updated description"
}
```

### Delete Product

```http
DELETE /v1/products/{product_id}
Authorization: Bearer {token}

---
Response: 204 No Content
```

### Search Products

```http
GET /v1/products/search?q=iphone&category=electronics
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": [...],
  "meta": {
    "query": "iphone",
    "filters": {"category": "electronics"},
    "total_results": 12
  }
}
```

---

## Customer APIs

### List Customers

```http
GET /v1/customers?page=1&per_page=25
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": [
    {
      "id": "cust_xxxxx",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "total_orders": 5,
      "total_spent": {
        "amount": 125000,
        "currency": "NGN",
        "formatted": "₦125,000"
      },
      "last_order_at": "2024-01-10T15:30:00Z",
      "created_at": "2023-06-15T10:00:00Z"
    }
  ]
}
```

### Create Customer

```http
POST /v1/customers
Authorization: Bearer {token}

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+2348087654321",
  "address": {
    "line1": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos",
    "country": "NG"
  },
  "tags": ["vip", "wholesale"]
}

---
Response: 201 Created
```

### Get Customer

```http
GET /v1/customers/{customer_id}
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": {
    "id": "cust_xxxxx",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+2348087654321",
    "address": {...},
    "orders_count": 10,
    "conversations_count": 25,
    "last_conversation_at": "2024-01-15T12:00:00Z"
  }
}
```

### Get Customer Orders

```http
GET /v1/customers/{customer_id}/orders
Authorization: Bearer {token}
```

### Get Customer Conversations

```http
GET /v1/customers/{customer_id}/conversations
Authorization: Bearer {token}
```

---

## Order APIs

### List Orders

```http
GET /v1/orders?status=pending&page=1&per_page=25
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": [
    {
      "id": "ord_xxxxx",
      "order_number": "ORD-2024-00123",
      "status": "pending",
      "customer": {
        "id": "cust_xxxxx",
        "name": "John Doe",
        "phone": "+2348012345678"
      },
      "items": [
        {
          "id": "orditm_xxxxx",
          "product_id": "prod_xxxxx",
          "product_name": "Wireless Earbuds",
          "quantity": 2,
          "unit_price": 25000,
          "total": 50000
        }
      ],
      "subtotal": 50000,
      "tax": 0,
      "shipping": 2000,
      "total": 52000,
      "currency": "NGN",
      "payment_status": "pending",
      "fulfillment_status": "unfulfilled",
      "created_at": "2024-01-15T14:30:00Z"
    }
  ]
}
```

### Create Order

```http
POST /v1/orders
Authorization: Bearer {token}

{
  "customer_id": "cust_xxxxx",
  "items": [
    {
      "product_id": "prod_xxxxx",
      "variant_id": "var_xxxxx",
      "quantity": 2
    }
  ],
  "shipping_address": {
    "line1": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos",
    "country": "NG"
  },
  "notes": "Please deliver before 5pm",
  "send_notification": true
}

---
Response: 201 Created
{
  "success": true,
  "data": {
    "id": "ord_xxxxx",
    "order_number": "ORD-2024-00124",
    "status": "pending",
    "payment_link": "https://pay.platform.com/ord_xxxxx",
    ...
  }
}
```

### Get Order

```http
GET /v1/orders/{order_id}
Authorization: Bearer {token}
```

### Update Order Status

```http
PATCH /v1/orders/{order_id}/status
Authorization: Bearer {token}

{
  "status": "processing",
  "notify_customer": true
}
```

### Cancel Order

```http
POST /v1/orders/{order_id}/cancel
Authorization: Bearer {token}

{
  "reason": "Customer requested cancellation",
  "refund": true
}
```

---

## Payment APIs

### Initiate Payment

```http
POST /v1/payments/initiate
Authorization: Bearer {token}

{
  "order_id": "ord_xxxxx",
  "gateway": "paystack",
  "callback_url": "https://store.com/payment/callback"
}

---
Response:
{
  "success": true,
  "data": {
    "payment_id": "pay_xxxxx",
    "authorization_url": "https://checkout.paystack.com/xxxxx",
    "access_code": "xxxxx",
    "reference": "PAY-2024-xxxxx"
  }
}
```

### Verify Payment

```http
GET /v1/payments/{payment_id}/verify
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": {
    "payment_id": "pay_xxxxx",
    "status": "success",
    "amount": 52000,
    "currency": "NGN",
    "gateway": "paystack",
    "gateway_reference": "T123456789",
    "paid_at": "2024-01-15T15:00:00Z"
  }
}
```

### Process Refund

```http
POST /v1/payments/{payment_id}/refund
Authorization: Bearer {token}

{
  "amount": 25000,
  "reason": "Partial refund for damaged item"
}

---
Response:
{
  "success": true,
  "data": {
    "refund_id": "ref_xxxxx",
    "amount": 25000,
    "status": "pending",
    "estimated_completion": "2024-01-20T00:00:00Z"
  }
}
```

---

## Conversation APIs

### List Conversations

```http
GET /v1/conversations?status=active&channel=whatsapp
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": [
    {
      "id": "conv_xxxxx",
      "channel": "whatsapp",
      "status": "active",
      "customer": {
        "id": "cust_xxxxx",
        "name": "John Doe",
        "phone": "+2348012345678"
      },
      "last_message": {
        "content": "I'd like to order the wireless earbuds",
        "role": "user",
        "timestamp": "2024-01-15T16:30:00Z"
      },
      "messages_count": 12,
      "started_at": "2024-01-15T16:00:00Z",
      "last_activity_at": "2024-01-15T16:30:00Z"
    }
  ]
}
```

### Get Conversation

```http
GET /v1/conversations/{conversation_id}
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": {
    "id": "conv_xxxxx",
    "channel": "whatsapp",
    "status": "active",
    "customer": {...},
    "messages": [
      {
        "id": "msg_xxxxx",
        "role": "user",
        "content": "Hi, what products do you have?",
        "timestamp": "2024-01-15T16:00:00Z"
      },
      {
        "id": "msg_yyyyy",
        "role": "assistant",
        "content": "Hello! We have a great selection of electronics...",
        "timestamp": "2024-01-15T16:00:05Z",
        "tool_calls": [
          {
            "name": "search_products",
            "arguments": {"category": "electronics"}
          }
        ]
      }
    ]
  }
}
```

### Send Message (Manual)

```http
POST /v1/conversations/{conversation_id}/messages
Authorization: Bearer {token}

{
  "content": "Your order has been shipped!",
  "type": "text"
}
```

### Handover to Human

```http
POST /v1/conversations/{conversation_id}/handover
Authorization: Bearer {token}

{
  "reason": "Complex support issue",
  "priority": "high",
  "assign_to": "user_xxxxx"
}
```

### Close Conversation

```http
POST /v1/conversations/{conversation_id}/close
Authorization: Bearer {token}

{
  "resolution": "resolved",
  "notes": "Order completed successfully"
}
```

---

## Knowledge Base APIs

### List Documents

```http
GET /v1/knowledge/documents
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": [
    {
      "id": "doc_xxxxx",
      "title": "Return Policy",
      "type": "policy",
      "status": "indexed",
      "chunks_count": 5,
      "created_at": "2024-01-10T10:00:00Z",
      "updated_at": "2024-01-10T10:15:00Z"
    }
  ]
}
```

### Upload Document

```http
POST /v1/knowledge/documents
Authorization: Bearer {token}
Content-Type: multipart/form-data

---
Form Data:
file: [binary]
title: "Product Catalog"
type: "catalog"

---
Response: 201 Created
{
  "success": true,
  "data": {
    "id": "doc_xxxxx",
    "title": "Product Catalog",
    "status": "processing",
    "job_id": "job_xxxxx"
  }
}
```

### Create Text Document

```http
POST /v1/knowledge/documents/text
Authorization: Bearer {token}

{
  "title": "FAQ - Returns",
  "content": "# Returns Policy\n\nWe accept returns within 30 days...",
  "type": "faq"
}
```

### Delete Document

```http
DELETE /v1/knowledge/documents/{document_id}
Authorization: Bearer {token}
```

### Search Knowledge Base

```http
GET /v1/knowledge/search?q=return policy
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": [
    {
      "chunk_id": "chunk_xxxxx",
      "document_id": "doc_xxxxx",
      "document_title": "Return Policy",
      "content": "We accept returns within 30 days of purchase...",
      "score": 0.92
    }
  ]
}
```

---

## Integration APIs

### List Integrations

```http
GET /v1/integrations
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": [
    {
      "id": "int_xxxxx",
      "type": "commerce",
      "provider": "shopify",
      "status": "connected",
      "last_sync_at": "2024-01-15T12:00:00Z",
      "config": {
        "store_url": "acme-store.myshopify.com",
        "sync_products": true,
        "sync_orders": true
      }
    }
  ]
}
```

### Connect Integration

```http
POST /v1/integrations
Authorization: Bearer {token}

{
  "type": "payment",
  "provider": "paystack",
  "credentials": {
    "public_key": "pk_live_xxxxx",
    "secret_key": "sk_live_xxxxx"
  }
}

---
Response: 201 Created
{
  "success": true,
  "data": {
    "id": "int_xxxxx",
    "type": "payment",
    "provider": "paystack",
    "status": "connected"
  }
}
```

### Test Integration

```http
POST /v1/integrations/{integration_id}/test
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": {
    "status": "healthy",
    "latency_ms": 120,
    "tested_at": "2024-01-15T16:45:00Z"
  }
}
```

### Sync Integration

```http
POST /v1/integrations/{integration_id}/sync
Authorization: Bearer {token}

{
  "sync_type": "full",
  "resources": ["products", "inventory"]
}

---
Response:
{
  "success": true,
  "data": {
    "job_id": "job_xxxxx",
    "status": "queued"
  }
}
```

### Disconnect Integration

```http
DELETE /v1/integrations/{integration_id}
Authorization: Bearer {token}
```

---

## Webhook APIs

### List Webhooks

```http
GET /v1/webhooks
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": [
    {
      "id": "wh_xxxxx",
      "url": "https://example.com/webhook",
      "events": ["order.created", "order.paid", "conversation.started"],
      "status": "active",
      "secret": "whsec_xxxxx",
      "created_at": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### Create Webhook

```http
POST /v1/webhooks
Authorization: Bearer {token}

{
  "url": "https://example.com/webhook",
  "events": ["order.created", "order.paid"],
  "secret": "my-webhook-secret"
}

---
Response: 201 Created
```

### Test Webhook

```http
POST /v1/webhooks/{webhook_id}/test
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": {
    "delivery_id": "del_xxxxx",
    "response_code": 200,
    "latency_ms": 250
  }
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `order.created` | New order created |
| `order.paid` | Payment received |
| `order.fulfilled` | Order shipped/delivered |
| `order.cancelled` | Order cancelled |
| `payment.success` | Payment successful |
| `payment.failed` | Payment failed |
| `conversation.started` | New conversation |
| `conversation.ended` | Conversation closed |
| `conversation.handover` | Handed to human |
| `customer.created` | New customer |
| `product.created` | New product |
| `product.updated` | Product updated |
| `inventory.low` | Low stock alert |

### Webhook Payload Example

```json
{
  "id": "evt_xxxxx",
  "type": "order.created",
  "created_at": "2024-01-15T16:30:00Z",
  "data": {
    "order_id": "ord_xxxxx",
    "order_number": "ORD-2024-00125",
    "customer": {
      "id": "cust_xxxxx",
      "name": "John Doe"
    },
    "total": 52000,
    "currency": "NGN"
  }
}
```

### Webhook Signature Verification

```
X-Webhook-Signature: sha256=xxxxx
X-Webhook-Timestamp: 1705336200
```

```php
$payload = file_get_contents('php://input');
$signature = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
$valid = hash_equals($signature, $receivedSignature);
```

---

## Inbound Webhook Endpoints (Platform Receives)

### WhatsApp Webhook

```http
POST /api/webhook/whatsapp
X-Hub-Signature-256: sha256=xxxxx

{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "2348100000000",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "messages": [
              {
                "from": "2348012345678",
                "id": "wamid.xxxxx",
                "timestamp": "1705336200",
                "type": "text",
                "text": {
                  "body": "Hello, I want to order"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Retell Voice Webhook

```http
POST /api/webhook/retell
X-Retell-Signature: xxxxx

{
  "event": "call_started",
  "call": {
    "call_id": "call_xxxxx",
    "from_number": "+2348012345678",
    "to_number": "+2348100000000",
    "agent_id": "agent_xxxxx"
  }
}
```

### Payment Gateway Webhooks

```http
POST /api/webhook/paystack
X-Paystack-Signature: xxxxx

{
  "event": "charge.success",
  "data": {
    "reference": "PAY-2024-xxxxx",
    "amount": 5200000,
    "currency": "NGN",
    "status": "success",
    "gateway_response": "Approved"
  }
}
```

---

## Analytics APIs

### Get Dashboard Stats

```http
GET /v1/analytics/dashboard?period=30d
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": {
    "period": "30d",
    "conversations": {
      "total": 1523,
      "change_percent": 12.5
    },
    "orders": {
      "total": 245,
      "change_percent": 8.2
    },
    "revenue": {
      "total": 12500000,
      "currency": "NGN",
      "change_percent": 15.3
    },
    "ai_performance": {
      "resolution_rate": 0.85,
      "avg_response_time_ms": 1200,
      "handover_rate": 0.15
    }
  }
}
```

### Get Conversation Analytics

```http
GET /v1/analytics/conversations?period=7d&group_by=day
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": {
    "timeseries": [
      {"date": "2024-01-09", "count": 180},
      {"date": "2024-01-10", "count": 195},
      ...
    ],
    "by_channel": {
      "whatsapp": 1200,
      "voice": 323
    },
    "by_resolution": {
      "ai_resolved": 1100,
      "human_resolved": 280,
      "unresolved": 143
    }
  }
}
```

### Export Analytics

```http
POST /v1/analytics/export
Authorization: Bearer {token}

{
  "type": "orders",
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "format": "csv"
}

---
Response:
{
  "success": true,
  "data": {
    "job_id": "job_xxxxx",
    "status": "processing",
    "download_url": null
  }
}
```

---

## Phone Number APIs

### List Phone Numbers

```http
GET /v1/phone-numbers
Authorization: Bearer {token}

---
Response:
{
  "success": true,
  "data": [
    {
      "id": "pn_xxxxx",
      "number": "+2348100000000",
      "type": "whatsapp",
      "status": "active",
      "provider": "meta",
      "capabilities": ["messaging", "voice"],
      "assigned_at": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### Provision Phone Number

```http
POST /v1/phone-numbers
Authorization: Bearer {token}

{
  "type": "voice",
  "provider": "retell",
  "country": "US",
  "area_code": "415"
}

---
Response: 201 Created
{
  "success": true,
  "data": {
    "id": "pn_xxxxx",
    "number": "+14155551234",
    "type": "voice",
    "status": "provisioning"
  }
}
```

---

## Next Steps

- See [Security & Scalability](./10-SECURITY-SCALABILITY.md) for security implementation
- See [MVP Roadmap](./11-MVP-ROADMAP.md) for development timeline
