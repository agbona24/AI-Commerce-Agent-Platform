"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Palette,
  MessageSquare,
  Code,
  Copy,
  CheckCircle2,
  Settings,
  Layout,
  Type,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Eye,
  Maximize2,
  Minimize2,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { widgetService, WidgetConfig } from "@/lib/api";

interface LocalConfig {
  primaryColor: string;
  position: string;
  greeting: string;
  placeholder: string;
  headerTitle: string;
  headerSubtitle: string;
  showAvatar: boolean;
  showBranding: boolean;
  autoOpen: boolean;
  autoOpenDelay: number;
  soundEnabled: boolean;
  showTypingIndicator: boolean;
  collectEmail: boolean;
  requireEmailFirst: boolean;
}

const defaultConfig: LocalConfig = {
  primaryColor: "#7C3AED",
  position: "bottom-right",
  greeting: "Hi! How can I help you today?",
  placeholder: "Type your message...",
  headerTitle: "Chat with us",
  headerSubtitle: "We typically reply within minutes",
  showAvatar: true,
  showBranding: false,
  autoOpen: false,
  autoOpenDelay: 5,
  soundEnabled: true,
  showTypingIndicator: true,
  collectEmail: true,
  requireEmailFirst: false,
};

const positions = [
  { id: "bottom-right", label: "Bottom Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "top-right", label: "Top Right" },
  { id: "top-left", label: "Top Left" },
];

// Convert API config to local format
function apiToLocal(apiConfig: WidgetConfig): LocalConfig {
  return {
    primaryColor: apiConfig.primary_color,
    position: apiConfig.position,
    greeting: apiConfig.greeting,
    placeholder: apiConfig.placeholder,
    headerTitle: apiConfig.header_title,
    headerSubtitle: apiConfig.header_subtitle,
    showAvatar: apiConfig.show_avatar,
    showBranding: apiConfig.show_branding,
    autoOpen: apiConfig.auto_open,
    autoOpenDelay: apiConfig.auto_open_delay,
    soundEnabled: apiConfig.sound_enabled,
    showTypingIndicator: apiConfig.show_typing_indicator,
    collectEmail: apiConfig.collect_email,
    requireEmailFirst: apiConfig.require_email_first,
  };
}

// Convert local config to API format
function localToApi(localConfig: LocalConfig): Partial<WidgetConfig> {
  return {
    primary_color: localConfig.primaryColor,
    position: localConfig.position as WidgetConfig['position'],
    greeting: localConfig.greeting,
    placeholder: localConfig.placeholder,
    header_title: localConfig.headerTitle,
    header_subtitle: localConfig.headerSubtitle,
    show_avatar: localConfig.showAvatar,
    show_branding: localConfig.showBranding,
    auto_open: localConfig.autoOpen,
    auto_open_delay: localConfig.autoOpenDelay,
    sound_enabled: localConfig.soundEnabled,
    show_typing_indicator: localConfig.showTypingIndicator,
    collect_email: localConfig.collectEmail,
    require_email_first: localConfig.requireEmailFirst,
  };
}

export default function WidgetSettingsPage() {
  const [config, setConfig] = useState<LocalConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<"appearance" | "behavior" | "install">("appearance");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [embedCode, setEmbedCode] = useState("");
  const [widgetId, setWidgetId] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch widget config on mount
  const fetchConfig = useCallback(async () => {
    try {
      const [configRes, embedRes] = await Promise.all([
        widgetService.getConfig(),
        widgetService.getEmbedCode(),
      ]);
      setConfig(apiToLocal(configRes.config));
      setWidgetId(configRes.widget_id);
      setEmbedCode(embedRes.code);
    } catch (err) {
      console.error('Failed to fetch widget config:', err);
      setError('Failed to load widget settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      await widgetService.updateConfig(localToApi(config));
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save widget config:', err);
      setError('Failed to save widget settings');
    } finally {
      setIsSaving(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateConfig = (key: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Web Widget</h1>
          <p className="text-muted-foreground">Customize and install your chat widget</p>
          {widgetId && (
            <p className="text-xs text-muted-foreground mt-1">Widget ID: {widgetId}</p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: "appearance", label: "Appearance", icon: Palette },
          { id: "behavior", label: "Behavior", icon: Settings },
          { id: "install", label: "Installation", icon: Code },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-6">
          {activeTab === "appearance" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Colors */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Colors
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig("primaryColor", e.target.value)}
                        className="w-12 h-12 rounded-xl border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig("primaryColor", e.target.value)}
                        className="w-32 px-4 py-2 rounded-xl border border-border bg-background uppercase font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Position */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  Position
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {positions.map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => updateConfig("position", pos.id)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        config.position === pos.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  Text Content
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Header Title</label>
                    <input
                      type="text"
                      value={config.headerTitle}
                      onChange={(e) => updateConfig("headerTitle", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Header Subtitle</label>
                    <input
                      type="text"
                      value={config.headerSubtitle}
                      onChange={(e) => updateConfig("headerSubtitle", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Welcome Message</label>
                    <textarea
                      value={config.greeting}
                      onChange={(e) => updateConfig("greeting", e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Input Placeholder</label>
                    <input
                      type="text"
                      value={config.placeholder}
                      onChange={(e) => updateConfig("placeholder", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Display Options */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Display Options
                </h3>
                <div className="space-y-4">
                  {[
                    { key: "showAvatar", label: "Show agent avatar", desc: "Display AI avatar in chat" },
                    { key: "showBranding", label: "Show Vivax branding", desc: "Display 'Powered by Vivax'" },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config[option.key as keyof typeof config] as boolean}
                          onChange={(e) => updateConfig(option.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "behavior" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Auto-open */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Maximize2 className="w-5 h-5 text-primary" />
                  Auto-open
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-open widget</p>
                      <p className="text-xs text-muted-foreground">Automatically open chat after delay</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoOpen}
                        onChange={(e) => updateConfig("autoOpen", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  {config.autoOpen && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Delay (seconds)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={config.autoOpenDelay}
                        onChange={(e) => updateConfig("autoOpenDelay", parseInt(e.target.value))}
                        className="w-24 px-4 py-2 rounded-xl border border-border bg-background"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Interactions */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Interactions
                </h3>
                <div className="space-y-4">
                  {[
                    { key: "soundEnabled", label: "Sound notifications", desc: "Play sound for new messages" },
                    { key: "showTypingIndicator", label: "Typing indicator", desc: "Show when AI is typing" },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config[option.key as keyof typeof config] as boolean}
                          onChange={(e) => updateConfig(option.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Capture */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Lead Capture
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Collect email</p>
                      <p className="text-xs text-muted-foreground">Ask visitors for their email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.collectEmail}
                        onChange={(e) => updateConfig("collectEmail", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  {config.collectEmail && (
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">Require email first</p>
                        <p className="text-xs text-muted-foreground">Must enter email before chatting</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.requireEmailFirst}
                          onChange={(e) => updateConfig("requireEmailFirst", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "install" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  Embed Code
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Copy and paste this code snippet before the closing &lt;/body&gt; tag of your website.
                </p>
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-xl text-sm overflow-x-auto">
                    <code>{embedCode}</code>
                  </pre>
                  <button
                    onClick={copyCode}
                    className="absolute top-3 right-3 p-2 bg-background rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Supported Platforms</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["WordPress", "Shopify", "Wix", "Squarespace", "Webflow", "Custom HTML"].map((platform) => (
                    <div key={platform} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === "desktop" ? "bg-primary text-white" : "hover:bg-muted"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`p-2 rounded-lg transition-colors ${
                    previewMode === "mobile" ? "bg-primary text-white" : "hover:bg-muted"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div 
              className={`bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-6 relative ${
                previewMode === "mobile" ? "h-[500px]" : "h-[400px]"
              }`}
            >
              {/* Mock website */}
              <div className="absolute inset-6 bg-white dark:bg-slate-950 rounded-lg shadow-sm overflow-hidden">
                <div className="h-8 bg-muted border-b border-border flex items-center gap-2 px-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="h-4 bg-muted-foreground/20 rounded-full max-w-xs" />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </div>

              {/* Chat Widget Preview */}
              <div 
                className={`absolute ${
                  config.position.includes("right") ? "right-8" : "left-8"
                } ${
                  config.position.includes("bottom") ? "bottom-8" : "top-16"
                }`}
              >
                {previewOpen ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden ${
                      previewMode === "mobile" ? "w-64" : "w-72"
                    }`}
                  >
                    {/* Header */}
                    <div
                      className="p-4 text-white"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {config.showAvatar && (
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm">{config.headerTitle}</p>
                            <p className="text-xs opacity-80">{config.headerSubtitle}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setPreviewOpen(false)}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <Minimize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="p-4 h-32 bg-slate-50 dark:bg-slate-800">
                      <div 
                        className="text-white text-xs p-3 rounded-xl rounded-tl-none max-w-[80%]"
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        {config.greeting}
                      </div>
                    </div>
                    
                    {/* Input */}
                    <div className="p-3 border-t border-border">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl">
                        <span className="text-xs text-muted-foreground flex-1">
                          {config.placeholder}
                        </span>
                      </div>
                    </div>
                    
                    {config.showBranding && (
                      <div className="py-2 text-center border-t border-border">
                        <span className="text-[10px] text-muted-foreground">Powered by Vivax AI</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setPreviewOpen(true)}
                    className="w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <MessageSquare className="w-6 h-6" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
