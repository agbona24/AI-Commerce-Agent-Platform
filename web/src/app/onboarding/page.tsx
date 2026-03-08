"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Users,
  Globe,
  Phone,
  MessageSquare,
  Bot,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  Zap,
  ShoppingBag,
  Stethoscope,
  UtensilsCrossed,
  Briefcase,
  GraduationCap,
  Home,
  Car,
  Scissors,
  Dumbbell,
  Store,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// Simulated account type from registration - in real app, this would come from auth context
const mockAccountType: "business" | "agency" = "business";

const industries = [
  { id: "retail", name: "Retail & E-commerce", icon: ShoppingBag, color: "from-orange-500 to-red-500" },
  { id: "healthcare", name: "Healthcare & Dental", icon: Stethoscope, color: "from-blue-500 to-cyan-500" },
  { id: "restaurant", name: "Restaurant & Food", icon: UtensilsCrossed, color: "from-amber-500 to-orange-500" },
  { id: "professional", name: "Professional Services", icon: Briefcase, color: "from-slate-500 to-gray-600" },
  { id: "education", name: "Education & Training", icon: GraduationCap, color: "from-indigo-500 to-purple-500" },
  { id: "realestate", name: "Real Estate", icon: Home, color: "from-emerald-500 to-teal-500" },
  { id: "automotive", name: "Automotive", icon: Car, color: "from-red-500 to-rose-500" },
  { id: "beauty", name: "Beauty & Wellness", icon: Scissors, color: "from-pink-500 to-rose-400" },
  { id: "fitness", name: "Fitness & Sports", icon: Dumbbell, color: "from-green-500 to-emerald-500" },
  { id: "other", name: "Other", icon: Store, color: "from-violet-500 to-purple-500" },
];

const automationTasks = [
  { id: "customer-support", name: "Customer Support", description: "Answer FAQs, handle complaints, provide product info" },
  { id: "appointments", name: "Appointment Booking", description: "Schedule, reschedule, and confirm appointments" },
  { id: "order-tracking", name: "Order Tracking", description: "Provide order status, shipping updates, delivery info" },
  { id: "lead-qualification", name: "Lead Qualification", description: "Qualify leads, collect contact info, schedule demos" },
  { id: "payments", name: "Payment Collection", description: "Send payment links, handle invoicing, payment reminders" },
  { id: "reservations", name: "Reservations", description: "Book tables, rooms, services with confirmation" },
];

const toneOptions = [
  { id: "professional", name: "Professional", description: "Formal and business-like", emoji: "👔" },
  { id: "friendly", name: "Friendly", description: "Warm and approachable", emoji: "😊" },
  { id: "casual", name: "Casual", description: "Relaxed and conversational", emoji: "🤙" },
  { id: "enthusiastic", name: "Enthusiastic", description: "Energetic and excited", emoji: "🎉" },
];

const channelOptions = [
  { id: "whatsapp", name: "WhatsApp Business", icon: MessageSquare, color: "bg-green-500", description: "Connect your WhatsApp Business account" },
  { id: "voice", name: "Voice AI", icon: Phone, color: "bg-violet-500", description: "Set up AI phone answering" },
  { id: "web", name: "Website Widget", icon: Globe, color: "bg-blue-500", description: "Add chat widget to your website" },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [accountType] = useState<"business" | "agency">(mockAccountType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Business Info
    businessName: "",
    website: "",
    teamSize: "",
    // For agencies
    agencyName: "",
    clientBusinessName: "",
    
    // Step 2: Industry
    industry: "",
    customIndustry: "",
    
    // Step 3: AI Config
    selectedTasks: [] as string[],
    tone: "friendly",
    customGreeting: "",
    
    // Step 4: Channels
    selectedChannels: [] as string[],
  });

  const steps = accountType === "agency" 
    ? ["Agency Setup", "First Client", "Industry", "AI Configuration", "Channels", "Review"]
    : ["Business Info", "Industry", "AI Configuration", "Channels", "Review"];

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "selectedTasks" | "selectedChannels", item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const canProceed = () => {
    if (accountType === "agency") {
      switch (currentStep) {
        case 0: return formData.agencyName.length >= 2;
        case 1: return formData.clientBusinessName.length >= 2;
        case 2: return formData.industry !== "";
        case 3: return formData.selectedTasks.length > 0 && formData.tone !== "";
        case 4: return formData.selectedChannels.length > 0;
        case 5: return true;
        default: return false;
      }
    } else {
      switch (currentStep) {
        case 0: return formData.businessName.length >= 2;
        case 1: return formData.industry !== "";
        case 2: return formData.selectedTasks.length > 0 && formData.tone !== "";
        case 3: return formData.selectedChannels.length > 0;
        case 4: return true;
        default: return false;
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Redirect to dashboard
    window.location.href = "/dashboard";
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar - Progress */}
      <div className="hidden lg:flex lg:w-80 bg-gradient-to-b from-slate-900 to-slate-800 p-8 flex-col">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Vivax AI</span>
        </Link>

        <div className="flex-1">
          <h2 className="text-white/60 text-sm font-medium mb-6 uppercase tracking-wider">Setup Progress</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index < currentStep
                    ? "bg-green-500 text-white"
                    : index === currentStep
                    ? "bg-violet-600 text-white ring-4 ring-violet-600/30"
                    : "bg-slate-700 text-slate-400"
                }`}>
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  index <= currentStep ? "text-white" : "text-slate-500"
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-700 flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Need help? <a href="#" className="text-violet-400 hover:text-violet-300">Contact support</a>
          </p>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">Vivax AI</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
              <ThemeToggle />
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {/* Business Info Step (Business) or Agency Setup (Agency) */}
              {currentStep === 0 && (
                <motion.div key="step0" {...fadeInUp} transition={{ duration: 0.3 }}>
                  {accountType === "agency" ? (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-2xl lg:text-3xl font-bold">Set up your agency</h1>
                          <p className="text-muted-foreground">Tell us about your consulting business</p>
                        </div>
                      </div>
                      
                      <div className="mt-8 space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Agency Name</label>
                          <input
                            type="text"
                            value={formData.agencyName}
                            onChange={(e) => updateFormData("agencyName", e.target.value)}
                            placeholder="Your agency or consulting firm name"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => updateFormData("website", e.target.value)}
                            placeholder="https://youragency.com"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Team Size</label>
                          <div className="relative">
                            <select
                              value={formData.teamSize}
                              onChange={(e) => updateFormData("teamSize", e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all appearance-none"
                            >
                              <option value="">Select team size</option>
                              <option value="solo">Just me</option>
                              <option value="2-5">2-5 people</option>
                              <option value="6-20">6-20 people</option>
                              <option value="20+">20+ people</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-2xl lg:text-3xl font-bold">Tell us about your business</h1>
                          <p className="text-muted-foreground">We&apos;ll customize Vivax AI for you</p>
                        </div>
                      </div>
                      
                      <div className="mt-8 space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Business Name</label>
                          <input
                            type="text"
                            value={formData.businessName}
                            onChange={(e) => updateFormData("businessName", e.target.value)}
                            placeholder="Your company or store name"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                          <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => updateFormData("website", e.target.value)}
                            placeholder="https://yourbusiness.com"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Team Size</label>
                          <div className="relative">
                            <select
                              value={formData.teamSize}
                              onChange={(e) => updateFormData("teamSize", e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all appearance-none"
                            >
                              <option value="">Select team size</option>
                              <option value="1">Just me</option>
                              <option value="2-10">2-10 employees</option>
                              <option value="11-50">11-50 employees</option>
                              <option value="51-200">51-200 employees</option>
                              <option value="200+">200+ employees</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* First Client Step (Agency only) */}
              {currentStep === 1 && accountType === "agency" && (
                <motion.div key="step1-agency" {...fadeInUp} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold">Add your first client</h1>
                      <p className="text-muted-foreground">Set up a workspace for your client</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Client Business Name</label>
                      <input
                        type="text"
                        value={formData.clientBusinessName}
                        onChange={(e) => updateFormData("clientBusinessName", e.target.value)}
                        placeholder="Your client's company name"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-xl border border-border">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-violet-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Pro tip</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            You can add more clients later from your dashboard. Each client gets their own isolated workspace with separate AI agents, conversations, and analytics.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Industry Step */}
              {((currentStep === 1 && accountType === "business") || (currentStep === 2 && accountType === "agency")) && (
                <motion.div key="step-industry" {...fadeInUp} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold">What industry are you in?</h1>
                      <p className="text-muted-foreground">We&apos;ll pre-configure AI for your industry</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    {industries.map((industry) => (
                      <button
                        key={industry.id}
                        onClick={() => updateFormData("industry", industry.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.industry === industry.id
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-border hover:border-violet-500/50 hover:bg-muted/50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center mb-3`}>
                          <industry.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="font-medium text-sm">{industry.name}</p>
                      </button>
                    ))}
                  </div>

                  {formData.industry === "other" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4"
                    >
                      <input
                        type="text"
                        value={formData.customIndustry}
                        onChange={(e) => updateFormData("customIndustry", e.target.value)}
                        placeholder="Describe your industry"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* AI Configuration Step */}
              {((currentStep === 2 && accountType === "business") || (currentStep === 3 && accountType === "agency")) && (
                <motion.div key="step-ai" {...fadeInUp} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold">Configure your AI agent</h1>
                      <p className="text-muted-foreground">Select what you want to automate</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-8">
                    {/* Tasks Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-3">What should your AI handle? (Select all that apply)</label>
                      <div className="space-y-3">
                        {automationTasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => toggleArrayItem("selectedTasks", task.id)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                              formData.selectedTasks.includes(task.id)
                                ? "border-violet-500 bg-violet-500/10"
                                : "border-border hover:border-violet-500/50"
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              formData.selectedTasks.includes(task.id)
                                ? "border-violet-500 bg-violet-500"
                                : "border-muted-foreground"
                            }`}>
                              {formData.selectedTasks.includes(task.id) && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{task.name}</p>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tone Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-3">How should your AI sound?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {toneOptions.map((tone) => (
                          <button
                            key={tone.id}
                            onClick={() => updateFormData("tone", tone.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              formData.tone === tone.id
                                ? "border-violet-500 bg-violet-500/10"
                                : "border-border hover:border-violet-500/50"
                            }`}
                          >
                            <span className="text-2xl mb-2 block">{tone.emoji}</span>
                            <p className="font-medium">{tone.name}</p>
                            <p className="text-sm text-muted-foreground">{tone.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Channels Step */}
              {((currentStep === 3 && accountType === "business") || (currentStep === 4 && accountType === "agency")) && (
                <motion.div key="step-channels" {...fadeInUp} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold">Connect your channels</h1>
                      <p className="text-muted-foreground">Where should your AI engage customers?</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    {channelOptions.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => toggleArrayItem("selectedChannels", channel.id)}
                        className={`w-full p-6 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                          formData.selectedChannels.includes(channel.id)
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-border hover:border-violet-500/50"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl ${channel.color} flex items-center justify-center flex-shrink-0`}>
                          <channel.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-lg">{channel.name}</p>
                          <p className="text-muted-foreground">{channel.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          formData.selectedChannels.includes(channel.id)
                            ? "border-violet-500 bg-violet-500"
                            : "border-muted-foreground"
                        }`}>
                          {formData.selectedChannels.includes(channel.id) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                    
                    <p className="text-sm text-muted-foreground text-center pt-4">
                      Don&apos;t worry, you can change these settings later in your dashboard
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Review Step */}
              {((currentStep === 4 && accountType === "business") || (currentStep === 5 && accountType === "agency")) && (
                <motion.div key="step-review" {...fadeInUp} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold">Ready to launch!</h1>
                      <p className="text-muted-foreground">Review your setup before we create your AI agent</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    {/* Business Info Summary */}
                    <div className="p-5 rounded-xl border border-border bg-muted/30">
                      <div className="flex items-center gap-3 mb-3">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-medium">
                          {accountType === "agency" ? "Agency & Client" : "Business"}
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        {accountType === "agency" ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Agency</span>
                              <span className="font-medium">{formData.agencyName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">First Client</span>
                              <span className="font-medium">{formData.clientBusinessName}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Business Name</span>
                            <span className="font-medium">{formData.businessName}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Industry</span>
                          <span className="font-medium capitalize">
                            {industries.find(i => i.id === formData.industry)?.name || formData.industry}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Config Summary */}
                    <div className="p-5 rounded-xl border border-border bg-muted/30">
                      <div className="flex items-center gap-3 mb-3">
                        <Bot className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-medium">AI Configuration</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tone</span>
                          <span className="font-medium capitalize">{formData.tone}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Automating:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.selectedTasks.map(taskId => {
                              const task = automationTasks.find(t => t.id === taskId);
                              return (
                                <span key={taskId} className="px-2 py-1 bg-violet-500/10 text-violet-500 rounded-lg text-xs font-medium">
                                  {task?.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Channels Summary */}
                    <div className="p-5 rounded-xl border border-border bg-muted/30">
                      <div className="flex items-center gap-3 mb-3">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-medium">Channels</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedChannels.map(channelId => {
                          const channel = channelOptions.find(c => c.id === channelId);
                          return (
                            <span key={channelId} className="px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium flex items-center gap-2">
                              {channel && <channel.icon className="w-4 h-4" />}
                              {channel?.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* What happens next */}
                    <div className="p-5 rounded-xl border border-violet-500/30 bg-violet-500/5">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-violet-500" />
                        What happens next?
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Your AI agent will be created instantly
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Pre-configured responses for your industry
                        </li>
                        <li className="flex items-center gap-2">
                          <Circle className="w-4 h-4 text-muted-foreground" />
                          Connect your channels in the dashboard
                        </li>
                        <li className="flex items-center gap-2">
                          <Circle className="w-4 h-4 text-muted-foreground" />
                          Train your AI with your business knowledge
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-border bg-background">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? "opacity-0 pointer-events-none"
                  : "hover:bg-muted"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating your agent...
                  </>
                ) : (
                  <>
                    Launch Vivax AI
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
