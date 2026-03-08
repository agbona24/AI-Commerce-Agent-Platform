# Knowledge Engine

## Overview

The Knowledge Engine is the AI's information retrieval system. It provides the AI agent with access to both structured operational data (products, inventory, pricing) and unstructured knowledge (FAQs, policies, sales scripts).

**Critical Design Principle**: Operational data (stock levels, prices, order status) must be retrieved via real-time API/database queries, NOT from embeddings. Embeddings are only for static knowledge content.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              KNOWLEDGE ENGINE                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │                        Knowledge Router                                      │   │
│   │                                                                              │   │
│   │   Determines whether query needs:                                            │   │
│   │   • Structured data (API/DB) → ProductService, InventoryService              │   │
│   │   • Unstructured data (RAG) → VectorSearch                                   │   │
│   │   • Hybrid (both)                                                            │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                         │                                            │
│              ┌──────────────────────────┴──────────────────────────┐                │
│              │                                                      │                │
│              ▼                                                      ▼                │
│   ┌─────────────────────────────────┐       ┌─────────────────────────────────────┐ │
│   │    STRUCTURED DATA LAYER        │       │    UNSTRUCTURED DATA LAYER          │ │
│   │    (Real-time Queries)          │       │    (RAG / Embeddings)               │ │
│   │                                 │       │                                     │ │
│   │  ┌───────────────────────────┐  │       │  ┌───────────────────────────────┐  │ │
│   │  │ ProductCatalogService     │  │       │  │ EmbeddingService              │  │ │
│   │  │ • search_products()       │  │       │  │ • generate_embedding()        │  │ │
│   │  │ • get_product_details()   │  │       │  │ • index_document()            │  │ │
│   │  │ • get_categories()        │  │       │  │ • update_index()              │  │ │
│   │  └───────────────────────────┘  │       │  └───────────────────────────────┘  │ │
│   │                                 │       │                                     │ │
│   │  ┌───────────────────────────┐  │       │  ┌───────────────────────────────┐  │ │
│   │  │ InventoryService          │  │       │  │ VectorSearchService           │  │ │
│   │  │ • check_stock()           │  │       │  │ • search_similar()            │  │ │
│   │  │ • get_availability()      │  │       │  │ • hybrid_search()             │  │ │
│   │  │ • reserve_stock()         │  │       │  │ • rerank_results()            │  │ │
│   │  └───────────────────────────┘  │       │  └───────────────────────────────┘  │ │
│   │                                 │       │                                     │ │
│   │  ┌───────────────────────────┐  │       │  ┌───────────────────────────────┐  │ │
│   │  │ PricingService            │  │       │  │ DocumentStore                 │  │ │
│   │  │ • get_price()             │  │       │  │ • FAQs                        │  │ │
│   │  │ • get_discounts()         │  │       │  │ • Company policies            │  │ │
│   │  │ • calculate_total()       │  │       │  │ • Sales scripts               │  │ │
│   │  └───────────────────────────┘  │       │  │ • Support articles            │  │ │
│   │                                 │       │  │ • Product descriptions (long) │  │ │
│   │  ┌───────────────────────────┐  │       │  └───────────────────────────────┘  │ │
│   │  │ OrderStatusService        │  │       │                                     │ │
│   │  │ • get_order_status()      │  │       │         ┌─────────────────────┐     │ │
│   │  │ • get_tracking_info()     │  │       │         │   Vector Database   │     │ │
│   │  └───────────────────────────┘  │       │         │   (Pinecone/pgvector)│    │ │
│   │                                 │       │         └─────────────────────┘     │ │
│   └─────────────────────────────────┘       └─────────────────────────────────────┘ │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Classification

### Structured Data (Real-time API/DB Queries)

| Data Type | Source | Update Frequency | Query Method |
|-----------|--------|------------------|--------------|
| Product catalog | PostgreSQL / External API | Real-time | SQL / API |
| Inventory levels | ERP / PostgreSQL | Real-time | API |
| Pricing | PostgreSQL / ERP | Real-time | SQL / API |
| Order status | PostgreSQL | Real-time | SQL |
| Customer history | PostgreSQL | Real-time | SQL |
| Shipping rates | External API | Real-time | API |

### Unstructured Data (RAG / Embeddings)

| Data Type | Source | Update Frequency | Storage |
|-----------|--------|------------------|---------|
| FAQs | Admin upload | Periodic | Vector DB |
| Company policies | Admin upload | Periodic | Vector DB |
| Sales scripts | Admin upload | Periodic | Vector DB |
| Product descriptions (detailed) | Admin upload | Periodic | Vector DB |
| Support documentation | Admin upload | Periodic | Vector DB |
| Terms & conditions | Admin upload | Periodic | Vector DB |

---

## Service Specifications

### 1. ProductCatalogService

```php
<?php

namespace App\Engines\Knowledge\Services;

class ProductCatalogService
{
    /**
     * Search products by query string
     * 
     * @param string $tenantId
     * @param string $query
     * @param array $filters ['category', 'price_min', 'price_max', 'in_stock']
     * @param int $limit
     * @return array
     */
    public function searchProducts(
        string $tenantId,
        string $query,
        array $filters = [],
        int $limit = 10
    ): array;

    /**
     * Get detailed product information
     * 
     * @param string $tenantId
     * @param string $productId
     * @return Product|null
     */
    public function getProductDetails(
        string $tenantId,
        string $productId
    ): ?Product;

    /**
     * Get product categories
     * 
     * @param string $tenantId
     * @return array
     */
    public function getCategories(string $tenantId): array;

    /**
     * Get products by category
     * 
     * @param string $tenantId
     * @param string $categoryId
     * @param int $limit
     * @return array
     */
    public function getProductsByCategory(
        string $tenantId,
        string $categoryId,
        int $limit = 20
    ): array;

    /**
     * Get product recommendations based on context
     * 
     * @param string $tenantId
     * @param array $context ['viewed_products', 'cart_items', 'customer_id']
     * @param int $limit
     * @return array
     */
    public function getRecommendations(
        string $tenantId,
        array $context,
        int $limit = 5
    ): array;
}
```

### 2. InventoryService

```php
<?php

namespace App\Engines\Knowledge\Services;

class InventoryService
{
    /**
     * Check stock availability for a product
     * 
     * @param string $tenantId
     * @param string $productId
     * @param string|null $variantId
     * @return StockInfo
     */
    public function checkStock(
        string $tenantId,
        string $productId,
        ?string $variantId = null
    ): StockInfo;

    /**
     * Check stock for multiple products
     * 
     * @param string $tenantId
     * @param array $productIds
     * @return array<string, StockInfo>
     */
    public function checkBulkStock(
        string $tenantId,
        array $productIds
    ): array;

    /**
     * Reserve stock for pending order
     * 
     * @param string $tenantId
     * @param string $productId
     * @param int $quantity
     * @param string $reservationId
     * @param int $ttlMinutes
     * @return bool
     */
    public function reserveStock(
        string $tenantId,
        string $productId,
        int $quantity,
        string $reservationId,
        int $ttlMinutes = 30
    ): bool;

    /**
     * Release reserved stock
     * 
     * @param string $reservationId
     * @return bool
     */
    public function releaseReservation(string $reservationId): bool;

    /**
     * Commit reservation (after payment)
     * 
     * @param string $reservationId
     * @return bool
     */
    public function commitReservation(string $reservationId): bool;
}
```

**StockInfo DTO:**

```php
class StockInfo
{
    public int $quantity;
    public bool $inStock;
    public string $status; // 'in_stock', 'low_stock', 'out_of_stock', 'backorder'
    public ?int $lowStockThreshold;
    public ?string $restockDate;
    public ?string $warehouseLocation;
}
```

### 3. PricingService

```php
<?php

namespace App\Engines\Knowledge\Services;

class PricingService
{
    /**
     * Get current price for a product
     * 
     * @param string $tenantId
     * @param string $productId
     * @param string|null $variantId
     * @param string|null $customerId (for customer-specific pricing)
     * @return PriceInfo
     */
    public function getPrice(
        string $tenantId,
        string $productId,
        ?string $variantId = null,
        ?string $customerId = null
    ): PriceInfo;

    /**
     * Get applicable discounts
     * 
     * @param string $tenantId
     * @param array $productIds
     * @param string|null $customerId
     * @param string|null $couponCode
     * @return array<Discount>
     */
    public function getDiscounts(
        string $tenantId,
        array $productIds,
        ?string $customerId = null,
        ?string $couponCode = null
    ): array;

    /**
     * Calculate cart total with discounts and taxes
     * 
     * @param string $tenantId
     * @param array $items [['product_id', 'variant_id', 'quantity']]
     * @param string|null $customerId
     * @param string|null $couponCode
     * @return CartTotal
     */
    public function calculateTotal(
        string $tenantId,
        array $items,
        ?string $customerId = null,
        ?string $couponCode = null
    ): CartTotal;
}
```

### 4. VectorSearchService (RAG)

```php
<?php

namespace App\Engines\Knowledge\Services;

class VectorSearchService
{
    /**
     * Search for relevant knowledge chunks
     * 
     * @param string $tenantId
     * @param string $query
     * @param array $filters ['type' => ['faq', 'policy', 'script']]
     * @param int $topK
     * @return array<SearchResult>
     */
    public function search(
        string $tenantId,
        string $query,
        array $filters = [],
        int $topK = 5
    ): array;

    /**
     * Hybrid search combining vector + keyword
     * 
     * @param string $tenantId
     * @param string $query
     * @param array $filters
     * @param float $vectorWeight (0-1)
     * @return array<SearchResult>
     */
    public function hybridSearch(
        string $tenantId,
        string $query,
        array $filters = [],
        float $vectorWeight = 0.7
    ): array;

    /**
     * Index a new document
     * 
     * @param string $tenantId
     * @param Document $document
     * @return bool
     */
    public function indexDocument(
        string $tenantId,
        Document $document
    ): bool;

    /**
     * Delete document from index
     * 
     * @param string $tenantId
     * @param string $documentId
     * @return bool
     */
    public function deleteDocument(
        string $tenantId,
        string $documentId
    ): bool;
}
```

---

## Knowledge Router

The Knowledge Router determines how to handle each AI query:

```php
<?php

namespace App\Engines\Knowledge;

class KnowledgeRouter
{
    private array $queryPatterns = [
        'structured' => [
            'product_search' => '/price|cost|stock|inventory|available|in stock/i',
            'order_status' => '/order|tracking|delivery|shipment|where is my/i',
            'product_lookup' => '/do you have|looking for|find me|show me/i',
        ],
        'unstructured' => [
            'faq' => '/how do|what is|can i|policy|return|refund|warranty/i',
            'support' => '/help|support|issue|problem|not working/i',
        ],
    ];

    /**
     * Route query to appropriate knowledge source
     */
    public function route(string $query, array $context): RouteResult
    {
        $routes = [];

        // Check for structured data patterns
        if ($this->needsProductData($query, $context)) {
            $routes[] = new Route('structured', 'product_catalog');
        }

        if ($this->needsInventoryData($query, $context)) {
            $routes[] = new Route('structured', 'inventory');
        }

        if ($this->needsPricing($query, $context)) {
            $routes[] = new Route('structured', 'pricing');
        }

        if ($this->needsOrderStatus($query, $context)) {
            $routes[] = new Route('structured', 'order_status');
        }

        // Check for unstructured data patterns
        if ($this->needsFAQ($query, $context)) {
            $routes[] = new Route('unstructured', 'vector_search', [
                'filter' => ['type' => 'faq']
            ]);
        }

        if ($this->needsPolicy($query, $context)) {
            $routes[] = new Route('unstructured', 'vector_search', [
                'filter' => ['type' => 'policy']
            ]);
        }

        return new RouteResult($routes);
    }
}
```

---

## RAG Pipeline

### Document Ingestion Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Document       │     │  Chunking        │     │  Embedding     │
│  Upload         │────▶│  Service         │────▶│  Service       │
│  (PDF,TXT,MD)   │     │                  │     │  (OpenAI)      │
└─────────────────┘     └──────────────────┘     └────────┬───────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Document       │     │  Metadata        │     │  Vector        │
│  Index          │◀────│  Tagging         │◀────│  Store         │
│  (PostgreSQL)   │     │                  │     │  (Pinecone)    │
└─────────────────┘     └──────────────────┘     └────────────────┘
```

### Chunking Strategy

```php
class ChunkingService
{
    private int $chunkSize = 512;      // tokens
    private int $chunkOverlap = 50;    // tokens
    
    public function chunk(string $content, string $type): array
    {
        // Different strategies per content type
        return match($type) {
            'faq' => $this->chunkByQA($content),
            'policy' => $this->chunkBySection($content),
            'product_description' => $this->chunkByParagraph($content),
            default => $this->chunkBySize($content),
        };
    }

    private function chunkByQA(string $content): array
    {
        // Keep Q&A pairs together
        // Split on "Q:" or "Question:" patterns
    }

    private function chunkBySection(string $content): array
    {
        // Split on headers (##, ###)
        // Keep sections intact when possible
    }
}
```

### Retrieval Flow

```
User Query: "What is your return policy for electronics?"

┌────────────────────────────────────────────────────────────────┐
│ 1. QUERY PROCESSING                                            │
│    • Extract key terms: "return policy", "electronics"         │
│    • Generate query embedding                                   │
└─────────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. VECTOR SEARCH                                                │
│    • Search Pinecone with tenant filter                         │
│    • Filter: type = 'policy'                                    │
│    • Return top 5 chunks with similarity scores                 │
└─────────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. RERANKING (Optional)                                         │
│    • Use cross-encoder for better relevance                     │
│    • Reorder results by semantic relevance                      │
└─────────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. CONTEXT ASSEMBLY                                             │
│    • Combine top 3 chunks into context                          │
│    • Add source metadata                                        │
│    • Pass to AI with system prompt                              │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Knowledge-specific)

```sql
-- Knowledge documents table
CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'faq', 'policy', 'script', 'support', 'product_doc'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'draft', 'archived'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_knowledge_tenant (tenant_id),
    INDEX idx_knowledge_type (type)
);

-- Knowledge chunks (for RAG)
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    token_count INT NOT NULL,
    embedding_id VARCHAR(255), -- Reference to vector in Pinecone
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_chunks_document (document_id),
    INDEX idx_chunks_tenant (tenant_id)
);

-- Product catalog (structured data)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    external_id VARCHAR(255), -- ID from Shopify/external system
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category_id UUID REFERENCES product_categories(id),
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    images JSONB DEFAULT '[]',
    attributes JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_products_tenant (tenant_id),
    INDEX idx_products_sku (tenant_id, sku),
    INDEX idx_products_name (tenant_id, name),
    INDEX idx_products_category (category_id)
);

-- Product variants
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL, -- e.g., "128GB - Black"
    price DECIMAL(10,2) NOT NULL,
    attributes JSONB DEFAULT '{}', -- {"size": "128GB", "color": "Black"}
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_variants_product (product_id),
    INDEX idx_variants_tenant (tenant_id)
);

-- Inventory
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    warehouse_location VARCHAR(100),
    last_sync_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, product_id, variant_id),
    INDEX idx_inventory_tenant (tenant_id),
    INDEX idx_inventory_product (product_id)
);

-- Stock reservations (for pending orders)
CREATE TABLE stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INT NOT NULL,
    order_id UUID,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'committed', 'released', 'expired'
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_reservations_tenant (tenant_id),
    INDEX idx_reservations_expires (expires_at)
);
```

---

## Configuration

```php
// config/knowledge.php

return [
    'embedding' => [
        'provider' => env('EMBEDDING_PROVIDER', 'openai'),
        'model' => env('EMBEDDING_MODEL', 'text-embedding-3-small'),
        'dimensions' => env('EMBEDDING_DIMENSIONS', 1536),
    ],

    'vector_store' => [
        'provider' => env('VECTOR_STORE', 'pinecone'), // 'pinecone' or 'pgvector'
        'index_name' => env('PINECONE_INDEX', 'knowledge'),
        'namespace_per_tenant' => true,
    ],

    'chunking' => [
        'default_chunk_size' => 512,
        'default_overlap' => 50,
        'max_chunks_per_document' => 100,
    ],

    'retrieval' => [
        'default_top_k' => 5,
        'similarity_threshold' => 0.7,
        'reranking_enabled' => env('RERANKING_ENABLED', false),
    ],

    'cache' => [
        'product_cache_ttl' => 300, // 5 minutes
        'inventory_cache_ttl' => 60, // 1 minute (more frequent updates)
        'knowledge_cache_ttl' => 3600, // 1 hour
    ],
];
```

---

## AI Tool Definitions

The Knowledge Engine exposes these tools to the AI agent:

```json
{
  "tools": [
    {
      "name": "search_products",
      "description": "Search the product catalog by name, category, or attributes. Returns matching products with prices and basic info.",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search query (product name, keywords)"
          },
          "category": {
            "type": "string",
            "description": "Filter by category name"
          },
          "max_price": {
            "type": "number",
            "description": "Maximum price filter"
          },
          "in_stock_only": {
            "type": "boolean",
            "description": "Only return products in stock"
          }
        },
        "required": ["query"]
      }
    },
    {
      "name": "get_product_details",
      "description": "Get detailed information about a specific product including all variants, pricing, and availability.",
      "parameters": {
        "type": "object",
        "properties": {
          "product_id": {
            "type": "string",
            "description": "The product ID"
          }
        },
        "required": ["product_id"]
      }
    },
    {
      "name": "check_inventory",
      "description": "Check real-time stock availability for a product or variant.",
      "parameters": {
        "type": "object",
        "properties": {
          "product_id": {
            "type": "string",
            "description": "The product ID"
          },
          "variant_id": {
            "type": "string",
            "description": "Optional variant ID for specific variant"
          }
        },
        "required": ["product_id"]
      }
    },
    {
      "name": "search_knowledge",
      "description": "Search FAQs, policies, and support documentation for answers to customer questions.",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "The question or topic to search for"
          },
          "type": {
            "type": "string",
            "enum": ["faq", "policy", "support", "all"],
            "description": "Type of knowledge to search"
          }
        },
        "required": ["query"]
      }
    },
    {
      "name": "get_recommendations",
      "description": "Get product recommendations based on current conversation context.",
      "parameters": {
        "type": "object",
        "properties": {
          "based_on_product_id": {
            "type": "string",
            "description": "Product ID to base recommendations on"
          },
          "category": {
            "type": "string",
            "description": "Category to recommend from"
          }
        }
      }
    }
  ]
}
```

---

## Next Steps

Continue to: [Transaction Engine →](03-TRANSACTION-ENGINE.md)
