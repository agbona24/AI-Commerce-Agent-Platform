"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Building2,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Stethoscope,
  UtensilsCrossed,
  Briefcase,
  Car,
  Home,
  Wrench,
  GraduationCap,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Zap,
  Globe,
  CreditCard,
  Users,
  HelpCircle,
  Play,
  Check,
  Link,
  ExternalLink,
  Wand2,
  RefreshCw,
  Copy,
  Lightbulb,
} from "lucide-react";

const businessTypes = [
  { id: "ecommerce", name: "E-commerce / Retail", icon: ShoppingBag, color: "from-orange-500 to-red-600" },
  { id: "healthcare", name: "Healthcare / Dental", icon: Stethoscope, color: "from-cyan-500 to-blue-600" },
  { id: "restaurant", name: "Restaurant / Food", icon: UtensilsCrossed, color: "from-amber-500 to-orange-600" },
  { id: "professional", name: "Professional Services", icon: Briefcase, color: "from-violet-500 to-purple-600" },
  { id: "automotive", name: "Automotive", icon: Car, color: "from-slate-500 to-gray-600" },
  { id: "realestate", name: "Real Estate", icon: Home, color: "from-green-500 to-emerald-600" },
  { id: "homeservices", name: "Home Services", icon: Wrench, color: "from-yellow-500 to-amber-600" },
  { id: "education", name: "Education", icon: GraduationCap, color: "from-indigo-500 to-blue-600" },
  { id: "other", name: "Other", icon: MoreHorizontal, color: "from-gray-500 to-slate-600" },
];

const ecommercePlatforms = [
  { id: "shopify", name: "Shopify", logo: "🛒" },
  { id: "woocommerce", name: "WooCommerce", logo: "🟣" },
  { id: "magento", name: "Magento", logo: "🔶" },
  { id: "odoo", name: "Odoo", logo: "⚪" },
  { id: "custom", name: "Custom / Other", logo: "⚙️" },
];

const bookingSystems = [
  { id: "calendly", name: "Calendly", logo: "📅" },
  { id: "acuity", name: "Acuity Scheduling", logo: "🗓️" },
  { id: "square", name: "Square Appointments", logo: "◼️" },
  { id: "zoho", name: "Zoho Bookings", logo: "📘" },
  { id: "custom", name: "Custom / In-house", logo: "🏠" },
];

const voicePersonalities = [
  { id: "professional", name: "Professional", description: "Formal and business-like", emoji: "👔" },
  { id: "friendly", name: "Friendly", description: "Warm and conversational", emoji: "😊" },
  { id: "concise", name: "Concise", description: "Quick and to the point", emoji: "⚡" },
  { id: "empathetic", name: "Empathetic", description: "Understanding and caring", emoji: "💙" },
];

// Types
interface VoiceSetupFormData {
  businessType: string;
  businessName: string;
  businessDescription: string;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  timezone: string;
  ecommercePlatform: string;
  bookingSystem: string;
  voicePersonality: string;
  greeting: string;
  mainCapabilities: string[];
  phoneNumber: string;
  agentName: string;
}

export default function VoiceSetupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Business Type
    businessType: "",
    // Step 2: Business Info
    businessName: "",
    businessDescription: "",
    // Step 3: Operations (for applicable businesses)
    openingTime: "09:00",
    closingTime: "18:00",
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    timezone: "America/New_York",
    // Step 4: Integrations
    ecommercePlatform: "",
    bookingSystem: "",
    // Step 5: AI Configuration
    voicePersonality: "friendly",
    greeting: "",
    mainCapabilities: [] as string[],
    // Step 6: Phone Number
    phoneNumber: "",
    // Complete
    agentName: "",
  });

  const totalSteps = getStepsForBusinessType(formData.businessType);
  const currentStepInfo = getStepInfo(step, formData.businessType);

  function getStepsForBusinessType(type: string) {
    if (type === "ecommerce") return 6;
    if (["healthcare", "restaurant", "automotive", "homeservices"].includes(type)) return 6;
    return 5;
  }

  function getStepInfo(step: number, businessType: string) {
    const baseSteps = [
      { id: 1, title: "Business Type", subtitle: "What kind of business do you have?" },
      { id: 2, title: "Business Info", subtitle: "Tell us about your business" },
    ];

    let additionalSteps: { id: number; title: string; subtitle: string }[] = [];

    if (businessType === "ecommerce") {
      additionalSteps = [
        { id: 3, title: "E-commerce Setup", subtitle: "Connect your store" },
        { id: 4, title: "AI Personality", subtitle: "How should your AI sound?" },
        { id: 5, title: "Phone Number", subtitle: "Connect a phone number" },
        { id: 6, title: "Review & Launch", subtitle: "You're almost there!" },
      ];
    } else if (["healthcare", "restaurant", "automotive", "homeservices"].includes(businessType)) {
      additionalSteps = [
        { id: 3, title: "Business Hours", subtitle: "When are you open?" },
        { id: 4, title: "Appointments", subtitle: "Connect your booking system" },
        { id: 5, title: "AI Personality", subtitle: "How should your AI sound?" },
        { id: 6, title: "Review & Launch", subtitle: "You're almost there!" },
      ];
    } else {
      additionalSteps = [
        { id: 3, title: "AI Personality", subtitle: "How should your AI sound?" },
        { id: 4, title: "Phone Number", subtitle: "Connect a phone number" },
        { id: 5, title: "Review & Launch", subtitle: "You're almost there!" },
      ];
    }

    const allSteps = [...baseSteps, ...additionalSteps];
    return allSteps.find(s => s.id === step) || allSteps[0];
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Progress Bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-semibold">{currentStepInfo.title}</h1>
              <p className="text-sm text-muted-foreground">{currentStepInfo.subtitle}</p>
            </div>
            <span className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1BusinessType
              key="step1"
              value={formData.businessType}
              onChange={(v) => setFormData({ ...formData, businessType: v })}
              onNext={handleNext}
            />
          )}

          {step === 2 && (
            <Step2BusinessInfo
              key="step2"
              businessType={formData.businessType}
              data={formData}
              onChange={(updates) => setFormData({ ...formData, ...updates })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 3 && formData.businessType === "ecommerce" && (
            <Step3Ecommerce
              key="step3-ecom"
              value={formData.ecommercePlatform}
              onChange={(v) => setFormData({ ...formData, ecommercePlatform: v })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 3 && ["healthcare", "restaurant", "automotive", "homeservices"].includes(formData.businessType) && (
            <Step3Hours
              key="step3-hours"
              data={formData}
              onChange={(updates) => setFormData({ ...formData, ...updates })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 3 && !["ecommerce", "healthcare", "restaurant", "automotive", "homeservices"].includes(formData.businessType) && (
            <StepAIPersonality
              key="step3-ai"
              data={formData}
              onChange={(updates) => setFormData({ ...formData, ...updates })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 4 && ["healthcare", "restaurant", "automotive", "homeservices"].includes(formData.businessType) && (
            <Step4Booking
              key="step4-booking"
              value={formData.bookingSystem}
              onChange={(v) => setFormData({ ...formData, bookingSystem: v })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 4 && formData.businessType === "ecommerce" && (
            <StepAIPersonality
              key="step4-ai"
              data={formData}
              onChange={(updates) => setFormData({ ...formData, ...updates })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 4 && !["ecommerce", "healthcare", "restaurant", "automotive", "homeservices"].includes(formData.businessType) && (
            <StepPhoneNumber
              key="step4-phone"
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 5 && ["healthcare", "restaurant", "automotive", "homeservices"].includes(formData.businessType) && (
            <StepAIPersonality
              key="step5-ai"
              data={formData}
              onChange={(updates) => setFormData({ ...formData, ...updates })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 5 && formData.businessType === "ecommerce" && (
            <StepPhoneNumber
              key="step5-phone"
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 5 && !["ecommerce", "healthcare", "restaurant", "automotive", "homeservices"].includes(formData.businessType) && (
            <StepReview
              key="step5-review"
              data={formData}
              onBack={handleBack}
            />
          )}

          {step === 6 && (
            <StepReview
              key="step6-review"
              data={formData}
              onBack={handleBack}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Step 1: Business Type Selection
function Step1BusinessType({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">What type of business do you have?</h2>
        <p className="text-muted-foreground">We&apos;ll customize your Voice AI setup based on your industry</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {businessTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
              value === type.id
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-3`}>
              <type.icon className="w-6 h-6 text-white" />
            </div>
            <p className="font-medium">{type.name}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={onNext}
          disabled={!value}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Step 2: Business Info
function Step2BusinessInfo({
  businessType,
  data,
  onChange,
  onNext,
  onBack,
}: {
  businessType: string;
  data: VoiceSetupFormData;
  onChange: (updates: Partial<VoiceSetupFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const businessTypeInfo = businessTypes.find((t) => t.id === businessType);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${businessTypeInfo?.color || "from-violet-500 to-purple-600"} flex items-center justify-center mx-auto mb-4`}>
          {businessTypeInfo && <businessTypeInfo.icon className="w-8 h-8 text-white" />}
        </div>
        <h2 className="text-2xl font-bold mb-2">Tell us about your business</h2>
        <p className="text-muted-foreground">This helps your AI understand and represent your business accurately</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Business Name *</label>
          <input
            type="text"
            value={data.businessName}
            onChange={(e) => onChange({ businessName: e.target.value })}
            placeholder="e.g., Acme Store"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Business Description *
            <span className="text-muted-foreground font-normal ml-2">(What do you do?)</span>
          </label>
          <textarea
            value={data.businessDescription}
            onChange={(e) => onChange({ businessDescription: e.target.value })}
            placeholder="Describe your business, products/services, and what makes you unique..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Be specific! This information helps your AI provide accurate responses to callers.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Agent Name</label>
          <input
            type="text"
            value={data.agentName}
            onChange={(e) => onChange({ agentName: e.target.value })}
            placeholder="e.g., Sarah, Alex, or leave blank for default"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-muted-foreground mt-1">
            What name should your AI introduce itself as?
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!data.businessName || !data.businessDescription}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Step 3: E-commerce Platform
function Step3Ecommerce({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [storeUrl, setStoreUrl] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Connect Your Store</h2>
        <p className="text-muted-foreground">Your AI will access your product catalog to answer customer questions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {ecommercePlatforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onChange(platform.id)}
            className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.02] ${
              value === platform.id
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border hover:border-primary/50"
            }`}
          >
            <span className="text-3xl block mb-2">{platform.logo}</span>
            <p className="font-medium text-sm">{platform.name}</p>
          </button>
        ))}
      </div>

      {value && value !== "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4 p-4 bg-muted/50 rounded-xl"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Store URL</label>
            <input
              type="url"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="https://your-store.myshopify.com"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your store API key"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HelpCircle className="w-4 h-4" />
            <a href="#" className="text-primary hover:underline">How to find your API key</a>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={onNext}
            className="px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-all"
          >
            Connect Store
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Step 3: Business Hours (for service businesses)
function Step3Hours({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: VoiceSetupFormData;
  onChange: (updates: Partial<VoiceSetupFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const days = [
    { id: "monday", label: "Mon" },
    { id: "tuesday", label: "Tue" },
    { id: "wednesday", label: "Wed" },
    { id: "thursday", label: "Thu" },
    { id: "friday", label: "Fri" },
    { id: "saturday", label: "Sat" },
    { id: "sunday", label: "Sun" },
  ];

  const toggleDay = (dayId: string) => {
    const newDays = data.workingDays.includes(dayId)
      ? data.workingDays.filter((d: string) => d !== dayId)
      : [...data.workingDays, dayId];
    onChange({ workingDays: newDays });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Business Hours</h2>
        <p className="text-muted-foreground">Your AI will inform callers about your operating hours</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Working Days</label>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  data.workingDays.includes(day.id)
                    ? "bg-primary text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Opening Time</label>
            <input
              type="time"
              value={data.openingTime}
              onChange={(e) => onChange({ openingTime: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Closing Time</label>
            <input
              type="time"
              value={data.closingTime}
              onChange={(e) => onChange({ closingTime: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <select
            value={data.timezone}
            onChange={(e) => onChange({ timezone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Africa/Lagos">Lagos (WAT)</option>
          </select>
        </div>

        <div className="p-4 bg-muted/50 rounded-xl">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">AI will handle after-hours calls</p>
              <p className="text-muted-foreground">
                When someone calls outside business hours, your AI will take messages, 
                schedule callbacks, or provide relevant information.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-all"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Step 4: Booking System
function Step4Booking({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Appointment Booking</h2>
        <p className="text-muted-foreground">Connect your booking system for AI-powered scheduling</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {bookingSystems.map((system) => (
          <button
            key={system.id}
            onClick={() => onChange(system.id)}
            className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.02] ${
              value === system.id
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border hover:border-primary/50"
            }`}
          >
            <span className="text-3xl block mb-2">{system.logo}</span>
            <p className="font-medium text-sm">{system.name}</p>
          </button>
        ))}
      </div>

      {value && value !== "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 bg-muted/50 rounded-xl"
        >
          <p className="text-sm text-center text-muted-foreground">
            Click below to connect your {bookingSystems.find(s => s.id === value)?.name} account
          </p>
          <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
            <Link className="w-4 h-4" />
            Connect {bookingSystems.find(s => s.id === value)?.name}
          </button>
        </motion.div>
      )}

      {value === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4 p-4 bg-muted/50 rounded-xl"
        >
          <p className="text-sm text-muted-foreground">
            For custom booking systems, we&apos;ll need API access or webhook integration.
          </p>
          <div>
            <label className="block text-sm font-medium mb-2">Booking System URL</label>
            <input
              type="url"
              placeholder="https://your-booking-system.com"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">API Key (if available)</label>
            <input
              type="password"
              placeholder="Your API key"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </motion.div>
      )}

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={onNext}
            className="px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-all"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// AI Personality Step
function StepAIPersonality({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: VoiceSetupFormData;
  onChange: (updates: Partial<VoiceSetupFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const capabilities = [
    { id: "answer_questions", label: "Answer product/service questions", icon: HelpCircle },
    { id: "take_orders", label: "Take orders", icon: ShoppingBag },
    { id: "book_appointments", label: "Book appointments", icon: Calendar },
    { id: "check_availability", label: "Check availability", icon: Clock },
    { id: "provide_pricing", label: "Provide pricing info", icon: CreditCard },
    { id: "collect_info", label: "Collect customer information", icon: Users },
    { id: "transfer_calls", label: "Transfer to human", icon: Phone },
    { id: "take_messages", label: "Take messages", icon: MessageSquare },
  ];

  // Pre-made greeting templates based on business type and personality
  const greetingTemplates: Record<string, Record<string, string[]>> = {
    professional: {
      ecommerce: [
        `Good day! Thank you for calling ${data.businessName || '[Business Name]'}. My name is ${data.agentName || 'your assistant'}. How may I assist you with your order or product inquiry today?`,
        `Welcome to ${data.businessName || '[Business Name]'}. This is ${data.agentName || 'your assistant'} speaking. How can I help you find what you're looking for?`,
        `Thank you for contacting ${data.businessName || '[Business Name]'}. I'm ${data.agentName || 'here'} to assist with orders, products, or any questions you may have.`,
      ],
      healthcare: [
        `Thank you for calling ${data.businessName || '[Practice Name]'}. This is ${data.agentName || 'your assistant'}. How may I help you schedule an appointment or answer your questions today?`,
        `Good day! You've reached ${data.businessName || '[Practice Name]'}. I'm ${data.agentName || 'here'} to assist you with appointments, services, or general inquiries.`,
        `Welcome to ${data.businessName || '[Practice Name]'}. My name is ${data.agentName || 'your assistant'}. How can I assist you with your healthcare needs today?`,
      ],
      restaurant: [
        `Thank you for calling ${data.businessName || '[Restaurant Name]'}. This is ${data.agentName || 'your assistant'}. How may I help you with reservations or takeout orders today?`,
        `Welcome to ${data.businessName || '[Restaurant Name]'}. I'm ${data.agentName || 'here'} to assist with reservations, menu inquiries, or special requests.`,
        `Good day! You've reached ${data.businessName || '[Restaurant Name]'}. How can I assist you with your dining needs today?`,
      ],
      default: [
        `Thank you for calling ${data.businessName || '[Business Name]'}. This is ${data.agentName || 'your assistant'}. How may I assist you today?`,
        `Good day! You've reached ${data.businessName || '[Business Name]'}. I'm ${data.agentName || 'here'} to help. What can I do for you?`,
        `Welcome to ${data.businessName || '[Business Name]'}. How may I direct your call or answer your questions today?`,
      ],
    },
    friendly: {
      ecommerce: [
        `Hey there! Thanks for calling ${data.businessName || '[Business Name]'}! I'm ${data.agentName || 'your friendly assistant'}. What can I help you find today?`,
        `Hi! Welcome to ${data.businessName || '[Business Name]'}! I'm ${data.agentName || 'here'} and super excited to help you. What are you looking for?`,
        `Hello and welcome! You've reached ${data.businessName || '[Business Name]'}. I'm ${data.agentName || 'your assistant'} - let me know how I can make your shopping experience awesome!`,
      ],
      healthcare: [
        `Hi there! Thanks for calling ${data.businessName || '[Practice Name]'}! I'm ${data.agentName || 'your assistant'}. How can I help you today?`,
        `Hello! Welcome to ${data.businessName || '[Practice Name]'}. I'm ${data.agentName || 'here'} to help with appointments or any questions you have!`,
        `Hey! You've reached ${data.businessName || '[Practice Name]'}. I'm ${data.agentName || 'your friendly assistant'}. What can I do for you today?`,
      ],
      restaurant: [
        `Hey! Thanks for calling ${data.businessName || '[Restaurant Name]'}! I'm ${data.agentName || 'your assistant'}. Ready to help with reservations or hungry for some recommendations?`,
        `Hi there! Welcome to ${data.businessName || '[Restaurant Name]'}! What delicious thing can I help you with today?`,
        `Hello! You've reached ${data.businessName || '[Restaurant Name]'}. I'm ${data.agentName || 'here'} to help with reservations, orders, or answer any menu questions!`,
      ],
      default: [
        `Hey there! Thanks for calling ${data.businessName || '[Business Name]'}! I'm ${data.agentName || 'your assistant'}. How can I help?`,
        `Hi! Welcome to ${data.businessName || '[Business Name]'}! What can I do for you today?`,
        `Hello! Great to hear from you! I'm ${data.agentName || 'here at'} ${data.businessName || '[Business Name]'}. How may I help?`,
      ],
    },
    concise: {
      ecommerce: [
        `${data.businessName || '[Business Name]'}, ${data.agentName || 'assistant'} speaking. How can I help?`,
        `Hi, ${data.businessName || '[Business Name]'}. Orders, products, or questions?`,
        `${data.businessName || '[Business Name]'}. What do you need help with?`,
      ],
      healthcare: [
        `${data.businessName || '[Practice Name]'}, ${data.agentName || 'assistant'} speaking. Appointment or inquiry?`,
        `Hi, ${data.businessName || '[Practice Name]'}. How can I help today?`,
        `${data.businessName || '[Practice Name]'}. Scheduling or questions?`,
      ],
      restaurant: [
        `${data.businessName || '[Restaurant Name]'}, ${data.agentName || 'assistant'} speaking. Reservation or order?`,
        `Hi, ${data.businessName || '[Restaurant Name]'}. How can I help?`,
        `${data.businessName || '[Restaurant Name]'}. Table, takeout, or delivery?`,
      ],
      default: [
        `${data.businessName || '[Business Name]'}, ${data.agentName || 'assistant'} speaking. How can I help?`,
        `Hi, ${data.businessName || '[Business Name]'}. What do you need?`,
        `${data.businessName || '[Business Name]'}. How may I assist?`,
      ],
    },
    empathetic: {
      ecommerce: [
        `Hello and thank you so much for calling ${data.businessName || '[Business Name]'}. I'm ${data.agentName || 'your assistant'}, and I'm here to help with whatever you need. How are you doing today?`,
        `Hi there! I really appreciate you reaching out to ${data.businessName || '[Business Name]'}. I'm ${data.agentName || 'here'} and happy to help. What can I do for you?`,
        `Welcome to ${data.businessName || '[Business Name]'}! I'm ${data.agentName || 'your assistant'}. I'm here to make sure you have a great experience. How can I help?`,
      ],
      healthcare: [
        `Hello, and thank you for calling ${data.businessName || '[Practice Name]'}. I'm ${data.agentName || 'your assistant'}. I understand health matters are important, and I'm here to help. How are you feeling today?`,
        `Hi there. Thank you for reaching out to ${data.businessName || '[Practice Name]'}. I'm ${data.agentName || 'here'} to help you with anything you need. What can I assist you with?`,
        `Welcome to ${data.businessName || '[Practice Name]'}. I'm ${data.agentName || 'your caring assistant'}. Your wellbeing matters to us. How may I help you today?`,
      ],
      restaurant: [
        `Hello! Thank you so much for calling ${data.businessName || '[Restaurant Name]'}. I'm ${data.agentName || 'your assistant'}, and I'd love to help make your dining experience special. What can I do for you?`,
        `Hi there! Welcome to ${data.businessName || '[Restaurant Name]'}. I'm ${data.agentName || 'here'} to help with anything you need. Planning something special?`,
        `Thanks for calling ${data.businessName || '[Restaurant Name]'}! I'm ${data.agentName || 'your assistant'}. Let me know how I can make your day a little better!`,
      ],
      default: [
        `Hello, and thank you for calling ${data.businessName || '[Business Name]'}. I'm ${data.agentName || 'your assistant'}, and I truly appreciate you reaching out. How can I help you today?`,
        `Hi there! Thank you for contacting ${data.businessName || '[Business Name]'}. I'm ${data.agentName || 'here'} and happy to assist. What can I do for you?`,
        `Welcome to ${data.businessName || '[Business Name]'}. I'm ${data.agentName || 'your assistant'}, and I'm here to help with anything you need. How are you doing?`,
      ],
    },
  };

  const getCurrentSuggestions = () => {
    const personality = data.voicePersonality || 'friendly';
    const businessType = data.businessType || 'default';
    const templates = greetingTemplates[personality];
    return templates[businessType] || templates['default'];
  };

  const generateAISuggestions = async () => {
    setIsGenerating(true);
    setShowSuggestions(true);
    
    try {
      // Call our AI suggestion API (connects to OpenAI)
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: data.businessName,
          businessDescription: data.businessDescription,
          agentName: data.agentName,
          businessType: data.businessType,
          voicePersonality: data.voicePersonality,
          promptType: "greeting",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.suggestions && result.suggestions.length > 0) {
          setAiSuggestions(result.suggestions);
          setIsGenerating(false);
          return;
        }
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
    }
    
    // Fallback to local generation if API fails
    const businessName = data.businessName || 'your business';
    const agentName = data.agentName || 'AI assistant';
    const businessDesc = data.businessDescription || '';
    
    const generated = [
      `Hello! Welcome to ${businessName}. I'm ${agentName}, your AI assistant. ${businessDesc ? `We specialize in ${businessDesc.slice(0, 50)}...` : ''} How can I make your day better?`,
      `Thanks for calling ${businessName}! I'm ${agentName}. Whether you need help with questions, orders, or just want to chat, I'm here for you. What brings you in today?`,
      `Hi there! You've reached ${businessName}. I'm ${agentName}, and I'm genuinely excited to help you. What can I assist you with?`,
    ];
    
    setAiSuggestions(generated);
    setIsGenerating(false);
  };

  const toggleCapability = (id: string) => {
    const newCapabilities = data.mainCapabilities.includes(id)
      ? data.mainCapabilities.filter((c: string) => c !== id)
      : [...data.mainCapabilities, id];
    onChange({ mainCapabilities: newCapabilities });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">AI Personality & Capabilities</h2>
        <p className="text-muted-foreground">Customize how your AI interacts with callers</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Voice Personality</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {voicePersonalities.map((personality) => (
              <button
                key={personality.id}
                onClick={() => onChange({ voicePersonality: personality.id })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  data.voicePersonality === personality.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-2xl block mb-2">{personality.emoji}</span>
                <p className="font-medium text-sm">{personality.name}</p>
                <p className="text-xs text-muted-foreground">{personality.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Custom Greeting</label>
            <button
              onClick={generateAISuggestions}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate with AI
                </>
              )}
            </button>
          </div>
          
          <textarea
            value={data.greeting}
            onChange={(e) => onChange({ greeting: e.target.value })}
            placeholder={`e.g., "Hello! Thank you for calling ${data.businessName || 'our business'}. How can I help you today?"`}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />

          {/* Suggestions Panel */}
          <div className="mt-3 space-y-3">
            {/* Quick Templates */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground">Suggested Templates</span>
              </div>
              <div className="space-y-2">
                {getCurrentSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onChange({ greeting: suggestion })}
                    className={`w-full p-3 text-left text-sm rounded-xl border transition-all hover:border-primary/50 hover:bg-primary/5 ${
                      data.greeting === suggestion
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-muted-foreground line-clamp-2">&ldquo;{suggestion}&rdquo;</p>
                      {data.greeting === suggestion ? (
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Generated Suggestions */}
            <AnimatePresence>
              {showSuggestions && aiSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-medium text-muted-foreground">AI-Generated for Your Business</span>
                  </div>
                  <div className="space-y-2 p-3 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-indigo-500/5 rounded-xl border border-violet-200 dark:border-violet-800">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => onChange({ greeting: suggestion })}
                        className={`w-full p-3 text-left text-sm rounded-lg border transition-all hover:border-violet-400 hover:bg-violet-500/10 ${
                          data.greeting === suggestion
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-violet-200 dark:border-violet-700 bg-background"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-muted-foreground line-clamp-3">&ldquo;{suggestion}&rdquo;</p>
                          {data.greeting === suggestion && (
                            <Check className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={generateAISuggestions}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 p-2 text-sm text-violet-600 hover:bg-violet-500/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      Generate More
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">AI Capabilities</label>
          <div className="grid grid-cols-2 gap-3">
            {capabilities.map((cap) => (
              <button
                key={cap.id}
                onClick={() => toggleCapability(cap.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  data.mainCapabilities.includes(cap.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  data.mainCapabilities.includes(cap.id)
                    ? "bg-primary text-white"
                    : "bg-muted"
                }`}>
                  <cap.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{cap.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-all"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Phone Number Step
function StepPhoneNumber({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [hasNumber, setHasNumber] = useState<boolean | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Connect a Phone Number</h2>
        <p className="text-muted-foreground">Your AI needs a phone number to receive calls</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setHasNumber(true)}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            hasNumber === true ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <p className="font-semibold">I have a Twilio number</p>
              <p className="text-sm text-muted-foreground">Connect your existing Twilio phone number</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setHasNumber(false)}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            hasNumber === false ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold">I need a phone number</p>
              <p className="text-sm text-muted-foreground">Get a new number through Twilio</p>
            </div>
          </div>
        </button>
      </div>

      {hasNumber === true && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4 p-4 bg-muted/50 rounded-xl"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Twilio Account SID</label>
            <input
              type="text"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Auth Token</label>
            <input
              type="password"
              placeholder="Your Twilio auth token"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="+1 234 567 8900"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </motion.div>
      )}

      {hasNumber === false && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 bg-muted/50 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Get a Twilio phone number</p>
              <p className="text-muted-foreground mb-3">
                Create a Twilio account and purchase a phone number. It only takes a few minutes!
              </p>
              <a
                href="https://www.twilio.com/try-twilio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Sign up for Twilio
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={onNext}
            className="px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={onNext}
            disabled={hasNumber === null}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Review & Launch Step
function StepReview({
  data,
  onBack,
}: {
  data: VoiceSetupFormData;
  onBack: () => void;
}) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleLaunch = async () => {
    setIsLaunching(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLaunching(false);
    setIsComplete(true);
  };

  const businessTypeInfo = businessTypes.find(t => t.id === data.businessType);

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3">Your Voice AI is Live! 🎉</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          {data.agentName || "Your AI assistant"} is ready to answer calls for {data.businessName || "your business"}.
        </p>
        
        <div className="bg-card border border-border rounded-2xl p-6 max-w-md mx-auto mb-8">
          <p className="text-sm text-muted-foreground mb-2">Your AI Phone Number</p>
          <p className="text-2xl font-bold text-primary">+1 (415) 555-0123</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
            <Phone className="w-4 h-4" />
            Test Your AI
          </button>
          <a
            href="/dashboard/agents"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            View All Agents
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Review & Launch</h2>
        <p className="text-muted-foreground">Make sure everything looks good before going live</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold">Voice Agent Summary</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${businessTypeInfo?.color || "from-violet-500 to-purple-600"} flex items-center justify-center`}>
              {businessTypeInfo && <businessTypeInfo.icon className="w-7 h-7 text-white" />}
            </div>
            <div>
              <p className="font-semibold text-lg">{data.businessName || "Your Business"}</p>
              <p className="text-sm text-muted-foreground">{businessTypeInfo?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">Agent Name</p>
              <p className="font-medium">{data.agentName || "AI Assistant"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Voice Style</p>
              <p className="font-medium capitalize">{data.voicePersonality}</p>
            </div>
            {data.openingTime && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Business Hours</p>
                  <p className="font-medium">{data.openingTime} - {data.closingTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Working Days</p>
                  <p className="font-medium">{data.workingDays?.length || 0} days/week</p>
                </div>
              </>
            )}
          </div>

          {data.mainCapabilities?.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-2">
                {data.mainCapabilities.map((cap: string) => (
                  <span key={cap} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {cap.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Voice Preview */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Preview Your AI</h3>
            <p className="text-sm text-muted-foreground">Hear how your AI will greet callers</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors">
            <Play className="w-4 h-4" />
            Play Sample
          </button>
        </div>
        <div className="p-4 bg-muted/50 rounded-xl">
          <p className="text-sm italic text-muted-foreground">
            &ldquo;{data.greeting || `Hello! Thank you for calling ${data.businessName || 'our business'}. My name is ${data.agentName || 'your AI assistant'}. How can I help you today?`}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleLaunch}
          disabled={isLaunching}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:opacity-90 transition-all disabled:opacity-70"
        >
          {isLaunching ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Launching...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Launch Voice AI
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
