"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link,
  Settings,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneOutgoing,
  Bot,
  X,
  Zap,
  Activity,
  ExternalLink,
  Eye,
  EyeOff,
  Webhook,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import apiClient from "@/lib/api/client";

// Types
interface IntegrationField {
  name: string;
  label: string;
  type: "text" | "password" | "select";
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface AvailableIntegration {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  fields: IntegrationField[];
  installed: boolean;
}

interface ConnectedIntegration {
  id: string;
  type: string;
  name: string;
  status: string;
  last_sync_at: string | null;
  created_at: string;
}

// Category configuration with icons
const categoryConfig: Record<string, { icon: React.ElementType; color: string; description: string }> = {
  voice: { 
    icon: Phone, 
    color: "from-red-500 to-pink-600",
    description: "Voice calling and AI receptionist"
  },
  ai: { 
    icon: Bot, 
    color: "from-purple-500 to-indigo-600",
    description: "AI and language models"
  },
  messaging: { 
    icon: MessageSquare, 
    color: "from-green-500 to-emerald-600",
    description: "Messaging platforms"
  },
  ecommerce: { 
    icon: ShoppingBag, 
    color: "from-orange-500 to-red-600",
    description: "E-commerce platforms"
  },
  payment: { 
    icon: CreditCard, 
    color: "from-blue-500 to-cyan-600",
    description: "Payment processors"
  },
  notification: { 
    icon: Activity, 
    color: "from-yellow-500 to-orange-600",
    description: "Notifications and alerts"
  },
  automation: { 
    icon: Zap, 
    color: "from-violet-500 to-purple-600",
    description: "Workflow automation"
  },
};

// Integration icon mapping
const iconMap: Record<string, string> = {
  twilio: "📞",
  openai: "🤖",
  whatsapp: "💬",
  shopify: "🛒",
  woocommerce: "🟣",
  stripe: "💳",
  slack: "💼",
  zapier: "⚡",
};

const colorMap: Record<string, string> = {
  twilio: "bg-red-500",
  openai: "bg-gradient-to-br from-green-500 to-teal-600",
  whatsapp: "bg-green-500",
  shopify: "bg-green-600",
  woocommerce: "bg-purple-500",
  stripe: "bg-indigo-500",
  slack: "bg-purple-700",
  zapier: "bg-orange-500",
};

export default function IntegrationsPage() {
  const [availableIntegrations, setAvailableIntegrations] = useState<AvailableIntegration[]>([]);
  const [connectedIntegrations, setConnectedIntegrations] = useState<ConnectedIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<AvailableIntegration | null>(null);
  const [configuringWebhook, setConfiguringWebhook] = useState<string | null>(null);
  const [showTestCallModal, setShowTestCallModal] = useState(false);
  const [testCallNumber, setTestCallNumber] = useState("");
  const [isTestingCall, setIsTestingCall] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const [availableRes, connectedRes] = await Promise.all([
        apiClient.get("/integrations/available"),
        apiClient.get("/integrations"),
      ]);
      setAvailableIntegrations(availableRes.data.data || []);
      setConnectedIntegrations(connectedRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const openConnectModal = (integration: AvailableIntegration) => {
    setSelectedIntegration(integration);
    setShowConnectModal(true);
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm("Are you sure you want to disconnect this integration?")) return;
    
    try {
      await apiClient.post(`/integrations/${integrationId}/disconnect`);
      await fetchIntegrations();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      await apiClient.post(`/integrations/${integrationId}/sync`);
      await fetchIntegrations();
    } catch (error) {
      console.error("Failed to sync:", error);
    }
  };

  const handleConfigureWebhooks = async (integrationId: string) => {
    setConfiguringWebhook(integrationId);
    try {
      const response = await apiClient.post("/voice/configure-webhooks");
      const baseUrl = window.location.origin.replace(':3000', ':8000');
      setWebhookUrl(`${baseUrl}/api/v1/webhooks/voice/incoming`);
      alert(`Webhooks configured successfully!\n\nVoice URL: ${response.data.data?.voice_url || 'Configured'}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Failed to configure webhooks");
    } finally {
      setConfiguringWebhook(null);
    }
  };

  const handleTestCall = async () => {
    if (!testCallNumber) return;
    setIsTestingCall(true);
    try {
      // Find active voice agent
      const agentsRes = await apiClient.get("/agents?status=active");
      const agents = agentsRes.data.data || [];
      const voiceAgent = agents.find((a: { channels?: string[] }) => a.channels?.includes("voice"));
      
      if (!voiceAgent) {
        alert("Please create and activate a Voice Agent first");
        return;
      }

      await apiClient.post("/voice/call", {
        to: testCallNumber,
        agent_id: voiceAgent.id,
      });
      alert("Test call initiated! Your phone should ring shortly.");
      setShowTestCallModal(false);
      setTestCallNumber("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Failed to initiate test call");
    } finally {
      setIsTestingCall(false);
    }
  };

  const copyWebhookUrl = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Group integrations by category
  const groupedIntegrations = availableIntegrations.reduce((acc, integration) => {
    const category = integration.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(integration);
    return acc;
  }, {} as Record<string, AvailableIntegration[]>);

  // Prioritized category order (voice and AI first)
  const categoryOrder = ["voice", "ai", "messaging", "ecommerce", "payment", "notification", "automation"];
  const sortedCategories = Object.keys(groupedIntegrations).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Connect Twilio and OpenAI to power your Voice AI Agent</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {connectedIntegrations.filter(c => c.status === "connected").length} Active
          </span>
        </div>
      </div>

      {/* Quick Setup Guide */}
      {connectedIntegrations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 border border-primary/20 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-2">🚀 Quick Setup Guide</h3>
          <p className="text-muted-foreground mb-4">
            To enable your Voice AI Agent, connect these two integrations:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-medium">Connect Twilio</p>
                <p className="text-sm text-muted-foreground">For voice calls - incoming and outgoing</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-medium">Connect OpenAI</p>
                <p className="text-sm text-muted-foreground">For AI-powered responses</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Connected Integrations */}
      {connectedIntegrations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Connected Integrations
            </h2>
          </div>
          <div className="divide-y divide-border">
            {connectedIntegrations.map((conn) => {
              const available = availableIntegrations.find(a => a.type === conn.type);
              
              return (
                <div key={conn.id} className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${colorMap[conn.type] || "bg-gray-500"} flex items-center justify-center text-2xl`}>
                    {iconMap[conn.type] || "🔌"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{available?.name || conn.name}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        conn.status === "connected" 
                          ? "bg-green-500/10 text-green-600" 
                          : conn.status === "error"
                          ? "bg-red-500/10 text-red-600"
                          : "bg-yellow-500/10 text-yellow-600"
                      }`}>
                        {conn.status === "connected" ? "Active" : conn.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connected {new Date(conn.created_at).toLocaleDateString()}
                      {conn.last_sync_at && ` • Last sync: ${new Date(conn.last_sync_at).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {conn.type === "twilio" && (
                      <>
                        <button 
                          onClick={() => handleConfigureWebhooks(conn.id)}
                          disabled={configuringWebhook === conn.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                          title="Configure Twilio Webhooks"
                        >
                          {configuringWebhook === conn.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Webhook className="w-3 h-3" />
                          )}
                          Setup Webhooks
                        </button>
                        <button 
                          onClick={() => setShowTestCallModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-colors"
                          title="Make Test Call"
                        >
                          <PhoneOutgoing className="w-3 h-3" />
                          Test Call
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleSync(conn.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors" 
                      title="Sync now"
                    >
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Settings">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button 
                      onClick={() => handleDisconnect(conn.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" 
                      title="Disconnect"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Integration Categories */}
      <div className="space-y-6">
        {sortedCategories.map((category, categoryIndex) => {
          const config = categoryConfig[category] || { 
            icon: Link, 
            color: "from-gray-500 to-slate-600",
            description: "Other integrations"
          };
          const Icon = config.icon;
          const integrations = groupedIntegrations[category];
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold capitalize">{category}</h2>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {integrations.map((integration, index) => {
                  const isConnected = connectedIntegrations.some(c => c.type === integration.type && c.status === "connected");
                  
                  return (
                    <motion.div
                      key={integration.type}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isConnected 
                          ? "border-green-500 bg-green-50 dark:bg-green-900/10" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${colorMap[integration.type] || "bg-gray-500"} flex items-center justify-center text-xl`}>
                            {iconMap[integration.type] || "🔌"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{integration.name}</p>
                              {isConnected && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{integration.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Show field requirements */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {integration.fields.filter(f => f.required).map((field) => (
                          <span key={field.name} className="px-2 py-0.5 text-xs bg-muted rounded-full">
                            {field.label}
                          </span>
                        ))}
                      </div>
                      
                      {isConnected ? (
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium">
                          <Settings className="w-4 h-4" />
                          Manage
                        </button>
                      ) : (
                        <button
                          onClick={() => openConnectModal(integration)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity text-sm font-medium"
                        >
                          <Link className="w-4 h-4" />
                          Connect
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Connect Modal */}
      <AnimatePresence>
        {showConnectModal && selectedIntegration && (
          <ConnectModal 
            integration={selectedIntegration} 
            onClose={() => {
              setShowConnectModal(false);
              setSelectedIntegration(null);
            }}
            onSuccess={() => {
              setShowConnectModal(false);
              setSelectedIntegration(null);
              fetchIntegrations();
            }}
          />
        )}
      </AnimatePresence>

      {/* Test Call Modal */}
      <AnimatePresence>
        {showTestCallModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowTestCallModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Test Voice Agent</h2>
                    <p className="text-sm text-muted-foreground">Make a test call to verify your setup</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={testCallNumber}
                    onChange={(e) => setTestCallNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter the phone number to receive the test call (E.164 format)
                  </p>
                </div>

                {webhookUrl && (
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Webhook URL</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-background p-2 rounded-lg overflow-x-auto">
                        {webhookUrl}
                      </code>
                      <button
                        onClick={copyWebhookUrl}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-sm text-blue-600">
                    <strong>Note:</strong> Make sure you have an active Voice Agent created and your webhooks are configured.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <button
                  onClick={() => setShowTestCallModal(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTestCall}
                  disabled={isTestingCall || !testCallNumber}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isTestingCall ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Calling...
                    </>
                  ) : (
                    <>
                      <PhoneOutgoing className="w-4 h-4" />
                      Make Test Call
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConnectModal({ 
  integration, 
  onClose, 
  onSuccess 
}: { 
  integration: AvailableIntegration; 
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const togglePassword = (name: string) => {
    setShowPasswords((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isFormValid = () => {
    return integration.fields
      .filter((f) => f.required)
      .every((f) => formData[f.name]?.trim());
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      await apiClient.post("/integrations/connect", {
        type: integration.type,
        credentials: formData,
        settings: {},
      });
      setStep(2);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect. Please check your credentials.";
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  // Help links for different integrations
  const helpLinks: Record<string, { text: string; url: string }> = {
    twilio: { 
      text: "Get your Twilio credentials from the Console", 
      url: "https://console.twilio.com" 
    },
    openai: { 
      text: "Generate an API key from OpenAI Platform", 
      url: "https://platform.openai.com/api-keys" 
    },
    whatsapp: { 
      text: "Set up WhatsApp Business API", 
      url: "https://developers.facebook.com/docs/whatsapp" 
    },
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${colorMap[integration.type] || "bg-gray-500"} flex items-center justify-center text-xl`}>
              {iconMap[integration.type] || "🔌"}
            </div>
            <div>
              <h2 className="text-lg font-bold">Connect {integration.name}</h2>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Help link */}
              {helpLinks[integration.type] && (
                <a 
                  href={helpLinks[integration.type].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-500/10 text-blue-600 rounded-lg text-sm hover:bg-blue-500/20 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {helpLinks[integration.type].text}
                </a>
              )}

              {/* Dynamic form fields */}
              {integration.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === "select" ? (
                    <select
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      <input
                        type={field.type === "password" && !showPasswords[field.name] ? "password" : "text"}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                      />
                      {field.type === "password" && (
                        <button
                          type="button"
                          onClick={() => togglePassword(field.name)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                        >
                          {showPasswords[field.name] ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Successfully Connected!</h3>
              <p className="text-muted-foreground mb-6">
                {integration.name} is now connected to your Voice AI Agent
              </p>
              
              {integration.type === "twilio" && (
                <div className="bg-muted/50 rounded-xl p-4 text-left mb-4">
                  <p className="text-sm font-medium mb-2">📞 Your Voice AI is Ready!</p>
                  <p className="text-sm text-muted-foreground">
                    Customers can now call your Twilio number and be greeted by your AI receptionist.
                  </p>
                </div>
              )}
              
              {integration.type === "openai" && (
                <div className="bg-muted/50 rounded-xl p-4 text-left mb-4">
                  <p className="text-sm font-medium mb-2">🤖 AI Responses Enabled!</p>
                  <p className="text-sm text-muted-foreground">
                    Your voice agent will now use OpenAI to generate intelligent responses.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={isConnecting || !isFormValid()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Connect
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onSuccess}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
