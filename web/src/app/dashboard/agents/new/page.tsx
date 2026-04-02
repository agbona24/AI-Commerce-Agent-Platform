"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Phone,
  MessageSquare,
  Globe,
  Mail,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Zap,
  GitBranch,
  Settings,
  Loader2,
  Rocket,
  ExternalLink,
  Wand2,
  RefreshCw,
  Check,
  Volume2,
  Pause,
  Play,
  Sliders,
  Headphones,
} from "lucide-react";
import { agentService } from "@/lib/api";

const agentTypes = [
  {
    id: "voice",
    name: "Voice Agent",
    description: "Handle inbound and outbound phone calls",
    icon: Phone,
    color: "from-green-500 to-emerald-600",
    features: ["Phone calls", "IVR flows", "Call transfers", "Voicemail"],
  },
  {
    id: "chat",
    name: "Chat Agent",
    description: "Manage web chat and messaging conversations",
    icon: MessageSquare,
    color: "from-blue-500 to-indigo-600",
    features: ["Web chat", "Live chat", "Automated responses", "Lead capture"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Agent",
    description: "Automate WhatsApp Business conversations",
    icon: Globe,
    color: "from-green-600 to-emerald-700",
    features: ["WhatsApp Business", "Templates", "Rich media", "Catalogues"],
  },
  {
    id: "email",
    name: "Email Agent",
    description: "Automate email support and responses",
    icon: Mail,
    color: "from-orange-500 to-red-600",
    features: ["Auto-replies", "Ticket routing", "Follow-ups", "Signatures"],
  },
  {
    id: "hybrid",
    name: "Omnichannel Agent",
    description: "Single agent across all channels",
    icon: Bot,
    color: "from-violet-500 to-purple-600",
    features: ["All channels", "Unified inbox", "Context sharing", "Handoffs"],
  },
];

const personalityOptions = [
  { id: "professional", name: "Professional", emoji: "👔", description: "Formal and business-like" },
  { id: "friendly", name: "Friendly", emoji: "😊", description: "Warm and conversational" },
  { id: "concise", name: "Concise", emoji: "⚡", description: "Quick and to the point" },
  { id: "empathetic", name: "Empathetic", emoji: "💙", description: "Understanding and caring" },
];

// Voice options for voice agents
const voiceOptions = [
  { 
    id: "alloy", 
    name: "Alloy", 
    description: "Neutral and balanced", 
    gender: "neutral",
    accent: "American",
    color: "from-slate-500 to-slate-600",
    sampleText: "Hello! I'm Alloy, your AI assistant. How can I help you today?",
  },
  { 
    id: "nova", 
    name: "Nova", 
    description: "Warm and engaging", 
    gender: "female",
    accent: "American",
    color: "from-pink-500 to-rose-600",
    sampleText: "Hi there! I'm Nova, ready to assist you with anything you need!",
  },
  { 
    id: "shimmer", 
    name: "Shimmer", 
    description: "Clear and professional", 
    gender: "female",
    accent: "American",
    color: "from-violet-500 to-purple-600",
    sampleText: "Good day! I'm Shimmer. How may I be of service?",
  },
  { 
    id: "echo", 
    name: "Echo", 
    description: "Friendly and approachable", 
    gender: "male",
    accent: "American",
    color: "from-blue-500 to-indigo-600",
    sampleText: "Hey! I'm Echo. What can I do for you today?",
  },
  { 
    id: "fable", 
    name: "Fable", 
    description: "Expressive and dynamic", 
    gender: "male",
    accent: "British",
    color: "from-amber-500 to-orange-600",
    sampleText: "Greetings! I'm Fable. Let me know how I can assist!",
  },
  { 
    id: "onyx", 
    name: "Onyx", 
    description: "Deep and authoritative", 
    gender: "male",
    accent: "American",
    color: "from-zinc-600 to-zinc-800",
    sampleText: "Hello. I'm Onyx. I'm here to help with your needs.",
  },
];

// Conversation style templates
const conversationStyles = [
  {
    id: "concierge",
    name: "Concierge",
    emoji: "🎩",
    description: "Ultra-polite, luxury service experience",
    traits: ["Formal greetings", "Elegant language", "Attentive service"],
    color: "from-amber-500 to-yellow-600",
  },
  {
    id: "casual",
    name: "Casual",
    emoji: "👋",
    description: "Friendly neighborhood business feel",
    traits: ["Relaxed tone", "Conversational", "Approachable"],
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "corporate",
    name: "Corporate",
    emoji: "🏢",
    description: "Formal enterprise professional style",
    traits: ["Business formal", "Efficient", "Structured"],
    color: "from-slate-500 to-gray-600",
  },
  {
    id: "energetic",
    name: "Energetic",
    emoji: "⚡",
    description: "Upbeat and enthusiastic sales-focused",
    traits: ["High energy", "Enthusiastic", "Motivating"],
    color: "from-orange-500 to-red-500",
  },
  {
    id: "empathetic",
    name: "Empathetic",
    emoji: "💜",
    description: "Caring and understanding support style",
    traits: ["Patient", "Understanding", "Supportive"],
    color: "from-purple-500 to-violet-600",
  },
  {
    id: "technical",
    name: "Technical",
    emoji: "🔧",
    description: "Precise and detail-oriented for tech support",
    traits: ["Detailed", "Accurate", "Solution-focused"],
    color: "from-cyan-500 to-blue-600",
  },
];

// Language options
const languageOptions = [
  { id: "en-US", name: "English (US)", flag: "🇺🇸", accent: "American" },
  { id: "en-GB", name: "English (UK)", flag: "🇬🇧", accent: "British" },
  { id: "en-AU", name: "English (AU)", flag: "🇦🇺", accent: "Australian" },
  { id: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸", accent: "Castilian" },
  { id: "es-MX", name: "Spanish (Mexico)", flag: "🇲🇽", accent: "Latin American" },
  { id: "fr-FR", name: "French", flag: "🇫🇷", accent: "Parisian" },
  { id: "de-DE", name: "German", flag: "🇩🇪", accent: "Standard" },
  { id: "pt-BR", name: "Portuguese (BR)", flag: "🇧🇷", accent: "Brazilian" },
  { id: "it-IT", name: "Italian", flag: "🇮🇹", accent: "Standard" },
  { id: "ja-JP", name: "Japanese", flag: "🇯🇵", accent: "Standard" },
  { id: "zh-CN", name: "Chinese (Mandarin)", flag: "🇨🇳", accent: "Standard" },
  { id: "ko-KR", name: "Korean", flag: "🇰🇷", accent: "Standard" },
];

const capabilityOptions = [
  { id: "answer_faq", name: "Answer FAQs", icon: HelpCircle },
  { id: "take_orders", name: "Take Orders", icon: Zap },
  { id: "book_appointments", name: "Book Appointments", icon: Settings },
  { id: "collect_info", name: "Collect Information", icon: Bot },
  { id: "transfer_calls", name: "Transfer to Human", icon: Phone },
  { id: "track_orders", name: "Track Orders", icon: GitBranch },
];

const workflowTemplates = [
  {
    id: "customer_support",
    name: "Customer Support",
    description: "Handle inquiries, complaints, and general support",
    steps: ["Greet", "Identify Issue", "Check Knowledge Base", "Resolve or Escalate", "Close"],
  },
  {
    id: "sales",
    name: "Sales & Lead Qualification",
    description: "Qualify leads and assist with purchase decisions",
    steps: ["Greet", "Identify Needs", "Present Solutions", "Handle Objections", "Close or Schedule"],
  },
  {
    id: "appointment",
    name: "Appointment Booking",
    description: "Schedule and manage appointments",
    steps: ["Greet", "Check Availability", "Book Slot", "Confirm Details", "Send Reminder"],
  },
  {
    id: "order_status",
    name: "Order Status",
    description: "Track orders and provide shipping updates",
    steps: ["Greet", "Verify Identity", "Look Up Order", "Provide Status", "Offer Help"],
  },
  {
    id: "custom",
    name: "Custom Flow",
    description: "Build your own workflow from scratch",
    steps: ["Start from scratch"],
  },
];

interface QAPair {
  id: string;
  question: string;
  answer: string;
}

interface AgentFormData {
  type: string;
  name: string;
  description: string;
  personality: string;
  capabilities: string[];
  greeting: string;
  workflowTemplate: string;
  qaPairs: QAPair[];
  voice: string;
  voiceSpeed: number;
  voicePitch: number;
  language: string;
  conversationStyle: string;
}

export default function NewAgentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState<"draft" | "launch">("launch");
  const [isGeneratingGreeting, setIsGeneratingGreeting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const [descriptionSuggestion, setDescriptionSuggestion] = useState<string | null>(null);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null);
  const [formData, setFormData] = useState<AgentFormData>({
    type: "",
    name: "",
    description: "",
    personality: "friendly",
    capabilities: [],
    greeting: "",
    workflowTemplate: "",
    qaPairs: [
      { id: "1", question: "", answer: "" },
    ],
    voice: "nova",
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    language: "en-US",
    conversationStyle: "casual",
  });

  const [showAdvancedVoice, setShowAdvancedVoice] = useState(false);
  const [showGreetingSection, setShowGreetingSection] = useState(false);

  const totalSteps = 5;

  const stepTitles = [
    { title: "Agent Type", subtitle: "Choose what kind of agent to create" },
    { title: "Basic Info", subtitle: "Name and describe your agent" },
    { title: "Personality", subtitle: "How should your agent communicate?" },
    { title: "Workflow", subtitle: "Define how your agent handles conversations" },
    { title: "Review", subtitle: "Confirm and launch your agent" },
  ];

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleCapability = (id: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(id)
        ? prev.capabilities.filter(c => c !== id)
        : [...prev.capabilities, id],
    }));
  };

  // Voice sample playback
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVoiceSample = async (voiceId: string, customText?: string) => {
    const voice = voiceOptions.find(v => v.id === voiceId);
    if (!voice) return;

    const textToSpeak = customText || voice.sampleText;
    const playbackId = customText ? "greeting-preview" : voiceId;

    // If already playing this voice, stop it
    if (playingVoice === playbackId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingVoice(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsLoadingAudio(playbackId);
    setPlayingVoice(null);

    try {
      // Call our API to generate TTS audio
      const response = await fetch('/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice: voiceId,
          text: textToSpeak,
          speed: formData.voiceSpeed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate voice preview');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setPlayingVoice(null);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => {
        setPlayingVoice(null);
        setIsLoadingAudio(null);
      };
      
      await audioRef.current.play();
      setPlayingVoice(playbackId);
    } catch (error) {
      console.error('Error playing voice sample:', error);
      // Fallback: use browser's speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = formData.voiceSpeed;
        utterance.onend = () => setPlayingVoice(null);
        speechSynthesis.speak(utterance);
        setPlayingVoice(playbackId);
      }
    } finally {
      setIsLoadingAudio(null);
    }
  };

  const playGreetingPreview = () => {
    if (!formData.greeting) return;
    playVoiceSample(formData.voice, formData.greeting);
  };

  const selectedType = agentTypes.find(t => t.id === formData.type);
  const selectedTemplate = workflowTemplates.find(t => t.id === formData.workflowTemplate);

  // Get greeting templates based on agent type
  const getGreetingTemplates = () => {
    const name = formData.name || "your AI assistant";
    const templates = {
      voice: [
        `Hello! Thank you for calling. My name is ${name}. How can I help you today?`,
        `Hi there! You've reached ${name}. I'm here to assist you. What can I do for you?`,
        `Good day! This is ${name}. How may I be of service?`,
      ],
      chat: [
        `Hi! 👋 I'm ${name}. How can I help you today?`,
        `Hello! Welcome! I'm ${name}, your virtual assistant. What can I assist you with?`,
        `Hey there! I'm ${name}. Feel free to ask me anything!`,
      ],
      whatsapp: [
        `Hi! 👋 Thanks for messaging us. I'm ${name}, your AI assistant. How can I help?`,
        `Hello! Welcome to our WhatsApp support. I'm ${name}. What do you need help with today?`,
        `Hey! I'm ${name}. I'm here to assist you via WhatsApp. What's on your mind?`,
      ],
      email: [
        `Thank you for reaching out! I'm ${name}, your AI assistant, and I'm here to help with your inquiry.`,
        `Hi there! I received your email and I'm ready to assist. I'm ${name}, your AI support agent.`,
        `Hello! Thank you for contacting us. I'm ${name} and I'll do my best to address your question.`,
      ],
      hybrid: [
        `Hello! I'm ${name}, ready to assist you. How can I help today?`,
        `Hi there! I'm ${name}, your AI assistant across all channels. What can I do for you?`,
        `Welcome! I'm ${name}. I'm here to help, no matter how you reach out!`,
      ],
    };
    return templates[formData.type as keyof typeof templates] || templates.hybrid;
  };

  // Generate AI description completion
  const generateDescription = async () => {
    if (isGeneratingDescription) return;
    setIsGeneratingDescription(true);
    setDescriptionSuggestion(null);
    
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptType: "description",
          partialText: formData.description,
          agentType: formData.type,
          agentName: formData.name,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.suggestions?.[0]) {
          setDescriptionSuggestion(result.suggestions[0]);
        }
      }
    } catch (error) {
      console.error("AI description error:", error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Accept AI description suggestion
  const acceptDescriptionSuggestion = () => {
    if (descriptionSuggestion) {
      setFormData(prev => ({ ...prev, description: descriptionSuggestion }));
      setDescriptionSuggestion(null);
    }
  };

  // Generate AI name suggestions
  const generateNameSuggestions = async () => {
    if (isGeneratingName) return;
    setIsGeneratingName(true);
    setNameSuggestions([]);
    
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptType: "name",
          agentType: formData.type,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.suggestions?.length > 0) {
          setNameSuggestions(result.suggestions);
        }
      }
    } catch (error) {
      console.error("AI name suggestion error:", error);
    } finally {
      setIsGeneratingName(false);
    }
  };

  // Generate AI greeting suggestions - picks a random template
  const generateGreetingSuggestions = async () => {
    setIsGeneratingGreeting(true);
    
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "greeting",
          businessName: formData.name,
          businessType: formData.type,
          personality: formData.personality,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.suggestions?.length > 0) {
          // Pick the first AI suggestion
          setFormData(prev => ({ ...prev, greeting: result.suggestions[0] }));
        } else {
          // Fallback to random template
          const templates = getGreetingTemplates();
          const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
          setFormData(prev => ({ ...prev, greeting: randomTemplate }));
        }
      } else {
        const templates = getGreetingTemplates();
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        setFormData(prev => ({ ...prev, greeting: randomTemplate }));
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      const templates = getGreetingTemplates();
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      setFormData(prev => ({ ...prev, greeting: randomTemplate }));
    } finally {
      setIsGeneratingGreeting(false);
    }
  };

  const handleCreateAgent = async (mode: "draft" | "launch") => {
    setSaveMode(mode);
    setIsCreating(true);

    try {
      // Map agent type to API format
      const typeMap: Record<string, 'sales' | 'support' | 'booking' | 'custom'> = {
        'voice': 'sales',
        'chat': 'support',
        'whatsapp': 'sales',
        'email': 'support',
        'hybrid': 'custom',
      };

      const agentData = {
        name: formData.name || 'New Agent',
        type: typeMap[formData.type] || 'custom',
        description: formData.description,
        system_prompt: `Personality: ${formData.personality}. ${formData.description}`,
        greeting_message: formData.greeting,
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 1024,
        channels: formData.type === 'whatsapp' ? ['whatsapp'] : 
                  formData.type === 'voice' ? ['voice'] : 
                  formData.type === 'chat' ? ['web_widget'] : ['web_widget', 'whatsapp'],
      };

      const newAgent = await agentService.createAgent(agentData);
      
      // Update status if launching
      if (mode === 'launch') {
        await agentService.updateStatus(newAgent.id, 'active');
      }

      setCreatedAgentId(newAgent.id);
      setIsCreating(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to create agent:', error);
      setIsCreating(false);
      // Could add error toast here
    }
  };

  const handleGoToAgent = () => {
    router.push(`/dashboard/agents/${createdAgentId}`);
  };

  const handleGoToAgents = () => {
    router.push("/dashboard/agents");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Progress Bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/agents"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold">{stepTitles[step - 1].title}</h1>
                <p className="text-sm text-muted-foreground">{stepTitles[step - 1].subtitle}</p>
              </div>
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
          {/* Step 1: Agent Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">What type of agent do you want to create?</h2>
                <p className="text-muted-foreground">Choose based on your primary communication channel</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {agentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                    className={`p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${
                      formData.type === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                      <type.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{type.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {type.features.map(feature => (
                        <span key={feature} className="text-xs px-2 py-1 bg-muted rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={handleNext}
                  disabled={!formData.type}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                {selectedType && (
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedType.color} flex items-center justify-center mx-auto mb-4`}>
                    <selectedType.icon className="w-8 h-8 text-white" />
                  </div>
                )}
                <h2 className="text-2xl font-bold mb-2">Name your {selectedType?.name}</h2>
                <p className="text-muted-foreground">Give your agent a name and description</p>
              </div>

              <div className="space-y-4 max-w-xl mx-auto">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Agent Name</label>
                    <button
                      type="button"
                      onClick={generateNameSuggestions}
                      disabled={isGeneratingName}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-50"
                    >
                      {isGeneratingName ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Suggesting...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3 h-3" />
                          Suggest Names
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      setNameSuggestions([]);
                    }}
                    placeholder="e.g., Customer Support Agent"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  
                  {/* Name Suggestions */}
                  <AnimatePresence>
                    {nameSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-wrap gap-2 mt-3"
                      >
                        {nameSuggestions.map((name, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, name }));
                              setNameSuggestions([]);
                            }}
                            className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                          >
                            {name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Description</label>
                    <button
                      type="button"
                      onClick={generateDescription}
                      disabled={isGeneratingDescription}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isGeneratingDescription ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3 h-3" />
                          Complete with AI
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }));
                        setDescriptionSuggestion(null);
                      }}
                      placeholder="Start typing and click 'Complete with AI' to auto-generate..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    
                    {/* AI Suggestion Preview */}
                    <AnimatePresence>
                      {descriptionSuggestion && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute inset-x-0 -bottom-2 translate-y-full z-10"
                        >
                          <div className="bg-card border border-primary/30 rounded-xl p-4 shadow-lg">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-1">AI Suggestion</p>
                                <p className="text-sm">{descriptionSuggestion}</p>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-3">
                              <button
                                type="button"
                                onClick={() => setDescriptionSuggestion(null)}
                                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Dismiss
                              </button>
                              <button
                                type="button"
                                onClick={acceptDescriptionSuggestion}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:opacity-90 transition-all"
                              >
                                <Check className="w-3 h-3" />
                                Use This
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Tip: Type a few words and let AI complete your description
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Capabilities</label>
                  <div className="grid grid-cols-2 gap-3">
                    {capabilityOptions.map((cap) => (
                      <button
                        key={cap.id}
                        onClick={() => toggleCapability(cap.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          formData.capabilities.includes(cap.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          formData.capabilities.includes(cap.id)
                            ? "bg-primary text-white"
                            : "bg-muted"
                        }`}>
                          <cap.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{cap.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.name}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Voice & Style */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Voice Agent Setup */}
              {formData.type === "voice" && (
                <>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
                      <Headphones className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-1">Choose your agent&apos;s voice</h2>
                    <p className="text-muted-foreground">Click any voice to hear a preview</p>
                  </div>

                  {/* Voice Selection - Horizontal Scrolling Cards */}
                  <div className="relative">
                    <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory scrollbar-hide">
                      {voiceOptions.map((voice) => (
                        <motion.div
                          key={voice.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, voice: voice.id }));
                            playVoiceSample(voice.id);
                          }}
                          className={`relative flex-shrink-0 w-40 p-4 rounded-2xl border-2 cursor-pointer transition-all snap-center ${
                            formData.voice === voice.id
                              ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20"
                              : "border-border hover:border-primary/50 bg-card"
                          }`}
                        >
                          {formData.voice === voice.id && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                          
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${voice.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                            {isLoadingAudio === voice.id ? (
                              <RefreshCw className="w-6 h-6 text-white animate-spin" />
                            ) : playingVoice === voice.id ? (
                              <Volume2 className="w-6 h-6 text-white animate-pulse" />
                            ) : (
                              <span className="text-white font-bold text-xl">{voice.name[0]}</span>
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-center text-sm">{voice.name}</h4>
                          <p className="text-xs text-muted-foreground text-center mt-1">{voice.description}</p>
                          
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              voice.gender === 'female' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                                : voice.gender === 'male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {voice.gender}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Conversation Style - Quick Pick */}
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Conversation Style
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {conversationStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setFormData(prev => ({ ...prev, conversationStyle: style.id }))}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            formData.conversationStyle === style.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-2xl block">{style.emoji}</span>
                          <p className="text-xs font-medium mt-1">{style.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fine-tune Settings - Collapsible */}
                  <div className="max-w-2xl mx-auto">
                    <button
                      onClick={() => setShowAdvancedVoice(!showAdvancedVoice)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Sliders className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Fine-tune voice settings</span>
                      </div>
                      <motion.div
                        animate={{ rotate: showAdvancedVoice ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="w-4 h-4 rotate-90" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {showAdvancedVoice && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-6 border border-t-0 border-border rounded-b-xl">
                            {/* Speed Slider */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium">Speaking Speed</label>
                                <span className="text-sm text-muted-foreground">{formData.voiceSpeed.toFixed(1)}x</span>
                              </div>
                              <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={formData.voiceSpeed}
                                onChange={(e) => setFormData(prev => ({ ...prev, voiceSpeed: parseFloat(e.target.value) }))}
                                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>Slower</span>
                                <span>Normal</span>
                                <span>Faster</span>
                              </div>
                            </div>

                            {/* Language Selection */}
                            <div>
                              <label className="text-sm font-medium block mb-2">Language</label>
                              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                {languageOptions.slice(0, 8).map((lang) => (
                                  <button
                                    key={lang.id}
                                    onClick={() => setFormData(prev => ({ ...prev, language: lang.id }))}
                                    className={`p-2 rounded-lg border text-sm transition-all ${
                                      formData.language === lang.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                  >
                                    <span className="mr-1">{lang.flag}</span>
                                    <span className="text-xs">{lang.name.split(' ')[0]}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quick Greeting with Live Preview */}
                  <div className="max-w-2xl mx-auto">
                    <button
                      onClick={() => setShowGreetingSection(!showGreetingSection)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Customize greeting</span>
                        <span className="text-xs text-muted-foreground">(optional)</span>
                      </div>
                      <motion.div
                        animate={{ rotate: showGreetingSection ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="w-4 h-4 rotate-90" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {showGreetingSection && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 border border-t-0 border-border rounded-b-xl space-y-4">
                            {/* Quick templates */}
                            <div className="flex gap-2 flex-wrap">
                              {getGreetingTemplates().slice(0, 3).map((template, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setFormData(prev => ({ ...prev, greeting: template }))}
                                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                                    formData.greeting === template
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  Template {idx + 1}
                                </button>
                              ))}
                              <button
                                onClick={generateGreetingSuggestions}
                                disabled={isGeneratingGreeting}
                                className="px-3 py-1.5 text-xs rounded-full border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all flex items-center gap-1"
                              >
                                <Wand2 className="w-3 h-3" />
                                AI Generate
                              </button>
                            </div>

                            <textarea
                              value={formData.greeting}
                              onChange={(e) => setFormData(prev => ({ ...prev, greeting: e.target.value }))}
                              placeholder={`Hello! Thank you for calling. I'm ${formData.name || 'your AI assistant'}...`}
                              rows={2}
                              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                            />

                            {/* Live Preview Button */}
                            {formData.greeting && (
                              <button
                                onClick={playGreetingPreview}
                                disabled={isLoadingAudio === "greeting-preview"}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:opacity-90 transition-all"
                              >
                                {isLoadingAudio === "greeting-preview" ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Generating...
                                  </>
                                ) : playingVoice === "greeting-preview" ? (
                                  <>
                                    <Pause className="w-4 h-4" />
                                    Stop Preview
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4" />
                                    🎧 Hear Your Greeting
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* Non-voice agents: Simple personality picker */}
              {formData.type !== "voice" && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Choose a personality</h2>
                    <p className="text-muted-foreground">How should your agent communicate?</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {personalityOptions.map((personality) => (
                      <button
                        key={personality.id}
                        onClick={() => setFormData(prev => ({ ...prev, personality: personality.id }))}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          formData.personality === personality.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-3xl block mb-2">{personality.emoji}</span>
                        <p className="font-medium text-sm">{personality.name}</p>
                        <p className="text-xs text-muted-foreground">{personality.description}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleNext}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-all"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Workflow */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Choose a workflow template</h2>
                <p className="text-muted-foreground">Start with a template or build from scratch</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {workflowTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setFormData(prev => ({ ...prev, workflowTemplate: template.id }))}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      formData.workflowTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {template.steps.map((s, idx) => (
                        <div key={idx} className="flex items-center">
                          <span className="text-xs px-2 py-1 bg-muted rounded">{s}</span>
                          {idx < template.steps.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-muted-foreground mx-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {selectedTemplate && selectedTemplate.id !== "custom" && (
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h4 className="font-medium mb-3">Workflow Preview: {selectedTemplate.name}</h4>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {selectedTemplate.steps.map((s, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{idx + 1}</span>
                          </div>
                          <span className="text-xs mt-1 whitespace-nowrap">{s}</span>
                        </div>
                        {idx < selectedTemplate.steps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleNext}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-all"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Review your agent</h2>
                <p className="text-muted-foreground">Make sure everything looks good before launching</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                {/* Summary Card */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className={`p-4 bg-gradient-to-br ${selectedType?.color || "from-violet-500 to-purple-600"}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                        {selectedType && <selectedType.icon className="w-7 h-7 text-white" />}
                      </div>
                      <div className="text-white">
                        <h3 className="font-bold text-lg">{formData.name || "Unnamed Agent"}</h3>
                        <p className="text-white/80 text-sm">{selectedType?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Description</label>
                      <p className="font-medium">{formData.description || "No description provided"}</p>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">Greeting</label>
                      <p className="font-medium">&ldquo;{formData.greeting || "No greeting set"}&rdquo;</p>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">Personality</label>
                      <p className="font-medium capitalize">{formData.personality}</p>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">Capabilities</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.capabilities.map(cap => {
                          const capability = capabilityOptions.find(c => c.id === cap);
                          return (
                            <span key={cap} className="text-xs px-2 py-1 bg-muted rounded-full">
                              {capability?.name}
                            </span>
                          );
                        })}
                        {formData.capabilities.length === 0 && (
                          <span className="text-sm text-muted-foreground">None selected</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">Workflow Template</label>
                      <p className="font-medium">{selectedTemplate?.name}</p>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">Q&A Pairs</label>
                      <p className="font-medium">{formData.qaPairs.filter(q => q.question && q.answer).length} pairs configured</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <button
                    onClick={() => handleCreateAgent("draft")}
                    disabled={isCreating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-background transition-colors disabled:opacity-50"
                  >
                    {isCreating && saveMode === "draft" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4" />
                    )}
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handleCreateAgent("launch")}
                    disabled={isCreating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isCreating && saveMode === "launch" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Rocket className="w-4 h-4" />
                    )}
                    Launch Agent
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={handleBack}
                  disabled={isCreating}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    saveMode === "launch"
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  }`}
                >
                  {saveMode === "launch" ? (
                    <Rocket className="w-10 h-10 text-white" />
                  ) : (
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  )}
                </motion.div>

                <h2 className="text-2xl font-bold mb-2">
                  {saveMode === "launch" ? "Agent Launched!" : "Draft Saved!"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {saveMode === "launch"
                    ? `Your agent "${formData.name}" is now live and ready to handle conversations.`
                    : `Your agent "${formData.name}" has been saved as a draft. You can continue editing and launch it later.`}
                </p>

                {saveMode === "launch" && (
                  <div className="p-4 bg-muted/50 rounded-xl mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="flex items-center gap-2 text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleGoToAgents}
                    className="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
                  >
                    All Agents
                  </button>
                  <button
                    onClick={handleGoToAgent}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Agent
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
