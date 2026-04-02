"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  Plus,
  Package,
  DollarSign,
  Box,
  FileText,
  Image as ImageIcon,
  Phone,
  MessageSquare,
  Sparkles,
  Info,
  Trash2,
  GripVertical,
} from "lucide-react";

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface ProductFormData {
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  sku: string;
  barcode: string;
  stock: number;
  lowStockAlert: number;
  weight: number;
  weightUnit: string;
  status: "active" | "draft";
  images: string[];
  voiceEnabled: boolean;
  whatsappEnabled: boolean;
  voiceDescription: string;
  faqAnswers: Array<{ question: string; answer: string }>;
  variants: ProductVariant[];
  tags: string[];
}

const categories = [
  "Electronics",
  "Apparel",
  "Food & Beverage",
  "Sports",
  "Accessories",
  "Home & Garden",
  "Health & Beauty",
  "Toys & Games",
];

export default function NewProductPage() {
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "inventory" | "ai" | "media">("basic");
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    shortDescription: "",
    category: "",
    price: 0,
    comparePrice: null,
    costPrice: null,
    sku: "",
    barcode: "",
    stock: 0,
    lowStockAlert: 5,
    weight: 0,
    weightUnit: "kg",
    status: "draft",
    images: [],
    voiceEnabled: true,
    whatsappEnabled: true,
    voiceDescription: "",
    faqAnswers: [{ question: "", answer: "" }],
    variants: [],
    tags: [],
  });
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const addFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqAnswers: [...prev.faqAnswers, { question: "", answer: "" }],
    }));
  };

  const removeFAQ = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqAnswers: prev.faqAnswers.filter((_, i) => i !== index),
    }));
  };

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    setFormData(prev => ({
      ...prev,
      faqAnswers: prev.faqAnswers.map((faq, i) => i === index ? { ...faq, [field]: value } : faq),
    }));
  };

  const handleSave = async (status: "draft" | "active") => {
    setIsSaving(true);
    setFormData(prev => ({ ...prev, status }));
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const tabs = [
    { id: "basic" as const, label: "Basic Info", icon: FileText },
    { id: "pricing" as const, label: "Pricing", icon: DollarSign },
    { id: "inventory" as const, label: "Inventory", icon: Box },
    { id: "ai" as const, label: "AI Settings", icon: Sparkles },
    { id: "media" as const, label: "Media", icon: ImageIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/products"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add New Product</h1>
            <p className="text-muted-foreground">Create a product for your AI agents</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("active")}
            disabled={isSaving || !formData.name || !formData.price}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Publish Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "basic" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-lg">Product Information</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Wireless Bluetooth Headphones"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Short Description</label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="Brief one-line description"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Used by AI agents for quick product mentions</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Full Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed product description..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "pricing" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-lg">Pricing</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        value={formData.price || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Compare-at Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        value={formData.comparePrice || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, comparePrice: parseFloat(e.target.value) || null }))}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Original price before discount</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cost per Item</label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={formData.costPrice || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || null }))}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">For profit calculation (not shown to customers)</p>
                </div>

                {formData.price > 0 && formData.costPrice && (
                  <div className="p-4 bg-green-500/10 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Profit Margin</span>
                      <span className="font-bold text-green-600">
                        ${(formData.price - formData.costPrice).toFixed(2)} ({Math.round(((formData.price - formData.costPrice) / formData.price) * 100)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "inventory" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-lg">Inventory</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Stock Keeping Unit"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Barcode</label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                      placeholder="UPC, EAN, etc."
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Low Stock Alert</label>
                    <input
                      type="number"
                      value={formData.lowStockAlert}
                      onChange={(e) => setFormData(prev => ({ ...prev, lowStockAlert: parseInt(e.target.value) || 0 }))}
                      placeholder="5"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Alert when stock falls below</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Weight</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.weight || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <select
                        value={formData.weightUnit}
                        onChange={(e) => setFormData(prev => ({ ...prev, weightUnit: e.target.value }))}
                        className="px-4 py-3 rounded-xl border border-border bg-background"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">AI Agent Settings</h2>
                    <p className="text-sm text-muted-foreground">Configure how AI agents present this product</p>
                  </div>
                </div>

                {/* Channel Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.voiceEnabled ? "border-green-500 bg-green-500/5" : "border-border"
                  }`} onClick={() => setFormData(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-500" />
                        <span className="font-medium">Voice AI</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.voiceEnabled}
                          onChange={() => {}}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
                      </label>
                    </div>
                    <p className="text-sm text-muted-foreground">Allow voice agents to discuss this product</p>
                  </div>

                  <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.whatsappEnabled ? "border-green-600 bg-green-600/5" : "border-border"
                  }`} onClick={() => setFormData(prev => ({ ...prev, whatsappEnabled: !prev.whatsappEnabled }))}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <span className="font-medium">WhatsApp</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.whatsappEnabled}
                          onChange={() => {}}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
                      </label>
                    </div>
                    <p className="text-sm text-muted-foreground">Allow WhatsApp agents to share this product</p>
                  </div>
                </div>

                {/* Voice Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Voice Description
                    <span className="ml-2 text-muted-foreground font-normal">(how AI says it)</span>
                  </label>
                  <textarea
                    value={formData.voiceDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, voiceDescription: e.target.value }))}
                    placeholder="e.g., Our premium wireless headphones feature active noise cancellation and provide up to 30 hours of battery life. They're perfect for music lovers and professionals alike."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Write how you want the AI to describe this product verbally
                  </p>
                </div>

                {/* Product FAQs */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="block text-sm font-medium">Product FAQs</label>
                      <p className="text-xs text-muted-foreground">Common questions about this product</p>
                    </div>
                    <button
                      onClick={addFAQ}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Plus className="w-4 h-4" />
                      Add Q&A
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.faqAnswers.map((faq, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-xl space-y-3">
                        <div className="flex items-start gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground mt-3 cursor-move" />
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => updateFAQ(index, "question", e.target.value)}
                              placeholder="Question: e.g., Does it have noise cancellation?"
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                            <textarea
                              value={faq.answer}
                              onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                              placeholder="Answer: e.g., Yes, our headphones feature advanced active noise cancellation..."
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                            />
                          </div>
                          {formData.faqAnswers.length > 1 && (
                            <button
                              onClick={() => removeFAQ(index)}
                              className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "media" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-lg">Product Images</h2>

                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium mb-1">Drop images here or click to upload</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, WEBP up to 10MB each</p>
                </div>

                {/* Image Grid Placeholder */}
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-1">Images for WhatsApp Catalog</p>
                      <p className="text-muted-foreground">
                        Upload high-quality images. The first image will be used as the primary image 
                        when sharing via WhatsApp catalogs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-medium mb-3">Product Status</h3>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "draft" | "active" }))}
              className="w-full px-4 py-2 rounded-xl border border-border bg-background"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              {formData.status === "draft" 
                ? "Draft products are not visible to AI agents" 
                : "Active products can be discussed by AI agents"}
            </p>
          </div>

          {/* Preview Card */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-medium mb-3">Product Preview</h3>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center mb-4">
              {formData.images.length > 0 ? (
                <Package className="w-12 h-12 text-muted-foreground" />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <h4 className="font-semibold">{formData.name || "Product Name"}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {formData.shortDescription || "Short description..."}
            </p>
            <div className="flex items-center gap-2">
              <span className="font-bold">${formData.price || "0.00"}</span>
              {formData.comparePrice && (
                <span className="text-sm text-muted-foreground line-through">${formData.comparePrice}</span>
              )}
            </div>
          </div>

          {/* AI Channels */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-medium mb-3">AI Channels</h3>
            <div className="space-y-2">
              <div className={`flex items-center justify-between p-2 rounded-lg ${
                formData.voiceEnabled ? "bg-green-500/10" : "bg-muted"
              }`}>
                <div className="flex items-center gap-2">
                  <Phone className={`w-4 h-4 ${formData.voiceEnabled ? "text-green-500" : "text-muted-foreground"}`} />
                  <span className="text-sm">Voice AI</span>
                </div>
                <span className={`text-xs font-medium ${formData.voiceEnabled ? "text-green-500" : "text-muted-foreground"}`}>
                  {formData.voiceEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className={`flex items-center justify-between p-2 rounded-lg ${
                formData.whatsappEnabled ? "bg-green-600/10" : "bg-muted"
              }`}>
                <div className="flex items-center gap-2">
                  <MessageSquare className={`w-4 h-4 ${formData.whatsappEnabled ? "text-green-600" : "text-muted-foreground"}`} />
                  <span className="text-sm">WhatsApp</span>
                </div>
                <span className={`text-xs font-medium ${formData.whatsappEnabled ? "text-green-600" : "text-muted-foreground"}`}>
                  {formData.whatsappEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-medium mb-3">Inventory Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock:</span>
                <span className="font-medium">{formData.stock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU:</span>
                <span className="font-medium">{formData.sku || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{formData.category || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
