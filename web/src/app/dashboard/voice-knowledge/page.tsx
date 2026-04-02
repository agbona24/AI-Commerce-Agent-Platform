"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  FileText,
  HelpCircle,
  Package,
  MapPin,
  Phone,
  Mail,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Building2,
} from "lucide-react";

// Mock knowledge data
const mockKnowledge = {
  businessInfo: {
    name: "Acme Dental Clinic",
    description: "Family-friendly dental practice offering comprehensive dental care including cleanings, fillings, crowns, root canals, and cosmetic dentistry. We've been serving the community for over 15 years.",
    tagline: "Your smile is our priority",
    address: "123 Health Street, Suite 100, San Francisco, CA 94102",
    phone: "+1 (415) 555-0123",
    email: "info@acmedental.com",
    website: "https://acmedental.com",
  },
  hours: {
    monday: { open: "09:00", close: "18:00", closed: false },
    tuesday: { open: "09:00", close: "18:00", closed: false },
    wednesday: { open: "09:00", close: "18:00", closed: false },
    thursday: { open: "09:00", close: "20:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "10:00", close: "14:00", closed: false },
    sunday: { open: "", close: "", closed: true },
  },
  services: [
    { id: "1", name: "Teeth Cleaning", price: "$150", duration: "45 min", description: "Professional cleaning to remove plaque and tartar" },
    { id: "2", name: "Dental Exam", price: "$100", duration: "30 min", description: "Comprehensive examination with X-rays" },
    { id: "3", name: "Teeth Whitening", price: "$300", duration: "60 min", description: "Professional whitening treatment" },
    { id: "4", name: "Root Canal", price: "$800-1200", duration: "90 min", description: "Root canal therapy to save damaged teeth" },
  ],
  faqs: [
    { id: "1", question: "Do you accept walk-ins?", answer: "We primarily operate by appointment, but we do accommodate emergency walk-ins when possible. For the best experience, we recommend scheduling in advance." },
    { id: "2", question: "What insurance do you accept?", answer: "We accept most major dental insurance plans including Delta Dental, Cigna, Aetna, and MetLife. Please call our office to verify your specific plan." },
    { id: "3", question: "How often should I get a dental checkup?", answer: "We recommend visiting us every 6 months for routine cleaning and examination. Some patients with specific conditions may need more frequent visits." },
    { id: "4", question: "Do you offer payment plans?", answer: "Yes! We offer flexible payment plans through CareCredit. We also accept all major credit cards and offer a 10% discount for cash payments." },
  ],
  keyPolicies: [
    { id: "1", policy: "24-hour cancellation notice required", type: "cancellation" },
    { id: "2", policy: "New patients should arrive 15 minutes early", type: "appointment" },
    { id: "3", policy: "Masks optional but appreciated", type: "health" },
  ],
};

type TabType = "overview" | "services" | "faqs" | "policies";

export default function VoiceKnowledgePage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<"service" | "faq" | "policy">("service");

  const tabs = [
    { id: "overview", name: "Business Info", icon: Building2 },
    { id: "services", name: "Services & Products", icon: Package },
    { id: "faqs", name: "FAQs", icon: HelpCircle },
    { id: "policies", name: "Policies", icon: FileText },
  ];

  const openAddModal = (type: "service" | "faq" | "policy") => {
    setAddModalType(type);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Voice AI Knowledge Base</h1>
          <p className="text-muted-foreground">Information your AI uses to answer calls accurately</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">AI Synced</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
            <Sparkles className="w-4 h-4" />
            Train AI
          </button>
        </div>
      </div>

      {/* Knowledge Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-200 dark:border-violet-800 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Knowledge Score</h3>
              <p className="text-sm text-muted-foreground">How well your AI understands your business</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-violet-600">85%</p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-muted-foreground">Services</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-muted-foreground">FAQs</p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-background/60 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> Add more FAQs to improve your AI&apos;s ability to handle common questions. 
              Consider adding info about insurance, payment options, and emergency procedures.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <OverviewTab data={mockKnowledge} />
        )}
        {activeTab === "services" && (
          <ServicesTab services={mockKnowledge.services} onAdd={() => openAddModal("service")} />
        )}
        {activeTab === "faqs" && (
          <FAQsTab faqs={mockKnowledge.faqs} onAdd={() => openAddModal("faq")} />
        )}
        {activeTab === "policies" && (
          <PoliciesTab policies={mockKnowledge.keyPolicies} onAdd={() => openAddModal("policy")} />
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddItemModal type={addModalType} onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ data }: { data: typeof mockKnowledge }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data.businessInfo);

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Business Information */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Business Information</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Edit
              </>
            )}
          </button>
        </div>
        <div className="p-6 space-y-6">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Business Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-xl font-bold">{formData.name}</h4>
                {formData.tagline && (
                  <p className="text-primary font-medium mt-1">{formData.tagline}</p>
                )}
              </div>
              <p className="text-muted-foreground">{formData.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{formData.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{formData.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a href={formData.website} className="font-medium text-primary hover:underline">{formData.website}</a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Business Hours</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {days.map((day) => {
              const hours = data.hours[day as keyof typeof data.hours];
              return (
                <div key={day} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <span className="font-medium capitalize">{day}</span>
                  {hours.closed ? (
                    <span className="text-muted-foreground">Closed</span>
                  ) : (
                    <span className="text-sm">{hours.open} - {hours.close}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ServicesTab({ services, onAdd }: { services: typeof mockKnowledge.services; onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{services.length} services</p>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">{service.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-medium">{service.price}</span>
                    <span>•</span>
                    <span>{service.duration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{service.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function FAQsTab({ faqs, onAdd }: { faqs: typeof mockKnowledge.faqs; onAdd: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{faqs.length} frequently asked questions</p>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">{faq.question}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedId === faq.id ? "rotate-180" : ""}`} />
              </div>
            </button>
            <AnimatePresence>
              {expandedId === faq.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0">
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="p-4 border border-dashed border-border rounded-xl text-center">
        <p className="text-sm text-muted-foreground mb-3">
          💡 Tip: Add more FAQs to help your AI handle common questions without needing to transfer calls.
        </p>
        <button
          onClick={onAdd}
          className="text-primary hover:underline text-sm font-medium"
        >
          Suggest FAQs based on my business type
        </button>
      </div>
    </motion.div>
  );
}

function PoliciesTab({ policies, onAdd }: { policies: typeof mockKnowledge.keyPolicies; onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{policies.length} policies</p>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Policy
        </button>
      </div>

      <div className="space-y-3">
        {policies.map((policy, index) => (
          <motion.div
            key={policy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                policy.type === "cancellation" ? "bg-red-500/10" :
                policy.type === "appointment" ? "bg-blue-500/10" :
                "bg-green-500/10"
              }`}>
                <FileText className={`w-5 h-5 ${
                  policy.type === "cancellation" ? "text-red-500" :
                  policy.type === "appointment" ? "text-blue-500" :
                  "text-green-500"
                }`} />
              </div>
              <div>
                <p className="font-medium">{policy.policy}</p>
                <p className="text-xs text-muted-foreground capitalize">{policy.type} policy</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function AddItemModal({ type, onClose }: { type: "service" | "faq" | "policy"; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
    question: "",
    answer: "",
    policy: "",
    policyType: "general",
  });

  const titles = {
    service: "Add Service",
    faq: "Add FAQ",
    policy: "Add Policy",
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
          <h2 className="text-xl font-bold">{titles[type]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {type === "service" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Service Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Dental Cleaning"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="$150"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="45 min"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this service includes..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </>
          )}

          {type === "faq" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Question *</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g., What are your business hours?"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Answer *</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide a clear, helpful answer..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </>
          )}

          {type === "policy" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Policy *</label>
                <textarea
                  value={formData.policy}
                  onChange={(e) => setFormData({ ...formData, policy: e.target.value })}
                  placeholder="e.g., 24-hour cancellation notice required"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Policy Type</label>
                <select
                  value={formData.policyType}
                  onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="general">General</option>
                  <option value="cancellation">Cancellation</option>
                  <option value="appointment">Appointment</option>
                  <option value="payment">Payment</option>
                  <option value="health">Health & Safety</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </motion.div>
    </>
  );
}
