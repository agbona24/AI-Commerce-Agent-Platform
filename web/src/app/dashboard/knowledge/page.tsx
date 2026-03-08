"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  FileText,
  Link as LinkIcon,
  Upload,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  File,
  Globe,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

const knowledgeItems = [
  {
    id: "1",
    title: "Product Catalog 2024",
    type: "document",
    status: "processed",
    items: 245,
    lastUpdated: "2 hours ago",
    size: "2.4 MB",
  },
  {
    id: "2",
    title: "Pricing & Discounts",
    type: "document",
    status: "processed",
    items: 58,
    lastUpdated: "1 day ago",
    size: "856 KB",
  },
  {
    id: "3",
    title: "FAQs & Support",
    type: "document",
    status: "processed",
    items: 124,
    lastUpdated: "3 days ago",
    size: "1.1 MB",
  },
  {
    id: "4",
    title: "Company Website",
    type: "website",
    status: "processing",
    items: 89,
    lastUpdated: "Just now",
    url: "https://example.com",
  },
  {
    id: "5",
    title: "Shipping & Returns Policy",
    type: "document",
    status: "processed",
    items: 32,
    lastUpdated: "1 week ago",
    size: "428 KB",
  },
];

const stats = [
  { label: "Total Documents", value: "12", icon: FileText },
  { label: "Knowledge Items", value: "548", icon: BookOpen },
  { label: "Websites Synced", value: "3", icon: Globe },
  { label: "Last Updated", value: "2h ago", icon: Clock },
];

function getTypeIcon(type: string) {
  switch (type) {
    case "document":
      return <FileText className="w-5 h-5 text-blue-500" />;
    case "website":
      return <Globe className="w-5 h-5 text-green-500" />;
    default:
      return <File className="w-5 h-5" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "processed":
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-green-500">
          <CheckCircle2 className="w-3 h-3" />
          Processed
        </span>
      );
    case "processing":
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-yellow-500">
          <Clock className="w-3 h-3 animate-spin" />
          Processing
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertCircle className="w-3 h-3" />
          Error
        </span>
      );
    default:
      return null;
  }
}

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Train your AI with business knowledge</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <LinkIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Add Website</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 bg-card border border-border rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Knowledge Items */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="divide-y divide-border">
          {knowledgeItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                {getTypeIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  {getStatusBadge(item.status)}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{item.items} items</span>
                  <span>•</span>
                  <span>{item.lastUpdated}</span>
                  {item.size && (
                    <>
                      <span>•</span>
                      <span>{item.size}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Drop files here to upload</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Support for PDF, DOCX, TXT, CSV files up to 10MB
        </p>
        <button className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
          Browse Files
        </button>
      </motion.div>
    </div>
  );
}
