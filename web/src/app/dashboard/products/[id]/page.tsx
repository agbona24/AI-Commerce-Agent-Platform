"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Package,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Sparkles,
  Phone,
  MessageSquare,
  Plus,
  Trash2,
  Eye,
  Archive,
  Copy,
  MoreHorizontal,
  Barcode,
  Weight,
  AlertTriangle,
  TrendingUp,
  Clock,
  Edit2,
  Check,
  X,
} from "lucide-react";

interface ProductFAQ {
  id: string;
  question: string;
  answer: string;
}

const mockProduct = {
  id: "prod_1",
  name: "Wireless Headphones Pro",
  description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and supreme comfort for all-day wear.",
  shortDescription: "Premium ANC wireless headphones",
  category: "Electronics",
  status: "active" as "active" | "draft" | "archived",
  price: 199.99,
  comparePrice: 249.99,
  costPrice: 89.00,
  sku: "WHP-001-BLK",
  barcode: "8901234567890",
  stock: 45,
  lowStockAlert: 10,
  weight: 0.35,
  tags: ["headphones", "wireless", "audio", "premium"],
  voiceEnabled: true,
  whatsappEnabled: true,
  voiceDescription: "These are our premium wireless headphones featuring active noise cancellation. They offer 30 hours of battery life and are perfect for music lovers and professionals who need to focus. Currently priced at $199.99, down from $249.99.",
  faqs: [
    { id: "1", question: "What is the battery life?", answer: "The headphones offer up to 30 hours of playback on a single charge." },
    { id: "2", question: "Are they compatible with my phone?", answer: "Yes, they work with any Bluetooth-enabled device including iPhone and Android." },
    { id: "3", question: "Do they have a warranty?", answer: "Yes, they come with a 2-year manufacturer warranty." },
  ] as ProductFAQ[],
  images: ["/product1.jpg", "/product1-2.jpg", "/product1-3.jpg"],
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-20T14:45:00Z",
};

export default function ProductDetailPage() {
  const params = useParams();
  // Product ID from URL params (can be used for API calls)
  const _productId = params.id as string;
  
  const [activeTab, setActiveTab] = useState("details");
  const [product, setProduct] = useState(mockProduct);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(mockProduct);

  const tabs = [
    { id: "details", label: "Details", icon: Package },
    { id: "pricing", label: "Pricing & Inventory", icon: DollarSign },
    { id: "ai", label: "AI Settings", icon: Sparkles },
    { id: "media", label: "Media", icon: ImageIcon },
  ];

  const profitMargin = ((product.price - product.costPrice) / product.price * 100).toFixed(1);
  const discount = ((product.comparePrice - product.price) / product.comparePrice * 100).toFixed(0);

  const handleSave = () => {
    setProduct(editedProduct);
    setIsEditing(false);
  };

  const handleAddFAQ = () => {
    const newFAQ: ProductFAQ = {
      id: Date.now().toString(),
      question: "",
      answer: "",
    };
    setEditedProduct(prev => ({
      ...prev,
      faqs: [...prev.faqs, newFAQ],
    }));
  };

  const handleRemoveFAQ = (id: string) => {
    setEditedProduct(prev => ({
      ...prev,
      faqs: prev.faqs.filter(f => f.id !== id),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/products"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                product.status === "active" 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {product.status}
              </span>
            </div>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setEditedProduct(product);
                  setIsEditing(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Eye className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Copy className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
              >
                <Edit2 className="w-4 h-4" />
                Edit Product
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex border-b border-border overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary bg-muted/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Details Tab */}
                {activeTab === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">Product Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProduct.name}
                          onChange={(e) => setEditedProduct(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <p className="text-lg">{product.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Short Description</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProduct.shortDescription}
                          onChange={(e) => setEditedProduct(prev => ({ ...prev, shortDescription: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <p className="text-muted-foreground">{product.shortDescription}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Full Description</label>
                      {isEditing ? (
                        <textarea
                          rows={4}
                          value={editedProduct.description}
                          onChange={(e) => setEditedProduct(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                      ) : (
                        <p className="text-muted-foreground">{product.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        {isEditing ? (
                          <select
                            value={editedProduct.category}
                            onChange={(e) => setEditedProduct(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option>Electronics</option>
                            <option>Apparel</option>
                            <option>Food & Beverage</option>
                            <option>Sports</option>
                            <option>Home & Garden</option>
                          </select>
                        ) : (
                          <p className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-blue-500" />
                            {product.category}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        {isEditing ? (
                          <select
                            value={editedProduct.status}
                            onChange={(e) => setEditedProduct(prev => ({ ...prev, status: e.target.value as "active" | "draft" | "archived" }))}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                            product.status === "active" 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {product.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-muted rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                        {isEditing && (
                          <button className="px-3 py-1 border border-dashed border-border rounded-full text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                            + Add tag
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Pricing & Inventory Tab */}
                {activeTab === "pricing" && (
                  <motion.div
                    key="pricing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Pricing */}
                    <div>
                      <h3 className="font-medium mb-4">Pricing</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-sm">Selling Price</span>
                          </div>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedProduct.price}
                              onChange={(e) => setEditedProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="text-2xl font-bold">${product.price}</p>
                          )}
                        </div>
                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Tag className="w-4 h-4" />
                            <span className="text-sm">Compare At</span>
                          </div>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedProduct.comparePrice}
                              onChange={(e) => setEditedProduct(prev => ({ ...prev, comparePrice: parseFloat(e.target.value) }))}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="text-2xl font-bold text-muted-foreground line-through">${product.comparePrice}</p>
                          )}
                          <p className="text-sm text-green-600 mt-1">{discount}% off</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">Cost Price</span>
                          </div>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedProduct.costPrice}
                              onChange={(e) => setEditedProduct(prev => ({ ...prev, costPrice: parseFloat(e.target.value) }))}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="text-2xl font-bold">${product.costPrice}</p>
                          )}
                          <p className="text-sm text-green-600 mt-1">{profitMargin}% margin</p>
                        </div>
                      </div>
                    </div>

                    {/* Inventory */}
                    <div>
                      <h3 className="font-medium mb-4">Inventory</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Barcode className="w-4 h-4" />
                            <span className="text-sm">SKU</span>
                          </div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedProduct.sku}
                              onChange={(e) => setEditedProduct(prev => ({ ...prev, sku: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="font-mono">{product.sku}</p>
                          )}
                        </div>
                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Barcode className="w-4 h-4" />
                            <span className="text-sm">Barcode</span>
                          </div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedProduct.barcode}
                              onChange={(e) => setEditedProduct(prev => ({ ...prev, barcode: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="font-mono">{product.barcode}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Package className="w-4 h-4" />
                            <span className="text-sm">Stock Quantity</span>
                          </div>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedProduct.stock}
                              onChange={(e) => setEditedProduct(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="text-2xl font-bold">{product.stock}</p>
                          )}
                        </div>
                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm">Low Stock Alert</span>
                          </div>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedProduct.lowStockAlert}
                              onChange={(e) => setEditedProduct(prev => ({ ...prev, lowStockAlert: parseInt(e.target.value) }))}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="text-2xl font-bold">{product.lowStockAlert}</p>
                          )}
                        </div>
                        <div className="bg-muted/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Weight className="w-4 h-4" />
                            <span className="text-sm">Weight (kg)</span>
                          </div>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editedProduct.weight}
                              onChange={(e) => setEditedProduct(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="text-2xl font-bold">{product.weight}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* AI Settings Tab */}
                {activeTab === "ai" && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* AI Channels */}
                    <div>
                      <h3 className="font-medium mb-4">AI Channels</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border-2 transition-colors ${
                          (isEditing ? editedProduct.voiceEnabled : product.voiceEnabled)
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                            : "border-border"
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Phone className="w-5 h-5 text-violet-600" />
                              <span className="font-medium">Voice AI</span>
                            </div>
                            {isEditing ? (
                              <button
                                onClick={() => setEditedProduct(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}
                                className={`w-12 h-6 rounded-full transition-colors ${
                                  editedProduct.voiceEnabled ? "bg-violet-500" : "bg-gray-300 dark:bg-gray-600"
                                }`}
                              >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                  editedProduct.voiceEnabled ? "translate-x-6" : "translate-x-0.5"
                                }`} />
                              </button>
                            ) : (
                              <span className={`text-sm ${product.voiceEnabled ? "text-green-600" : "text-gray-500"}`}>
                                {product.voiceEnabled ? "Enabled" : "Disabled"}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Allow AI to discuss this product during voice calls
                          </p>
                        </div>
                        <div className={`p-4 rounded-xl border-2 transition-colors ${
                          (isEditing ? editedProduct.whatsappEnabled : product.whatsappEnabled)
                            ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                            : "border-border"
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-5 h-5 text-green-600" />
                              <span className="font-medium">WhatsApp</span>
                            </div>
                            {isEditing ? (
                              <button
                                onClick={() => setEditedProduct(prev => ({ ...prev, whatsappEnabled: !prev.whatsappEnabled }))}
                                className={`w-12 h-6 rounded-full transition-colors ${
                                  editedProduct.whatsappEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                                }`}
                              >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                  editedProduct.whatsappEnabled ? "translate-x-6" : "translate-x-0.5"
                                }`} />
                              </button>
                            ) : (
                              <span className={`text-sm ${product.whatsappEnabled ? "text-green-600" : "text-gray-500"}`}>
                                {product.whatsappEnabled ? "Enabled" : "Disabled"}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Allow AI to share this product via WhatsApp
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Voice Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Voice Description
                        <span className="text-muted-foreground font-normal ml-2">
                          How the AI will describe this product during calls
                        </span>
                      </label>
                      {isEditing ? (
                        <textarea
                          rows={4}
                          value={editedProduct.voiceDescription}
                          onChange={(e) => setEditedProduct(prev => ({ ...prev, voiceDescription: e.target.value }))}
                          placeholder="Write a natural description for the AI to read..."
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                      ) : (
                        <div className="bg-muted/50 rounded-xl p-4">
                          <p className="text-muted-foreground">{product.voiceDescription}</p>
                        </div>
                      )}
                    </div>

                    {/* Product FAQs */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium">Product FAQs</h3>
                          <p className="text-sm text-muted-foreground">Common questions the AI can answer about this product</p>
                        </div>
                        {isEditing && (
                          <button
                            onClick={handleAddFAQ}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm hover:opacity-90"
                          >
                            <Plus className="w-4 h-4" />
                            Add FAQ
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {(isEditing ? editedProduct.faqs : product.faqs).map((faq, index) => (
                          <div key={faq.id} className="bg-muted/50 rounded-xl p-4">
                            {isEditing ? (
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="text"
                                    value={faq.question}
                                    onChange={(e) => {
                                      const updated = [...editedProduct.faqs];
                                      updated[index].question = e.target.value;
                                      setEditedProduct(prev => ({ ...prev, faqs: updated }));
                                    }}
                                    placeholder="Question..."
                                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                  <button
                                    onClick={() => handleRemoveFAQ(faq.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <textarea
                                  value={faq.answer}
                                  onChange={(e) => {
                                    const updated = [...editedProduct.faqs];
                                    updated[index].answer = e.target.value;
                                    setEditedProduct(prev => ({ ...prev, faqs: updated }));
                                  }}
                                  placeholder="Answer..."
                                  rows={2}
                                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                              </div>
                            ) : (
                              <>
                                <p className="font-medium text-sm mb-2">Q: {faq.question}</p>
                                <p className="text-sm text-muted-foreground">A: {faq.answer}</p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Media Tab */}
                {activeTab === "media" && (
                  <motion.div
                    key="media"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-medium mb-4">Product Images</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {product.images.map((image, index) => (
                          <div key={index} className="aspect-square bg-muted rounded-xl relative group overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            {isEditing && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="p-2 bg-white rounded-lg">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-red-500 text-white rounded-lg">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {index === 0 && (
                              <span className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs rounded">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                        {isEditing && (
                          <div className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-muted/50 cursor-pointer transition-colors">
                            <Plus className="w-8 h-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Add Image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium mb-4">Quick Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-bold text-lg">${product.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stock</span>
                <span className={`font-medium ${product.stock <= product.lowStockAlert ? "text-amber-600" : ""}`}>
                  {product.stock} units
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Margin</span>
                <span className="text-green-600 font-medium">{profitMargin}%</span>
              </div>
              <hr className="border-border" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Value in Stock</span>
                <span className="font-bold">${(product.stock * product.price).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* AI Channels Status */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium mb-4">AI Channels</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-violet-600" />
                  <span>Voice AI</span>
                </div>
                <span className={`text-sm ${product.voiceEnabled ? "text-green-600" : "text-gray-500"}`}>
                  {product.voiceEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span>WhatsApp</span>
                </div>
                <span className={`text-sm ${product.whatsappEnabled ? "text-green-600" : "text-gray-500"}`}>
                  {product.whatsappEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-medium mb-4">History</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-card border border-red-200 dark:border-red-900 rounded-xl p-6">
            <h3 className="font-medium text-red-600 mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-sm">
                <Archive className="w-4 h-4" />
                Archive Product
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-sm">
                <Trash2 className="w-4 h-4" />
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
