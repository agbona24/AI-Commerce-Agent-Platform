"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Package,
  GripVertical,
  ChevronRight,
  Save,
  X,
  Folder,
  FolderOpen,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  parentId: string | null;
  children?: Category[];
  color: string;
}

const initialCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and gadgets",
    productCount: 24,
    parentId: null,
    color: "#3B82F6",
    children: [
      { id: "1-1", name: "Headphones", slug: "headphones", description: "Audio devices", productCount: 8, parentId: "1", color: "#3B82F6" },
      { id: "1-2", name: "Smartwatches", slug: "smartwatches", description: "Wearable tech", productCount: 6, parentId: "1", color: "#3B82F6" },
      { id: "1-3", name: "Accessories", slug: "electronics-accessories", description: "Electronic accessories", productCount: 10, parentId: "1", color: "#3B82F6" },
    ],
  },
  {
    id: "2",
    name: "Apparel",
    slug: "apparel",
    description: "Clothing and fashion items",
    productCount: 42,
    parentId: null,
    color: "#EC4899",
    children: [
      { id: "2-1", name: "T-Shirts", slug: "tshirts", description: "Casual wear", productCount: 15, parentId: "2", color: "#EC4899" },
      { id: "2-2", name: "Jackets", slug: "jackets", description: "Outerwear", productCount: 12, parentId: "2", color: "#EC4899" },
      { id: "2-3", name: "Pants", slug: "pants", description: "Bottom wear", productCount: 15, parentId: "2", color: "#EC4899" },
    ],
  },
  {
    id: "3",
    name: "Food & Beverage",
    slug: "food-beverage",
    description: "Food items and drinks",
    productCount: 18,
    parentId: null,
    color: "#F59E0B",
  },
  {
    id: "4",
    name: "Sports",
    slug: "sports",
    description: "Sports equipment and gear",
    productCount: 12,
    parentId: null,
    color: "#10B981",
  },
  {
    id: "5",
    name: "Home & Garden",
    slug: "home-garden",
    description: "Home décor and garden supplies",
    productCount: 8,
    parentId: null,
    color: "#8B5CF6",
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["1", "2"]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", color: "#3B82F6" });

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddCategory = () => {
    if (!newCategory.name) return;
    
    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      slug: newCategory.name.toLowerCase().replace(/\s+/g, "-"),
      description: newCategory.description,
      productCount: 0,
      parentId: null,
      color: newCategory.color,
    };
    
    setCategories(prev => [...prev, category]);
    setNewCategory({ name: "", description: "", color: "#3B82F6" });
    setIsAddingNew(false);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const colorOptions = [
    "#3B82F6", "#EC4899", "#F59E0B", "#10B981", "#8B5CF6",
    "#EF4444", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
  ];

  return (
    <div className="space-y-6 max-w-4xl">
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
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Organize your products into categories</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Tag className="w-5 h-5 text-violet-500" />
            <span className="text-2xl font-bold">{categories.length}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Categories</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Folder className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold">{categories.reduce((acc, c) => acc + (c.children?.length || 0), 0)}</span>
          </div>
          <p className="text-sm text-muted-foreground">Subcategories</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold">{categories.reduce((acc, c) => acc + c.productCount, 0)}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Products</p>
        </div>
      </div>

      {/* Add New Category Form */}
      <AnimatePresence>
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
              <h3 className="font-semibold">New Category</h3>
              <button
                onClick={() => setIsAddingNew(false)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Electronics"
                    className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description..."
                    className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex items-center gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        newCategory.color === color ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Category
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-5">Category</div>
            <div className="col-span-3">Slug</div>
            <div className="col-span-2 text-center">Products</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {categories.map((category) => (
            <div key={category.id}>
              {/* Parent Category */}
              <div className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-muted/30 transition-colors">
                <div className="col-span-5 flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                  {category.children && category.children.length > 0 ? (
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      {expandedCategories.includes(category.id) ? (
                        <FolderOpen className="w-5 h-5" style={{ color: category.color }} />
                      ) : (
                        <Folder className="w-5 h-5" style={{ color: category.color }} />
                      )}
                    </button>
                  ) : (
                    <Tag className="w-5 h-5" style={{ color: category.color }} />
                  )}
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    {category.slug}
                  </code>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-medium">{category.productCount}</span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  {category.children && category.children.length > 0 && (
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        expandedCategories.includes(category.id) ? "rotate-90" : ""
                      }`} />
                    </button>
                  )}
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Child Categories */}
              <AnimatePresence>
                {category.children && expandedCategories.includes(category.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-muted/20"
                  >
                    {category.children.map((child) => (
                      <div
                        key={child.id}
                        className="grid grid-cols-12 gap-4 items-center p-4 pl-16 border-t border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <div className="col-span-5 flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <Tag className="w-4 h-4" style={{ color: child.color }} />
                          <div>
                            <p className="font-medium text-sm">{child.name}</p>
                            <p className="text-xs text-muted-foreground">{child.description}</p>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                            {child.slug}
                          </code>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-sm font-medium">{child.productCount}</span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Subcategory Button */}
                    <div className="p-4 pl-16 border-t border-border/50">
                      <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Plus className="w-4 h-4" />
                        Add subcategory to {category.name}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
