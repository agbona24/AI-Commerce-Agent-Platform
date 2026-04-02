"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Brain,
  MessageSquare,
  HelpCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { settingsService, AISettings } from "@/lib/api";

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings>({
    default_model: "gpt-4",
    temperature: 0.7,
    max_tokens: 1024,
    auto_escalate: true,
    escalation_threshold: 3,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load AI settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const aiSettings = await settingsService.getAISettings();
        setSettings(aiSettings);
      } catch (err) {
        console.error("Error loading AI settings:", err);
        // Use defaults if API fails
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await settingsService.updateAISettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving AI settings:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save AI settings";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">AI Configuration</h1>
          <p className="text-muted-foreground">Configure AI model and behavior settings</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Model Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">AI Model</h2>
              <p className="text-sm text-muted-foreground">Select the AI model for your agents</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Default AI Model</label>
            <select
              value={settings.default_model}
              onChange={(e) => setSettings((prev) => ({ ...prev, default_model: e.target.value as AISettings["default_model"] }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="gpt-4">GPT-4 (Most Capable)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster & Affordable)</option>
              <option value="claude-3">Claude 3 (Alternative)</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              This model will be used for all AI agent conversations
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI Behavior Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">AI Behavior</h2>
              <p className="text-sm text-muted-foreground">Fine-tune how your AI responds</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Creativity (Temperature)</label>
              <span className="text-sm text-muted-foreground">{settings.temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>More Focused (0)</span>
              <span>More Creative (2)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Response Length (Max Tokens)</label>
              <span className="text-sm text-muted-foreground">{settings.max_tokens}</span>
            </div>
            <input
              type="range"
              min="100"
              max="4096"
              step="100"
              value={settings.max_tokens}
              onChange={(e) => setSettings((prev) => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Shorter (100)</span>
              <span>Longer (4096)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Escalation Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">Escalation Settings</h2>
              <p className="text-sm text-muted-foreground">Configure when AI should escalate to humans</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Auto Escalate Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Escalate to Human</p>
              <p className="text-sm text-muted-foreground">
                Automatically transfer to human agents when AI cannot resolve issues
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.auto_escalate}
                onChange={(e) => setSettings((prev) => ({ ...prev, auto_escalate: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Escalation Threshold */}
          {settings.auto_escalate && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Escalation Threshold</label>
                <span className="text-sm text-muted-foreground">{settings.escalation_threshold} failed attempts</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.escalation_threshold}
                onChange={(e) => setSettings((prev) => ({ ...prev, escalation_threshold: parseInt(e.target.value) }))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Escalate quickly (1)</span>
                <span>More patient (10)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Number of failed resolution attempts before escalating to a human agent
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* AI Features Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">AI-Powered Features</h2>
              <p className="text-sm text-muted-foreground">Features enabled with your AI configuration</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {[
            { name: "Smart Conversations", description: "AI handles customer inquiries automatically", icon: MessageSquare },
            { name: "Intelligent Routing", description: "Routes conversations to the right agents", icon: Brain },
            { name: "FAQ Generation", description: "Auto-generate FAQs from your knowledge base", icon: HelpCircle },
            { name: "Conversation Insights", description: "Analyze calls and chats for insights", icon: Sparkles },
          ].map((feature) => (
            <div key={feature.name} className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{feature.name}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
