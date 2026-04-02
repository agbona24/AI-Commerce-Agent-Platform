"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Package,
  Tag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  ArrowUpDown,
  Download,
  Upload,
  Sparkles,
  Store,
  RefreshCw,
  X,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { productService } from "@/lib/api";
import type { Product as APIProduct, Category } from "@/lib/api/types";

interface ConnectedStore {
  id: string;
  platform: string;
  name: string;
  url: string;
  productCount: number;
  lastSync: string;
  status: "connected" | "syncing" | "error";
}

const storeplatforms = [
  { id: "shopify", name: "Shopify", icon: "/stores/shopify.svg", color: "#96BF48", description: "Connect your Shopify store" },
  { id: "woocommerce", name: "WooCommerce", icon: "/stores/woocommerce.svg", color: "#96588A", description: "WordPress WooCommerce stores" },
  { id: "bigcommerce", name: "BigCommerce", icon: "/stores/bigcommerce.svg", color: "#121118", description: "Enterprise e-commerce platform" },
  { id: "magento", name: "Magento", icon: "/stores/magento.svg", color: "#F46F25", description: "Adobe Commerce / Magento" },
  { id: "squarespace", name: "Squarespace", icon: "/stores/squarespace.svg", color: "#000000", description: "Squarespace Commerce" },
  { id: "wix", name: "Wix", icon: "/stores/wix.svg", color: "#0C6EFC", description: "Wix eCommerce stores" },
  { id: "square", name: "Square", icon: "/stores/square.svg", color: "#006AFF", description: "Square Online Store" },
  { id: "prestashop", name: "PrestaShop", icon: "/stores/prestashop.svg", color: "#DF0067", description: "Open source e-commerce" },
];

const connectedStores: ConnectedStore[] = [
  {
    id: "1",
    platform: "shopify",
    name: "My Shopify Store",
    url: "mystore.myshopify.com",
    productCount: 156,
    lastSync: "2024-03-08T10:30:00Z",
    status: "connected",
  },
];

// Using APIProduct type from @/lib/api/types instead of local interface

const defaultCategories = ["All", "Electronics", "Apparel", "Food & Beverage", "Sports", "Accessories"];

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "inactive">("all");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "sales">("name");
  const [showConnectStore, setShowConnectStore] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [connectStep, setConnectStep] = useState<"select" | "configure" | "importing">("select");
  const [stores, setStores] = useState<ConnectedStore[]>(connectedStores);

  // API State
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: Record<string, unknown> = {
        page: pagination.currentPage,
        per_page: pagination.perPage,
      };
      
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const [productsRes, categoriesRes] = await Promise.all([
        productService.getProducts(filters),
        productService.getCategories().catch(() => []),
      ]);

      setProducts(productsRes.data || []);
      setPagination({
        currentPage: productsRes.meta?.current_page || 1,
        lastPage: productsRes.meta?.last_page || 1,
        total: productsRes.meta?.total || 0,
        perPage: productsRes.meta?.per_page || 20,
      });
      
      if (categoriesRes && Array.isArray(categoriesRes) && categoriesRes.length > 0) {
        setCategories(["All", ...categoriesRes.map((c: Category) => c.name)]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter and sort products client-side for immediate feedback
  const filteredProducts = products
    .filter(p => {
      if (selectedCategory !== "All" && p.category?.name !== selectedCategory) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "price": return (b.price || 0) - (a.price || 0);
        case "stock": return (b.quantity || 0) - (a.quantity || 0);
        default: return 0;
      }
    });

  const stats = {
    total: pagination.total || products.length,
    active: products.filter(p => p.status === "active").length,
    outOfStock: products.filter(p => (p.quantity || 0) === 0).length,
    totalValue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500";
      case "draft": return "bg-gray-500/10 text-gray-500";
      case "archived": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog for AI agents</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConnectStore(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <Store className="w-4 h-4" />
            Connect Store
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Connected Stores */}
      {stores.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Connected Stores</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{stores.length}</span>
            </div>
            <button
              onClick={() => setShowConnectStore(true)}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Store
            </button>
          </div>
          <div className="p-4 flex gap-4 overflow-x-auto">
            {stores.map((store) => {
              const platform = storeplatforms.find(p => p.id === store.platform);
              return (
                <div
                  key={store.id}
                  className="flex-shrink-0 w-72 bg-muted/30 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: platform?.color || "#666" }}
                      >
                        {platform?.name.charAt(0) || "S"}
                      </div>
                      <div>
                        <p className="font-medium">{store.name}</p>
                        <p className="text-xs text-muted-foreground">{platform?.name}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      store.status === "connected" ? "bg-green-500/10 text-green-500" :
                      store.status === "syncing" ? "bg-blue-500/10 text-blue-500" :
                      "bg-red-500/10 text-red-500"
                    }`}>
                      {store.status === "syncing" && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
                      {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    <p className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {store.url}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        {store.productCount} products
                      </span>
                    </div>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Sync now">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last synced: {new Date(store.lastSync).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: stats.total, icon: Package, color: "text-blue-500" },
          { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-green-500" },
          { label: "Out of Stock", value: stats.outOfStock, icon: AlertTriangle, color: "text-red-500" },
          { label: "Inventory Value", value: `$${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: "text-violet-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AI Integration Banner */}
      <div className="p-4 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-200 dark:border-violet-800 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">AI-Powered Product Catalog</h3>
            <p className="text-sm text-muted-foreground">
              Your products are automatically available to AI agents. 
              {stats.total > 0 && (
                <span className="ml-1">{stats.active} of {stats.total} products are active.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-xl border border-border bg-background"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-4 py-2 rounded-xl border border-border bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        {/* Sort */}
        <button
          onClick={() => {
            const sorts: Array<typeof sortBy> = ["sales", "name", "price", "stock"];
            const idx = sorts.indexOf(sortBy);
            setSortBy(sorts[(idx + 1) % sorts.length]);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
        </button>

        {/* View Toggle */}
        <div className="flex items-center bg-muted rounded-lg p-1 ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Link
          href="/dashboard/products/categories"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-border hover:border-primary text-sm transition-colors"
        >
          <Tag className="w-4 h-4" />
          Manage Categories
        </Link>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Image */}
              <div className="aspect-square bg-muted relative">
                {(product.images || []).length > 0 ? (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                {/* Status Badge */}
                <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>

                {/* Compare Price */}
                {product.compare_at_price && (
                  <span className="absolute bottom-2 left-2 text-xs font-medium px-2 py-1 rounded-full bg-red-500 text-white">
                    {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                  </span>
                )}

                {/* Quick Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gray-900" />
                  </Link>
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-900" />
                  </Link>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{product.category?.name}</p>
                <h3 className="font-medium mb-1 line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold">${product.price}</span>
                  {product.compare_at_price && (
                    <span className="text-sm text-muted-foreground line-through">${product.compare_at_price}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{product.quantity} in stock</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {product.sales_count || 0} sold
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add Product Card */}
          <Link
            href="/dashboard/products/new"
            className="aspect-square bg-card border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <p className="font-medium">Add Product</p>
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Sales</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{product.category?.name || '-'}</td>
                  <td className="p-4">
                    <span className="font-medium">${product.price}</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-muted-foreground line-through ml-2">${product.compare_at_price}</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={(product.quantity || 0) === 0 ? "text-red-500" : ""}>{product.quantity || 0}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{product.sales_count || 0}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === product.id ? null : product.id)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                          {activeDropdown === product.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden"
                            >
                              <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-sm">
                                <Copy className="w-4 h-4" />
                                Duplicate
                              </button>
                              <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-sm text-red-500">
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or add a new product</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowConnectStore(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
            >
              <Store className="w-4 h-4" />
              Connect Store
            </button>
            <Link
              href="/dashboard/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>
      )}

      {/* Connect Store Modal */}
      <AnimatePresence>
        {showConnectStore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => {
              setShowConnectStore(false);
              setSelectedPlatform(null);
              setConnectStep("select");
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Connect Store</h2>
                    <p className="text-sm text-muted-foreground">Import products from your e-commerce platform</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowConnectStore(false);
                    setSelectedPlatform(null);
                    setConnectStep("select");
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <AnimatePresence mode="wait">
                  {connectStep === "select" && (
                    <motion.div
                      key="select"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <p className="text-sm text-muted-foreground mb-4">Select your e-commerce platform to get started</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {storeplatforms.map((platform) => (
                          <button
                            key={platform.id}
                            onClick={() => {
                              setSelectedPlatform(platform.id);
                              setConnectStep("configure");
                            }}
                            className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                              selectedPlatform === platform.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3"
                              style={{ backgroundColor: platform.color }}
                            >
                              {platform.name.charAt(0)}
                            </div>
                            <p className="font-medium text-sm">{platform.name}</p>
                          </button>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Don&apos;t see your platform?</span>
                          {" "}You can also import products via CSV file or add them manually.
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm transition-colors">
                            <Upload className="w-4 h-4" />
                            Import CSV
                          </button>
                          <Link
                            href="/dashboard/products/new"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm transition-colors"
                            onClick={() => setShowConnectStore(false)}
                          >
                            <Plus className="w-4 h-4" />
                            Add Manually
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {connectStep === "configure" && selectedPlatform && (
                    <motion.div
                      key="configure"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <button
                        onClick={() => setConnectStep("select")}
                        className="text-sm text-primary hover:underline mb-4 flex items-center gap-1"
                      >
                        ← Back to platforms
                      </button>

                      {(() => {
                        const platform = storeplatforms.find(p => p.id === selectedPlatform);
                        return (
                          <div>
                            <div className="flex items-center gap-4 mb-6">
                              <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                                style={{ backgroundColor: platform?.color || "#666" }}
                              >
                                {platform?.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">Connect {platform?.name}</h3>
                                <p className="text-sm text-muted-foreground">{platform?.description}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Store URL</label>
                                <input
                                  type="text"
                                  placeholder={selectedPlatform === "shopify" ? "yourstore.myshopify.com" : "yourstore.com"}
                                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>

                              {selectedPlatform === "shopify" && (
                                <div>
                                  <label className="block text-sm font-medium mb-2">Access Token</label>
                                  <input
                                    type="password"
                                    placeholder="shpat_xxxxx..."
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Generate an access token from your Shopify Admin → Apps → Develop apps
                                  </p>
                                </div>
                              )}

                              {selectedPlatform === "woocommerce" && (
                                <>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Consumer Key</label>
                                    <input
                                      type="text"
                                      placeholder="ck_xxxxx..."
                                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Consumer Secret</label>
                                    <input
                                      type="password"
                                      placeholder="cs_xxxxx..."
                                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                  </div>
                                </>  
                              )}

                              {(selectedPlatform !== "shopify" && selectedPlatform !== "woocommerce") && (
                                <div>
                                  <label className="block text-sm font-medium mb-2">API Key</label>
                                  <input
                                    type="password"
                                    placeholder="Enter your API key"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>
                              )}

                              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Sync Settings</h4>
                                <div className="space-y-3">
                                  <label className="flex items-center gap-3">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                                    <span className="text-sm">Import all products</span>
                                  </label>
                                  <label className="flex items-center gap-3">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                                    <span className="text-sm">Enable Voice AI for imported products</span>
                                  </label>
                                  <label className="flex items-center gap-3">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                                    <span className="text-sm">Enable WhatsApp for imported products</span>
                                  </label>
                                  <label className="flex items-center gap-3">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                                    <span className="text-sm">Auto-sync inventory changes</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                  {connectStep === "importing" && (
                    <motion.div
                      key="importing"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Connecting to your store...</h3>
                      <p className="text-muted-foreground">This may take a few moments</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal Footer */}
              {connectStep === "configure" && (
                <div className="p-6 border-t border-border flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowConnectStore(false);
                      setSelectedPlatform(null);
                      setConnectStep("select");
                    }}
                    className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setConnectStep("importing");
                      setTimeout(() => {
                        const platform = storeplatforms.find(p => p.id === selectedPlatform);
                        setStores(prev => [...prev, {
                          id: Date.now().toString(),
                          platform: selectedPlatform || "shopify",
                          name: `New ${platform?.name} Store`,
                          url: "newstore.myshopify.com",
                          productCount: 0,
                          lastSync: new Date().toISOString(),
                          status: "syncing",
                        }]);
                        setShowConnectStore(false);
                        setSelectedPlatform(null);
                        setConnectStep("select");
                      }, 2000);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-4 h-4" />
                    Connect Store
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
