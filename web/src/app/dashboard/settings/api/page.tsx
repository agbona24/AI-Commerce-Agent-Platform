"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Code,
  ExternalLink,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { settingsService } from "@/lib/api";
import type { ApiKey } from "@/lib/api";

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ token: string; name: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load API keys
  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const keys = await settingsService.getApiKeys();
      setApiKeys(keys);
    } catch (err) {
      console.error("Error loading API keys:", err);
      setError("Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setCreateError("Please enter a key name");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await settingsService.createApiKey(newKeyName);
      setNewlyCreatedKey({ token: result.token, name: result.name });
      setNewKeyName("");
      await loadApiKeys();
    } catch (err) {
      console.error("Error creating API key:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create API key";
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    setIsDeleting(true);
    try {
      await settingsService.revokeApiKey(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error revoking API key:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to revoke API key";
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskKey = (keyPreview: string) => {
    return keyPreview + "••••••••••••••••";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">Manage API access to your account</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* API Keys Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className="font-semibold">API Keys</h2>
              <p className="text-sm text-muted-foreground">Authenticate API requests to your account</p>
            </div>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Create Key
          </button>
        </div>

        {apiKeys.length === 0 ? (
          <div className="p-8 text-center">
            <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">No API keys yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first API key to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {apiKeys.map((apiKey, index) => (
              <motion.div
                key={apiKey.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold">{apiKey.name}</p>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-500">
                        active
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-1.5 bg-muted rounded-lg text-sm font-mono">
                        {visibleKeys.includes(apiKey.id) ? apiKey.key_preview : maskKey(apiKey.key_preview)}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        {visibleKeys.includes(apiKey.id) ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey.key_preview, apiKey.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        {copiedKey === apiKey.id ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Created {formatDate(apiKey.created_at)}
                      </span>
                      <span>•</span>
                      <span>Last used: {apiKey.last_used_at ? formatDate(apiKey.last_used_at) : "Never"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {deleteConfirm === apiKey.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRevokeKey(apiKey.id)}
                          disabled={isDeleting}
                          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(apiKey.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Security Warning */}
      <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-600">Keep your API keys secure</p>
          <p className="text-sm text-muted-foreground">
            Never share your API keys in public repositories or client-side code.
            Use environment variables and keep them private.
          </p>
        </div>
      </div>

      {/* API Documentation Link */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">API Documentation</h3>
              <p className="text-white/80">Learn how to integrate with our API</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-violet-600 rounded-xl font-medium hover:bg-white/90 transition-colors">
            View Docs <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowKeyModal(false);
              setNewlyCreatedKey(null);
              setCreateError(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {newlyCreatedKey ? "API Key Created" : "Create API Key"}
                </h2>
                <button
                  onClick={() => {
                    setShowKeyModal(false);
                    setNewlyCreatedKey(null);
                    setCreateError(null);
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {newlyCreatedKey ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-600 text-sm">Key created successfully!</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Make sure to copy your API key now. You won&apos;t be able to see it again!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Your API Key</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm font-mono break-all">
                        {newlyCreatedKey.token}
                      </code>
                      <button
                        onClick={() => copyToClipboard(newlyCreatedKey.token, "new")}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        {copiedKey === "new" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <button
                      onClick={() => {
                        setShowKeyModal(false);
                        setNewlyCreatedKey(null);
                      }}
                      className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {createError && (
                    <div className="flex items-center gap-3 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p>{createError}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Key Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Production API Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Give your key a descriptive name to identify its purpose
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                    <button
                      onClick={() => {
                        setShowKeyModal(false);
                        setCreateError(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateKey}
                      disabled={isCreating}
                      className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Key"
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
