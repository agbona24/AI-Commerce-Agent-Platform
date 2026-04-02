"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Search,
  Filter,
  Volume2,
  Sparkles,
  User,
  Heart,
  ChevronDown,
  Loader2,
  Wand2,
  Info,
  Plus,
  X,
  Mic,
  Upload,
  Copy,
  AudioWaveform,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Voice providers with their voices
const voiceProviders = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Natural, conversational voices powered by GPT",
    logo: "🤖",
    color: "from-emerald-500 to-teal-600",
    badge: "Recommended",
    voices: [
      { id: "alloy", name: "Alloy", gender: "neutral", description: "Neutral and balanced, versatile for any use case", accent: "American", style: "Natural", tags: ["versatile", "professional"] },
      { id: "echo", name: "Echo", gender: "male", description: "Friendly and approachable male voice", accent: "American", style: "Conversational", tags: ["friendly", "warm"] },
      { id: "fable", name: "Fable", gender: "male", description: "Expressive British voice with character", accent: "British", style: "Expressive", tags: ["storytelling", "engaging"] },
      { id: "onyx", name: "Onyx", gender: "male", description: "Deep and authoritative male voice", accent: "American", style: "Authoritative", tags: ["professional", "deep"] },
      { id: "nova", name: "Nova", gender: "female", description: "Warm and engaging female voice", accent: "American", style: "Warm", tags: ["friendly", "engaging"] },
      { id: "shimmer", name: "Shimmer", gender: "female", description: "Clear and professional female voice", accent: "American", style: "Professional", tags: ["clear", "professional"] },
    ],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Ultra-realistic AI voices with emotion control",
    logo: "🎭",
    color: "from-violet-500 to-purple-600",
    badge: "Premium",
    voices: [
      { id: "rachel", name: "Rachel", gender: "female", description: "American female, calm and professional", accent: "American", style: "Professional", tags: ["calm", "business"] },
      { id: "drew", name: "Drew", gender: "male", description: "American male, friendly and articulate", accent: "American", style: "Friendly", tags: ["articulate", "clear"] },
      { id: "clyde", name: "Clyde", gender: "male", description: "American male, friendly and casual", accent: "American", style: "Casual", tags: ["casual", "relatable"] },
      { id: "paul", name: "Paul", gender: "male", description: "American male, warm and conversational", accent: "American", style: "Warm", tags: ["conversational", "warm"] },
      { id: "domi", name: "Domi", gender: "female", description: "American female, strong and confident", accent: "American", style: "Confident", tags: ["strong", "empowering"] },
      { id: "bella", name: "Bella", gender: "female", description: "American female, soft and gentle", accent: "American", style: "Gentle", tags: ["soft", "soothing"] },
      { id: "antoni", name: "Antoni", gender: "male", description: "American male, well-rounded and calm", accent: "American", style: "Calm", tags: ["balanced", "professional"] },
      { id: "elli", name: "Elli", gender: "female", description: "American female, young and cheerful", accent: "American", style: "Cheerful", tags: ["young", "energetic"] },
      { id: "josh", name: "Josh", gender: "male", description: "American male, young and dynamic", accent: "American", style: "Dynamic", tags: ["young", "engaging"] },
      { id: "arnold", name: "Arnold", gender: "male", description: "American male, crisp and formal", accent: "American", style: "Formal", tags: ["crisp", "professional"] },
      { id: "charlotte", name: "Charlotte", gender: "female", description: "British female, warm and sophisticated", accent: "British", style: "Sophisticated", tags: ["elegant", "warm"] },
      { id: "matilda", name: "Matilda", gender: "female", description: "American female, warm and conversational", accent: "American", style: "Conversational", tags: ["warm", "friendly"] },
    ],
  },
  {
    id: "amazon",
    name: "Amazon Polly",
    description: "AWS-powered neural text-to-speech",
    logo: "☁️",
    color: "from-orange-500 to-amber-600",
    voices: [
      { id: "Joanna", name: "Joanna", gender: "female", description: "US English female, standard voice", accent: "American", style: "Standard", tags: ["clear", "professional"] },
      { id: "Joanna-Neural", name: "Joanna Neural", gender: "female", description: "US English female, neural voice", accent: "American", style: "Neural", tags: ["natural", "premium"], neural: true },
      { id: "Matthew", name: "Matthew", gender: "male", description: "US English male, standard voice", accent: "American", style: "Standard", tags: ["professional", "clear"] },
      { id: "Matthew-Neural", name: "Matthew Neural", gender: "male", description: "US English male, neural voice", accent: "American", style: "Neural", tags: ["natural", "premium"], neural: true },
      { id: "Amy", name: "Amy", gender: "female", description: "British English female voice", accent: "British", style: "Professional", tags: ["british", "clear"] },
      { id: "Brian", name: "Brian", gender: "male", description: "British English male voice", accent: "British", style: "Professional", tags: ["british", "authoritative"] },
      { id: "Salli", name: "Salli", gender: "female", description: "US English female, warm voice", accent: "American", style: "Warm", tags: ["friendly", "warm"] },
      { id: "Joey", name: "Joey", gender: "male", description: "US English male, young voice", accent: "American", style: "Young", tags: ["casual", "friendly"] },
      { id: "Kendra", name: "Kendra", gender: "female", description: "US English female, professional", accent: "American", style: "Professional", tags: ["business", "clear"] },
      { id: "Kimberly", name: "Kimberly", gender: "female", description: "US English female, expressive", accent: "American", style: "Expressive", tags: ["engaging", "dynamic"] },
      { id: "Ivy", name: "Ivy", gender: "female", description: "US English female, young voice", accent: "American", style: "Young", tags: ["youthful", "bright"] },
      { id: "Justin", name: "Justin", gender: "male", description: "US English male, child voice", accent: "American", style: "Child", tags: ["young", "friendly"] },
    ],
  },
  {
    id: "google",
    name: "Google Cloud TTS",
    description: "Google's WaveNet and Neural2 voices",
    logo: "🔊",
    color: "from-blue-500 to-cyan-600",
    voices: [
      { id: "en-US-Neural2-A", name: "Neural2-A", gender: "male", description: "US English male, neural voice", accent: "American", style: "Neural", tags: ["natural", "clear"], neural: true },
      { id: "en-US-Neural2-C", name: "Neural2-C", gender: "female", description: "US English female, neural voice", accent: "American", style: "Neural", tags: ["natural", "professional"], neural: true },
      { id: "en-US-Neural2-D", name: "Neural2-D", gender: "male", description: "US English male, deeper voice", accent: "American", style: "Deep", tags: ["authoritative", "formal"], neural: true },
      { id: "en-US-Neural2-E", name: "Neural2-E", gender: "female", description: "US English female, friendly voice", accent: "American", style: "Friendly", tags: ["warm", "approachable"], neural: true },
      { id: "en-US-Neural2-F", name: "Neural2-F", gender: "female", description: "US English female, professional", accent: "American", style: "Professional", tags: ["clear", "business"], neural: true },
      { id: "en-GB-Neural2-A", name: "GB Neural2-A", gender: "female", description: "British English female", accent: "British", style: "Professional", tags: ["british", "elegant"], neural: true },
      { id: "en-GB-Neural2-B", name: "GB Neural2-B", gender: "male", description: "British English male", accent: "British", style: "Professional", tags: ["british", "authoritative"], neural: true },
      { id: "en-AU-Neural2-A", name: "AU Neural2-A", gender: "female", description: "Australian English female", accent: "Australian", style: "Friendly", tags: ["australian", "warm"], neural: true },
      { id: "en-AU-Neural2-B", name: "AU Neural2-B", gender: "male", description: "Australian English male", accent: "Australian", style: "Casual", tags: ["australian", "relaxed"], neural: true },
    ],
  },
  {
    id: "azure",
    name: "Azure Neural TTS",
    description: "Microsoft's neural text-to-speech",
    logo: "🔷",
    color: "from-sky-500 to-blue-600",
    voices: [
      { id: "en-US-JennyNeural", name: "Jenny", gender: "female", description: "US English female, versatile", accent: "American", style: "Versatile", tags: ["natural", "expressive"], neural: true },
      { id: "en-US-GuyNeural", name: "Guy", gender: "male", description: "US English male, newscast style", accent: "American", style: "Newscast", tags: ["professional", "clear"], neural: true },
      { id: "en-US-AriaNeural", name: "Aria", gender: "female", description: "US English female, chat style", accent: "American", style: "Chat", tags: ["friendly", "conversational"], neural: true },
      { id: "en-US-DavisNeural", name: "Davis", gender: "male", description: "US English male, casual", accent: "American", style: "Casual", tags: ["relaxed", "friendly"], neural: true },
      { id: "en-US-SaraNeural", name: "Sara", gender: "female", description: "US English female, warm", accent: "American", style: "Warm", tags: ["kind", "supportive"], neural: true },
      { id: "en-GB-SoniaNeural", name: "Sonia", gender: "female", description: "British English female", accent: "British", style: "Professional", tags: ["british", "sophisticated"], neural: true },
      { id: "en-GB-RyanNeural", name: "Ryan", gender: "male", description: "British English male", accent: "British", style: "Professional", tags: ["british", "authoritative"], neural: true },
    ],
  },
];

// Get all voices flattened
const getAllVoices = () => {
  const all: Array<{
    id: string;
    name: string;
    gender: string;
    description: string;
    accent: string;
    style: string;
    tags: string[];
    neural?: boolean;
    provider: typeof voiceProviders[0];
  }> = [];
  
  voiceProviders.forEach(provider => {
    provider.voices.forEach(voice => {
      all.push({ ...voice, provider });
    });
  });
  
  return all;
};

// Sample texts for preview
const sampleTexts = [
  "Hello! I'm your AI assistant. How can I help you today?",
  "Thank you for calling. I'll be happy to assist you with your inquiry.",
  "Welcome! Let me help you find exactly what you're looking for.",
  "Great choice! I can help you complete your order right away.",
  "I understand your concern. Let me look into that for you.",
];

// Voice creation mode type
type VoiceCreationMode = "design" | "clone" | null;

export default function VoiceLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedAccent, setSelectedAccent] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [showCustomText, setShowCustomText] = useState(false);
  const [selectedSampleText, setSelectedSampleText] = useState(sampleTexts[0]);
  
  // Voice creation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creationMode, setCreationMode] = useState<VoiceCreationMode>(null);
  const [voiceDesignPrompt, setVoiceDesignPrompt] = useState("");
  const [voiceDesignName, setVoiceDesignName] = useState("");
  const [cloneVoiceName, setCloneVoiceName] = useState("");
  const [cloneVoiceFile, setCloneVoiceFile] = useState<File | null>(null);
  const [cloneVoiceDescription, setCloneVoiceDescription] = useState("");
  const [isCreatingVoice, setIsCreatingVoice] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get unique accents
  const accents = Array.from(new Set(getAllVoices().map(v => v.accent)));

  // Filter voices
  const filteredVoices = getAllVoices().filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProvider = selectedProvider === "all" || voice.provider.id === selectedProvider;
    const matchesGender = selectedGender === "all" || voice.gender === selectedGender;
    const matchesAccent = selectedAccent === "all" || voice.accent === selectedAccent;
    
    return matchesSearch && matchesProvider && matchesGender && matchesAccent;
  });

  const playVoice = async (voiceId: string, providerId: string) => {
    const fullId = `${providerId}:${voiceId}`;
    
    // If already playing, stop
    if (playingVoice === fullId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      setPlayingVoice(null);
      return;
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    setLoadingVoice(fullId);
    setPlayingVoice(null);

    const textToSpeak = customText || selectedSampleText;

    try {
      // Call API to generate TTS
      const response = await fetch('/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice: voiceId,
          provider: providerId,
          text: textToSpeak,
        }),
      });

      // 204 means use browser fallback
      if (response.status === 204) {
        throw new Error('Use browser fallback');
      }

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
        setLoadingVoice(null);
      };
      
      await audioRef.current.play();
      setPlayingVoice(fullId);
      setLoadingVoice(null);
    } catch (error) {
      console.error('Error playing voice:', error);
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.onend = () => setPlayingVoice(null);
        utterance.onerror = () => {
          setPlayingVoice(null);
          setLoadingVoice(null);
        };
        speechSynthesis.speak(utterance);
        setPlayingVoice(fullId);
      }
      setLoadingVoice(null);
    }
  };

  const toggleFavorite = (voiceId: string) => {
    setFavorites(prev => 
      prev.includes(voiceId) 
        ? prev.filter(id => id !== voiceId)
        : [...prev, voiceId]
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setCreationError("File size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith("audio/")) {
        setCreationError("Please upload an audio file");
        return;
      }
      setCloneVoiceFile(file);
      setRecordedAudio(null);
      setCreationError(null);
    }
  };

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedAudio(blob);
        setCloneVoiceFile(null);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setCreationError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle voice creation
  const handleCreateVoice = async () => {
    setIsCreatingVoice(true);
    setCreationError(null);

    try {
      if (creationMode === "design") {
        // Voice design API call
        const response = await fetch("/api/voices/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: voiceDesignName,
            prompt: voiceDesignPrompt,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create voice");
        }
      } else if (creationMode === "clone") {
        // Voice clone API call
        const formData = new FormData();
        formData.append("name", cloneVoiceName);
        formData.append("description", cloneVoiceDescription);
        
        if (cloneVoiceFile) {
          formData.append("audio", cloneVoiceFile);
        } else if (recordedAudio) {
          formData.append("audio", recordedAudio, "recording.webm");
        }

        const response = await fetch("/api/voices/clone", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to clone voice");
        }
      }

      setCreationSuccess(true);
      setTimeout(() => {
        resetCreationModal();
      }, 2000);
    } catch (error) {
      console.error("Voice creation error:", error);
      setCreationError("Failed to create voice. Please try again.");
    } finally {
      setIsCreatingVoice(false);
    }
  };

  const resetCreationModal = () => {
    setShowCreateModal(false);
    setCreationMode(null);
    setVoiceDesignPrompt("");
    setVoiceDesignName("");
    setCloneVoiceName("");
    setCloneVoiceFile(null);
    setCloneVoiceDescription("");
    setCreationStep(1);
    setCreationSuccess(false);
    setCreationError(null);
    setRecordedAudio(null);
    setRecordingDuration(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            Voice Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and preview {getAllVoices().length}+ AI voices from top providers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCustomText(!showCustomText)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              showCustomText ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
            }`}
          >
            <Wand2 className="w-4 h-4" />
            Custom Text
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
          >
            <Plus className="w-4 h-4" />
            Create Voice
          </button>
        </div>
      </div>

      {/* Voice Creation Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !isCreatingVoice && resetCreationModal()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold">
                    {!creationMode && "Create a New Voice"}
                    {creationMode === "design" && "Voice Design"}
                    {creationMode === "clone" && "Clone Your Voice"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {!creationMode && "Choose how you want to create your custom voice"}
                    {creationMode === "design" && "Design a voice from a text description"}
                    {creationMode === "clone" && "Create a digital clone of your voice"}
                  </p>
                </div>
                <button
                  onClick={() => !isCreatingVoice && resetCreationModal()}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Success State */}
                {creationSuccess && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Voice Created Successfully!</h3>
                    <p className="text-muted-foreground">Your new voice is now available in the library.</p>
                  </motion.div>
                )}

                {/* Error State */}
                {creationError && (
                  <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{creationError}</p>
                  </div>
                )}

                {/* Mode Selection */}
                {!creationMode && !creationSuccess && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Voice Design Option */}
                    <button
                      onClick={() => setCreationMode("design")}
                      className="p-6 rounded-xl border-2 border-border hover:border-violet-500 bg-gradient-to-br from-violet-500/5 to-purple-500/5 hover:from-violet-500/10 hover:to-purple-500/10 transition-all text-left group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Wand2 className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Voice Design</h3>
                      <p className="text-sm text-muted-foreground">
                        Design an entirely new voice from a text prompt. Describe the voice characteristics you want.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-full bg-violet-500/10 text-violet-600 text-xs">AI Generated</span>
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">Text to Voice</span>
                      </div>
                    </button>

                    {/* Voice Clone Option */}
                    <button
                      onClick={() => setCreationMode("clone")}
                      className="p-6 rounded-xl border-2 border-border hover:border-emerald-500 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 hover:from-emerald-500/10 hover:to-teal-500/10 transition-all text-left group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Copy className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Clone Your Voice</h3>
                      <p className="text-sm text-muted-foreground">
                        Create a realistic digital clone of your voice. Upload an audio sample or record directly.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs">Voice Clone</span>
                        <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">Audio Upload</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Voice Design Form */}
                {creationMode === "design" && !creationSuccess && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">Voice Name</label>
                      <input
                        type="text"
                        value={voiceDesignName}
                        onChange={(e) => setVoiceDesignName(e.target.value)}
                        placeholder="e.g., Professional Sarah"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Voice Description Prompt</label>
                      <textarea
                        value={voiceDesignPrompt}
                        onChange={(e) => setVoiceDesignPrompt(e.target.value)}
                        placeholder="Describe the voice you want to create...&#10;&#10;Example: A warm, friendly female voice with a slight British accent. The voice should sound professional yet approachable, perfect for customer service. Medium pitch, moderate pace, clear articulation."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none h-36"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Tip: Include details about gender, accent, tone, pace, and personality traits.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-500" />
                        Prompt Ideas
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Warm and professional",
                          "Young and energetic",
                          "Calm and soothing",
                          "Authoritative",
                          "British accent",
                          "Friendly assistant",
                        ].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setVoiceDesignPrompt((prev) => prev ? `${prev}, ${tag.toLowerCase()}` : tag)}
                            className="px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 text-xs hover:bg-violet-500/20 transition-colors"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Voice Clone Form */}
                {creationMode === "clone" && !creationSuccess && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">Voice Name</label>
                      <input
                        type="text"
                        value={cloneVoiceName}
                        onChange={(e) => setCloneVoiceName(e.target.value)}
                        placeholder="e.g., My Voice Clone"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Voice Sample</label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Upload an audio file or record your voice. For best results, provide 30 seconds to 3 minutes of clear speech.
                      </p>

                      {/* Upload/Record Tabs */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Upload Option */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                            cloneVoiceFile
                              ? "border-emerald-500 bg-emerald-500/5"
                              : "border-border hover:border-emerald-500/50 hover:bg-muted/50"
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <div className="text-center">
                            <Upload className={`w-8 h-8 mx-auto mb-2 ${cloneVoiceFile ? "text-emerald-500" : "text-muted-foreground"}`} />
                            {cloneVoiceFile ? (
                              <>
                                <p className="text-sm font-medium text-emerald-600">{cloneVoiceFile.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {(cloneVoiceFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium">Upload Audio</p>
                                <p className="text-xs text-muted-foreground">MP3, WAV, M4A (max 10MB)</p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Record Option */}
                        <div
                          className={`p-4 rounded-xl border-2 border-dashed transition-all ${
                            recordedAudio || isRecording
                              ? "border-emerald-500 bg-emerald-500/5"
                              : "border-border hover:border-emerald-500/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="text-center">
                            {isRecording ? (
                              <>
                                <div className="relative">
                                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-red-500 animate-pulse" />
                                  <AudioWaveform className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                                </div>
                                <p className="text-sm font-medium text-red-500">Recording...</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatDuration(recordingDuration)}</p>
                                <button
                                  onClick={stopRecording}
                                  className="mt-2 px-4 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600"
                                >
                                  Stop Recording
                                </button>
                              </>
                            ) : recordedAudio ? (
                              <>
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                                <p className="text-sm font-medium text-emerald-600">Recording saved</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatDuration(recordingDuration)}</p>
                                <button
                                  onClick={startRecording}
                                  className="mt-2 px-4 py-1.5 rounded-lg bg-muted text-xs font-medium hover:bg-muted/80"
                                >
                                  Re-record
                                </button>
                              </>
                            ) : (
                              <button onClick={startRecording} className="w-full">
                                <Mic className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm font-medium">Record Voice</p>
                                <p className="text-xs text-muted-foreground">Click to start recording</p>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                      <textarea
                        value={cloneVoiceDescription}
                        onChange={(e) => setCloneVoiceDescription(e.target.value)}
                        placeholder="Add any notes about this voice clone..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-20"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-amber-600">
                        <Info className="w-4 h-4" />
                        Recording Tips
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Speak clearly and naturally in a quiet environment</li>
                        <li>• Avoid background noise and echo</li>
                        <li>• Include varied sentences with different emotions</li>
                        <li>• Longer samples (1-3 minutes) produce better results</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {!creationSuccess && (
                <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
                  <button
                    onClick={() => creationMode ? setCreationMode(null) : resetCreationModal()}
                    disabled={isCreatingVoice}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {creationMode ? "Back" : "Cancel"}
                  </button>

                  {creationMode && (
                    <button
                      onClick={handleCreateVoice}
                      disabled={
                        isCreatingVoice ||
                        (creationMode === "design" && (!voiceDesignName || !voiceDesignPrompt)) ||
                        (creationMode === "clone" && (!cloneVoiceName || (!cloneVoiceFile && !recordedAudio)))
                      }
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingVoice ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Create Voice
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Text Input */}
      <AnimatePresence>
        {showCustomText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-card border border-border rounded-xl space-y-3">
              <label className="text-sm font-medium">Preview with custom text</label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type your custom message to preview with any voice..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
              />
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Or try:</span>
                {sampleTexts.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedSampleText(text);
                      setCustomText("");
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                      selectedSampleText === text && !customText
                        ? "bg-primary text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    Sample {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search voices by name, style, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all ${
            showFilters ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Filter Pills */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-card border border-border rounded-xl space-y-4">
              {/* Provider Filter */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Provider</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedProvider("all")}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      selectedProvider === "all"
                        ? "bg-primary text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    All Providers
                  </button>
                  {voiceProviders.map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                        selectedProvider === provider.id
                          ? "bg-primary text-white"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <span>{provider.logo}</span>
                      {provider.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Gender</label>
                <div className="flex flex-wrap gap-2">
                  {["all", "female", "male", "neutral"].map(gender => (
                    <button
                      key={gender}
                      onClick={() => setSelectedGender(gender)}
                      className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                        selectedGender === gender
                          ? "bg-primary text-white"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {gender === "all" ? "All Genders" : gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Filter */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Accent</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedAccent("all")}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      selectedAccent === "all"
                        ? "bg-primary text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    All Accents
                  </button>
                  {accents.map(accent => (
                    <button
                      key={accent}
                      onClick={() => setSelectedAccent(accent)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        selectedAccent === accent
                          ? "bg-primary text-white"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {accent}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Provider Sections */}
      <div className="space-y-8">
        {voiceProviders
          .filter(p => selectedProvider === "all" || p.id === selectedProvider)
          .map(provider => {
            const providerVoices = filteredVoices.filter(v => v.provider.id === provider.id);
            if (providerVoices.length === 0) return null;

            return (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Provider Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center text-2xl`}>
                    {provider.logo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{provider.name}</h2>
                      {provider.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {provider.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {providerVoices.length} voice{providerVoices.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Voice Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {providerVoices.map((voice, index) => {
                    const fullId = `${voice.provider.id}:${voice.id}`;
                    const isPlaying = playingVoice === fullId;
                    const isLoading = loadingVoice === fullId;
                    const isFavorite = favorites.includes(fullId);

                    return (
                      <motion.div
                        key={fullId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`p-4 bg-card border rounded-xl transition-all hover:border-primary/50 ${
                          isPlaying ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
                              {voice.gender === "female" ? (
                                <User className="w-5 h-5 text-white" />
                              ) : voice.gender === "male" ? (
                                <User className="w-5 h-5 text-white" />
                              ) : (
                                <Sparkles className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {voice.name}
                                {voice.neural && (
                                  <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 text-[10px] font-medium">
                                    Neural
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {voice.gender === "neutral" ? "Neutral" : voice.gender === "female" ? "Female" : "Male"} • {voice.accent}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleFavorite(fullId)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isFavorite ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                          </button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {voice.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {voice.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => playVoice(voice.id, voice.provider.id)}
                          disabled={isLoading}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                            isPlaying
                              ? "bg-primary text-white"
                              : "bg-muted hover:bg-primary hover:text-white"
                          }`}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading...
                            </>
                          ) : isPlaying ? (
                            <>
                              <Pause className="w-4 h-4" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Preview
                            </>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* No Results */}
      {filteredVoices.length === 0 && (
        <div className="text-center py-12">
          <Volume2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No voices found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search query
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedProvider("all");
              setSelectedGender("all");
              setSelectedAccent("all");
            }}
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Info Card */}
      <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-200 dark:border-violet-800 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-violet-800 dark:text-violet-300 mb-1">
              About Voice Providers
            </p>
            <p className="text-violet-700 dark:text-violet-400">
              Each provider offers unique voice characteristics. OpenAI voices are recommended for most use cases.
              ElevenLabs provides ultra-realistic voices with emotion control. Amazon Polly and Google Cloud offer reliable,
              scalable solutions. Configure your preferred provider in{" "}
              <a href="/dashboard/integrations" className="underline hover:no-underline">
                Integrations
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
