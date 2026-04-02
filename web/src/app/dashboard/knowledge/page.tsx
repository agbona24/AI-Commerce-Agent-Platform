"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  Link as LinkIcon,
  Upload,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  File,
  Globe,
  Loader2,
  RefreshCw,
  X,
  Plus,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { knowledgeBaseService } from "@/lib/api";
import type { KnowledgeBase } from "@/lib/api/types";

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
    case "completed":
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-green-500">
          <CheckCircle2 className="w-3 h-3" />
          Processed
        </span>
      );
    case "processing":
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-yellow-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          Processing
        </span>
      );
    case "pending":
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-blue-500">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case "failed":
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-red-500">
          <AlertCircle className="w-3 h-3" />
          Failed
        </span>
      );
    default:
      return null;
  }
}

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlForm, setUrlForm] = useState({ name: '', url: '', description: '' });
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Calculate stats from data
  const stats = [
    { label: "Total Documents", value: knowledgeBases.filter(kb => kb.type === 'document').length.toString(), icon: FileText },
    { label: "Knowledge Items", value: knowledgeBases.reduce((sum, kb) => sum + kb.chunks_count, 0).toString(), icon: BookOpen },
    { label: "Websites Synced", value: knowledgeBases.filter(kb => kb.type === 'website').length.toString(), icon: Globe },
    { label: "Processing", value: knowledgeBases.filter(kb => kb.embeddings_status === 'processing').length.toString(), icon: Clock },
  ];

  const fetchKnowledgeBases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await knowledgeBaseService.getKnowledgeBases({ search: searchQuery || undefined });
      setKnowledgeBases(response.data || []);
    } catch (err) {
      console.error('Failed to fetch knowledge bases:', err);
      setError('Failed to load knowledge bases');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchKnowledgeBases();
  }, [fetchKnowledgeBases]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge base?')) return;
    
    try {
      await knowledgeBaseService.deleteKnowledgeBase(id);
      setKnowledgeBases(prev => prev.filter(kb => kb.id !== id));
    } catch (err) {
      console.error('Failed to delete knowledge base:', err);
    }
    setActiveDropdown(null);
  };

  const handleSync = async (id: string) => {
    try {
      await knowledgeBaseService.sync(id);
      fetchKnowledgeBases();
    } catch (err) {
      console.error('Failed to sync knowledge base:', err);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const name = file.name.replace(/\.[^/.]+$/, ""); // Remove extension for name
        await knowledgeBaseService.uploadDocument(name, file);
      }
      fetchKnowledgeBases();
    } catch (err) {
      console.error('Failed to upload document:', err);
      setError('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleAddUrl = async () => {
    if (!urlForm.name || !urlForm.url) return;
    
    setIsAddingUrl(true);
    try {
      await knowledgeBaseService.createKnowledgeBase({
        name: urlForm.name,
        type: 'url',
        source_url: urlForm.url,
        description: urlForm.description || undefined,
      });
      setShowUrlModal(false);
      setUrlForm({ name: '', url: '', description: '' });
      fetchKnowledgeBases();
    } catch (err) {
      console.error('Failed to add URL:', err);
      setError('Failed to add website');
    } finally {
      setIsAddingUrl(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredKnowledgeBases = knowledgeBases.filter(kb =>
    kb.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Train your AI with business knowledge</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUrlModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Add Website</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload Document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,.csv"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
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
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading knowledge bases...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchKnowledgeBases}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      ) : filteredKnowledgeBases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No knowledge bases yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Upload documents or add websites to train your AI agents.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="divide-y divide-border">
            {filteredKnowledgeBases.map((kb, index) => (
              <motion.div
                key={kb.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  {getTypeIcon(kb.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{kb.name}</h3>
                    {getStatusBadge(kb.embeddings_status)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{kb.chunks_count} chunks</span>
                    <span>•</span>
                    <span>{formatDate(kb.updated_at)}</span>
                    {kb.file_size && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(kb.file_size)}</span>
                      </>
                    )}
                    {kb.source_url && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{kb.source_url}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {kb.type === 'website' && (
                    <button
                      onClick={() => handleSync(kb.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Sync"
                    >
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === kb.id ? null : kb.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === kb.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden"
                        >
                          <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-sm">
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(kb.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-sm text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragActive 
            ? "border-primary bg-primary/10" 
            : "border-border hover:border-primary hover:bg-primary/5"
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-primary" />
          )}
        </div>
        <h3 className="font-semibold text-lg mb-2">
          {dragActive ? "Drop files here" : "Drop files here to upload"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Support for PDF, DOCX, TXT, CSV files up to 10MB
        </p>
        <button 
          className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          Browse Files
        </button>
      </motion.div>

      {/* Add URL Modal */}
      <AnimatePresence>
        {showUrlModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUrlModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Add Website</h2>
                <button
                  onClick={() => setShowUrlModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={urlForm.name}
                    onChange={(e) => setUrlForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Company FAQ"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website URL</label>
                  <input
                    type="url"
                    value={urlForm.url}
                    onChange={(e) => setUrlForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/faq"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description (optional)</label>
                  <textarea
                    value={urlForm.description}
                    onChange={(e) => setUrlForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the content"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUrlModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUrl}
                  disabled={!urlForm.name || !urlForm.url || isAddingUrl}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAddingUrl ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Website
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
