"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Globe,
  QrCode,
  RefreshCw,
  Settings,
  Zap,
  Clock,
  Send,
  FileText,
  Plus,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  Shield,
} from "lucide-react";

const mockWhatsAppAccount = {
  connected: true,
  phoneNumber: "+1 (555) 987-6543",
  businessName: "Acme Support",
  status: "active",
  qualityRating: "high",
  messagingLimit: "1000/day",
  connectedAt: "2026-01-15",
  lastMessage: "2 min ago",
};

const mockTemplates = [
  {
    id: "1",
    name: "Order Confirmation",
    status: "approved",
    category: "transactional",
    language: "en",
    preview: "Hi {{1}}, your order #{{2}} has been confirmed! Track it here: {{3}}",
  },
  {
    id: "2",
    name: "Appointment Reminder",
    status: "approved",
    category: "appointment",
    language: "en",
    preview: "Hi {{1}}, reminder: your appointment is scheduled for {{2}} at {{3}}.",
  },
  {
    id: "3",
    name: "Welcome Message",
    status: "pending",
    category: "marketing",
    language: "en",
    preview: "Welcome to {{1}}! We're excited to have you. Reply to this message to get started.",
  },
];

const qualityColors: Record<string, string> = {
  high: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  low: "bg-red-500/10 text-red-500",
};

const statusColors: Record<string, string> = {
  approved: "bg-green-500/10 text-green-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  rejected: "bg-red-500/10 text-red-500",
};

export default function WhatsAppSettingsPage() {
  const [account] = useState(mockWhatsAppAccount);
  const [templates] = useState(mockTemplates);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "templates" | "automation">("overview");

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">WhatsApp Business</h1>
          <p className="text-muted-foreground">Connect and configure WhatsApp Business API</p>
        </div>
        {account.connected && (
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Connected
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: "overview", label: "Overview", icon: Globe },
          { id: "templates", label: "Templates", icon: FileText },
          { id: "automation", label: "Automation", icon: Zap },
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

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {account.connected ? (
              <>
                {/* Connected Account */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{account.businessName}</h3>
                      <p className="text-muted-foreground">{account.phoneNumber}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${qualityColors[account.qualityRating]}`}>
                          Quality: {account.qualityRating}
                        </span>
                        <span className="px-2 py-1 text-xs bg-muted rounded-full">
                          Limit: {account.messagingLimit}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Connected Since", value: account.connectedAt, icon: Clock },
                    { label: "Last Message", value: account.lastMessage, icon: Send },
                    { label: "Daily Limit", value: account.messagingLimit, icon: Zap },
                    { label: "Templates", value: `${templates.length} active`, icon: FileText },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card border border-border rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <stat.icon className="w-4 h-4" />
                        <span className="text-xs">{stat.label}</span>
                      </div>
                      <p className="font-semibold">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Settings */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    WhatsApp Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <p className="font-medium text-sm">Auto-reply outside business hours</p>
                        <p className="text-xs text-muted-foreground">Send automatic messages when unavailable</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <p className="font-medium text-sm">Read receipts</p>
                        <p className="text-xs text-muted-foreground">Show when messages are read</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-sm">AI auto-response</p>
                        <p className="text-xs text-muted-foreground">Let AI handle initial responses</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Not Connected State */
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Connect WhatsApp Business</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Connect your WhatsApp Business account to automate customer conversations and send notifications.
                </p>
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                  Connect WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Manage message templates for WhatsApp Business API
              </p>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Create Template
              </button>
            </div>

            <div className="space-y-3">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColors[template.status]}`}>
                          {template.status}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-muted rounded-full capitalize">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.preview}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-600 text-sm">Template Approval</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All templates must be approved by Meta before use. Approval typically takes 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Automation Tab */}
        {activeTab === "automation" && (
          <motion.div
            key="automation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Quick Replies
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set up automated responses for common questions
              </p>
              <div className="space-y-3">
                {[
                  { trigger: "hours", response: "Our business hours are Mon-Fri, 9 AM - 6 PM EST." },
                  { trigger: "pricing", response: "Check out our pricing at vivaxai.com/pricing" },
                  { trigger: "support", response: "I'm connecting you with a human agent now..." },
                ].map((reply, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-lg font-medium">
                      #{reply.trigger}
                    </span>
                    <span className="flex-1 text-sm truncate">{reply.response}</span>
                    <button className="p-1 hover:bg-muted rounded transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-sm text-primary hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Quick Reply
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Business Hours Auto-Reply
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Away Message</label>
                  <textarea
                    rows={3}
                    defaultValue="Thanks for reaching out! We're currently outside business hours. We'll get back to you as soon as we're back online."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable away message</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connect Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConnectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Connect WhatsApp</h2>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center">
                <div className="w-48 h-48 bg-muted rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code with your WhatsApp Business app to connect
                </p>
                <button className="flex items-center gap-2 mx-auto text-sm text-primary hover:underline">
                  <RefreshCw className="w-4 h-4" />
                  Refresh QR Code
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Don&apos;t have WhatsApp Business?{" "}
                  <a href="#" className="text-primary hover:underline inline-flex items-center gap-1">
                    Learn how to set it up <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
