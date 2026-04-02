"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Plus,
  Settings,
  MoreHorizontal,
  X,
  Copy,
  Trash2,
  ExternalLink,
  Globe,
  Clock,
  PhoneCall,
  PhoneIncoming,
  Zap,
  ChevronRight,
  Search,
  Loader2,
  Check,
  Bot,
  MapPin,
  Link2,
} from "lucide-react";

type PhoneNumber = {
  id: string;
  number: string;
  friendlyName: string;
  provider: string;
  status: string;
  country: string;
  capabilities: string[];
  agent: string;
  stats: { callsToday: number; callsThisWeek: number; avgDuration: string };
  createdAt: string;
};

// Voice providers
const voiceProviders = [
  {
    id: "twilio",
    name: "Twilio",
    description: "Industry-leading cloud communications platform",
    logo: "T",
    color: "from-red-500 to-rose-600",
    features: ["Global coverage in 100+ countries", "99.95% uptime SLA", "Advanced voice features"],
    pricing: { localNumber: 1.50, tollFree: 2.00 },
    credentialFields: [
      { key: "account_sid", label: "Account SID", placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      { key: "auth_token", label: "Auth Token", placeholder: "Your Twilio auth token", type: "password" },
    ],
  },
  {
    id: "callhippo",
    name: "CallHippo",
    description: "Virtual phone system for growing businesses",
    logo: "CH",
    color: "from-blue-500 to-cyan-600",
    features: ["Numbers in 50+ countries", "Built-in power dialer", "Affordable pricing"],
    pricing: { localNumber: 2.00, tollFree: 3.00 },
    credentialFields: [
      { key: "api_key", label: "API Key", placeholder: "Your CallHippo API key", type: "password" },
    ],
  },
];

export default function PhoneNumbersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [configurePhone, setConfigurePhone] = useState<PhoneNumber | null>(null);

  const handleNumberAdded = (phone: PhoneNumber) => {
    setPhoneNumbers(prev => [...prev, phone]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Phone Numbers</h1>
          <p className="text-muted-foreground">Manage your voice AI phone numbers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Phone Number
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Numbers", value: String(phoneNumbers.length), icon: Phone, color: "from-violet-500 to-purple-600" },
          { label: "Calls Today", value: String(phoneNumbers.reduce((s, p) => s + p.stats.callsToday, 0)), icon: PhoneIncoming, color: "from-green-500 to-emerald-600" },
          { label: "This Week", value: String(phoneNumbers.reduce((s, p) => s + p.stats.callsThisWeek, 0)), icon: PhoneCall, color: "from-cyan-500 to-blue-600" },
          { label: "Avg Duration", value: phoneNumbers.length ? "—" : "0s", icon: Clock, color: "from-orange-500 to-red-600" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 bg-card border border-border rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Phone Numbers List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Your Phone Numbers</h2>
        </div>

        {phoneNumbers.length > 0 ? (
          <div className="divide-y divide-border">
            {phoneNumbers.map((phone, index) => (
              <motion.div
                key={phone.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Phone Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-lg">{phone.number}</p>
                      <button className="p-1 hover:bg-muted rounded transition-colors">
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        phone.status === "active" 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {phone.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{phone.friendlyName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {phone.country}
                      </span>
                      <span>•</span>
                      <span>Connected to: <span className="text-primary font-medium">{phone.agent}</span></span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden lg:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{phone.stats.callsToday}</p>
                      <p className="text-muted-foreground">Today</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{phone.stats.callsThisWeek}</p>
                      <p className="text-muted-foreground">This Week</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{phone.stats.avgDuration}</p>
                      <p className="text-muted-foreground">Avg Duration</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setConfigurePhone(phone); setActiveDropdown(null); }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Configure"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === phone.id ? null : phone.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                      
                      {activeDropdown === phone.id && (
                        <div className="absolute right-0 top-10 w-48 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                          <button
                            onClick={() => { setConfigurePhone(phone); setActiveDropdown(null); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm"
                          >
                            <Settings className="w-4 h-4" />
                            Configure
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm">
                            <ExternalLink className="w-4 h-4" />
                            View in Twilio
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm text-red-500">
                            <Trash2 className="w-4 h-4" />
                            Remove Number
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No phone numbers yet</h3>
            <p className="text-muted-foreground mb-6">Add a phone number to start receiving AI-powered calls</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
            >
              Add Your First Number
            </button>
          </div>
        )}
      </motion.div>

      {/* Add Phone Number Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddPhoneNumberModal
            onClose={() => setShowAddModal(false)}
            onAdded={handleNumberAdded}
          />
        )}
      </AnimatePresence>

      {/* Configure Phone Modal */}
      <AnimatePresence>
        {configurePhone && (
          <ConfigurePhoneModal
            phone={configurePhone}
            onClose={() => setConfigurePhone(null)}
            onSave={(updated) => {
              setPhoneNumbers(prev => prev.map(p => p.id === updated.id ? updated : p));
              setConfigurePhone(null);
            }}
            onDelete={(id) => {
              setPhoneNumbers(prev => prev.filter(p => p.id !== id));
              setConfigurePhone(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfigurePhoneModal({
  phone,
  onClose,
  onSave,
  onDelete,
}: {
  phone: PhoneNumber;
  onClose: () => void;
  onSave: (p: PhoneNumber) => void;
  onDelete: (id: string) => void;
}) {
  const [friendlyName, setFriendlyName] = useState(phone.friendlyName);
  const [status, setStatus] = useState(phone.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    onSave({ ...phone, friendlyName, status });
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise(r => setTimeout(r, 1000));
    onDelete(phone.id);
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
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Configure Number</h2>
            <p className="text-sm text-muted-foreground font-mono">{phone.number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Provider badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
              phone.provider === "twilio" ? "bg-gradient-to-br from-red-500 to-rose-600" : "bg-gradient-to-br from-blue-500 to-cyan-600"
            }`}>
              {phone.provider === "twilio" ? "T" : "CH"}
            </div>
            <div>
              <p className="font-medium capitalize">{phone.provider}</p>
              <p className="text-xs text-muted-foreground">{phone.country} • {phone.capabilities.join(", ")}</p>
            </div>
            <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
              phone.status === "active" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
            }`}>{phone.status}</span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Friendly Name</label>
            <input
              type="text"
              value={friendlyName}
              onChange={(e) => setFriendlyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <div className="flex gap-3">
              {["active", "inactive"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                    status === s ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Assigned Agent</label>
            <div className="px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm flex items-center gap-2">
              <Bot className="w-4 h-4 text-violet-500" />
              <span>{phone.agent || "No agent assigned"}</span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-border">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove this number
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-3">
                <p className="text-sm font-medium text-red-600">Are you sure? This will release the number.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    {isDeleting ? "Removing..." : "Yes, remove"}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-lg bg-muted text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button onClick={onClose} className="px-4 py-2 rounded-xl hover:bg-muted transition-colors text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// Available numbers from provider API (populated by real API call)
type AvailableNumber = { number: string; region: string; price: number; capabilities: string[] };

function AddPhoneNumberModal({ onClose, onAdded }: { onClose: () => void; onAdded: (p: PhoneNumber) => void }) {
  // Steps: 1=Provider, 2=Credentials, 3=Method, 4=Number(search/existing), 5=Configure
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<typeof voiceProviders[0] | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [method, setMethod] = useState<"search" | "existing" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null);
  const [existingNumber, setExistingNumber] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [friendlyName, setFriendlyName] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalSteps = 5;

  const stepTitle: Record<number, string> = {
    1: "Choose Provider",
    2: "Connect Account",
    3: "Add Phone Number",
    4: method === "search" ? "Select a Number" : "Connect Existing",
    5: "Configure Number",
  };

  const stepDesc: Record<number, string> = {
    1: "Select your preferred voice provider",
    2: "Enter your API credentials",
    3: "Get a new number or connect an existing one",
    4: method === "search" ? "Search and choose from available numbers" : "Enter your existing phone number",
    5: "Assign to an agent and give it a name",
  };

  const [connectionError, setConnectionError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus("idle");
    setConnectionError(null);
    try {
      const res = await fetch("/api/phone-providers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider?.id, credentials }),
      });
      const data = await res.json();
      if (data.success) {
        setConnectionStatus("success");
      } else {
        setConnectionStatus("error");
        setConnectionError(data.error || "Connection failed");
      }
    } catch {
      setConnectionStatus("error");
      setConnectionError("Network error — could not reach provider");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const searchNumbers = async () => {
    setIsSearching(true);
    setAvailableNumbers([]);
    // In production: fetch from backend /api/v1/phone-numbers/search?provider=...&query=...
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAvailableNumbers([]);
    setIsSearching(false);
  };

  const handlePurchase = async () => {
    if (!selectedProvider) return;
    setIsPurchasing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const finalNumber = selectedNumber?.number || existingNumber;
      onAdded({
        id: Date.now().toString(),
        number: finalNumber,
        friendlyName: friendlyName || finalNumber,
        provider: selectedProvider.id,
        status: "active",
        country: "US",
        capabilities: selectedNumber?.capabilities || ["voice"],
        agent: selectedAgent || "Unassigned",
        stats: { callsToday: 0, callsThisWeek: 0, avgDuration: "0s" },
        createdAt: new Date().toISOString().split("T")[0],
      });
      setIsSuccess(true);
      setTimeout(onClose, 2000);
    } finally {
      setIsPurchasing(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return !!selectedProvider;
    if (step === 2) return connectionStatus === "success";
    if (step === 3) return !!method;
    if (step === 4) return method === "search" ? !!selectedNumber : existingNumber.trim().length > 5;
    return false;
  };

  const goBack = () => {
    if (step === 4) { setMethod(null); setStep(3); }
    else setStep(s => s - 1);
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
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:max-w-2xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">{isSuccess ? "Number Added!" : stepTitle[step]}</h2>
            <p className="text-sm text-muted-foreground">{isSuccess ? "Your phone number is ready to use" : stepDesc[step]}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        {!isSuccess && (
          <div className="px-6 pt-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    s < step ? "bg-primary text-white" :
                    s === step ? "bg-primary text-white" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {s < step ? <Check className="w-3.5 h-3.5" /> : s}
                  </div>
                  {s < totalSteps && <div className={`flex-1 h-1 rounded ${s < step ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Success */}
          {isSuccess && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Phone Number Added!</h3>
              <p className="text-muted-foreground">
                {selectedNumber?.number || existingNumber} is now connected via {selectedProvider?.name}
              </p>
            </motion.div>
          )}

          {/* Step 1: Choose Provider */}
          {!isSuccess && step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {voiceProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider)}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                    selectedProvider?.id === provider.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-lg">{provider.logo}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-lg">{provider.name}</p>
                        {selectedProvider?.id === provider.id && <Check className="w-5 h-5 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{provider.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.features.map((f, i) => <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full">{f}</span>)}
                      </div>
                      <p className="text-sm mt-2">
                        <span className="text-green-600 font-medium">${provider.pricing.localNumber.toFixed(2)}/mo</span>
                        <span className="text-muted-foreground"> for local numbers</span>
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* Step 2: Credentials */}
          {!isSuccess && step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedProvider?.color} flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{selectedProvider?.logo}</span>
                </div>
                <div>
                  <p className="font-medium">{selectedProvider?.name}</p>
                  <p className="text-xs text-muted-foreground">Enter your API credentials below</p>
                </div>
              </div>

              {selectedProvider?.credentialFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1.5">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    value={credentials[field.key] || ""}
                    onChange={(e) => {
                      setCredentials({ ...credentials, [field.key]: e.target.value });
                      setConnectionStatus("idle");
                      setConnectionError(null);
                    }}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              ))}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={testConnection}
                  disabled={isTestingConnection || !selectedProvider?.credentialFields.every(f => credentials[f.key])}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {isTestingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> :
                    connectionStatus === "success" ? <Check className="w-4 h-4 text-green-500" /> :
                    <Zap className="w-4 h-4" />}
                  {isTestingConnection ? "Testing..." : connectionStatus === "success" ? "Connected!" : "Test Connection"}
                </button>
                {connectionStatus === "success" && <span className="text-sm text-green-600 font-medium">✓ Connection verified</span>}
                {connectionStatus === "error" && <span className="text-sm text-red-500">✗ {connectionError || "Connection failed"}</span>}
              </div>
            </motion.div>
          )}

          {/* Step 3: Method (get new / existing) */}
          {!isSuccess && step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <button
                onClick={() => { setMethod("search"); setStep(4); }}
                className="w-full p-5 rounded-xl border-2 border-border hover:border-primary text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Search className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">Get a New Number</p>
                    <p className="text-sm text-muted-foreground">Search and purchase a number from {selectedProvider?.name}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => { setMethod("existing"); setStep(4); }}
                className="w-full p-5 rounded-xl border-2 border-border hover:border-primary text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Link2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">Connect Existing Number</p>
                    <p className="text-sm text-muted-foreground">Link a {selectedProvider?.name} number you already own</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </motion.div>
          )}

          {/* Step 4a: Search numbers */}
          {!isSuccess && step === 4 && method === "search" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Area code or city (e.g. 415, New York)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchNumbers()}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={searchNumbers}
                  disabled={isSearching}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </button>
              </div>

              {isSearching && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-muted-foreground">Searching {selectedProvider?.name} for available numbers...</p>
                </div>
              )}

              {!isSearching && availableNumbers.length === 0 && (
                <div className="text-center py-12">
                  <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">Enter an area code to search</p>
                  <p className="text-sm text-muted-foreground">Numbers will be fetched live from {selectedProvider?.name}</p>
                </div>
              )}

              {availableNumbers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{availableNumbers.length} numbers found</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {availableNumbers.map((num, i) => (
                      <motion.button
                        key={num.number}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelectedNumber(num)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedNumber?.number === num.number ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-lg font-mono">{num.number}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{num.region}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">${num.price.toFixed(2)}/mo</p>
                            <div className="flex gap-1 mt-1 justify-end">
                              {num.capabilities.map(c => <span key={c} className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{c}</span>)}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4b: Existing number */}
          {!isSuccess && step === 4 && method === "existing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your {selectedProvider?.name} Phone Number</label>
                <input
                  type="tel"
                  value={existingNumber}
                  onChange={(e) => setExistingNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono text-lg"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the number exactly as it appears in your {selectedProvider?.name} console
                </p>
              </div>
              <div className="p-4 bg-blue-500/5 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Note:</strong> We&apos;ll configure this number to forward calls to your AI agent.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 5: Configure */}
          {!isSuccess && step === 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg font-mono">{selectedNumber?.number || existingNumber}</p>
                    {selectedNumber && <p className="text-sm text-muted-foreground">{selectedNumber.region} • ${selectedNumber.price.toFixed(2)}/mo</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Friendly Name (Optional)</label>
                <input
                  type="text"
                  value={friendlyName}
                  onChange={(e) => setFriendlyName(e.target.value)}
                  placeholder="e.g., Main Sales Line, Support Hotline"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Assign to Agent (Optional)</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                      !selectedAgent ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Bot className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-muted-foreground">No agent (assign later)</p>
                    </div>
                    {!selectedAgent && <Check className="w-5 h-5 text-primary" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  You can assign agents after adding the number in the configure settings.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30 flex-shrink-0">
            {step > 1 ? (
              <button onClick={goBack} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                Back
              </button>
            ) : <div />}

            {step < 5 && step !== 3 && (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canGoNext()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 5 && (
              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPurchasing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
                ) : (
                  <><Zap className="w-4 h-4" />{method === "search" && selectedNumber ? `Purchase $${selectedNumber.price.toFixed(2)}/mo` : "Connect Number"}</>
                )}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
}
