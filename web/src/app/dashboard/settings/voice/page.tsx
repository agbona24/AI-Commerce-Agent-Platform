"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mic,
  Volume2,
  Settings,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Voicemail,
  PhoneForwarded,
  Headphones,
} from "lucide-react";

const mockVoiceConfig = {
  connected: true,
  phoneNumber: "+1 (555) 123-4567",
  provider: "Twilio",
  voiceEngine: "ElevenLabs",
  status: "active",
  monthlyMinutes: 2500,
  usedMinutes: 847,
  callsToday: 23,
};

const voiceOptions = [
  { id: "rachel", name: "Rachel", accent: "American", gender: "Female", preview: true },
  { id: "adam", name: "Adam", accent: "American", gender: "Male", preview: true },
  { id: "emily", name: "Emily", accent: "British", gender: "Female", preview: true },
  { id: "james", name: "James", accent: "British", gender: "Male", preview: true },
  { id: "sofia", name: "Sofia", accent: "Spanish", gender: "Female", preview: true },
];

const callRoutes = [
  { id: "1", name: "Main Support", pattern: "*", destination: "AI Agent", priority: 1 },
  { id: "2", name: "Sales Inquiries", pattern: "1", destination: "Sales Team", priority: 2 },
  { id: "3", name: "Technical Support", pattern: "2", destination: "Tech Agent", priority: 3 },
];

export default function VoiceSettingsPage() {
  const [config] = useState(mockVoiceConfig);
  const [selectedVoice, setSelectedVoice] = useState("rachel");
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "voice" | "routing" | "voicemail">("general");

  const usagePercent = (config.usedMinutes / config.monthlyMinutes) * 100;

  const playPreview = (voiceId: string) => {
    if (isPlaying === voiceId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(voiceId);
      setTimeout(() => setIsPlaying(null), 3000);
    }
  };

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
          <h1 className="text-2xl font-bold">Voice AI Settings</h1>
          <p className="text-muted-foreground">Configure phone and voice AI settings</p>
        </div>
        {config.connected && (
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Active
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {[
          { id: "general", label: "General", icon: Settings },
          { id: "voice", label: "Voice", icon: Mic },
          { id: "routing", label: "Call Routing", icon: PhoneForwarded },
          { id: "voicemail", label: "Voicemail", icon: Voicemail },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
        {/* General Tab */}
        {activeTab === "general" && (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Phone Number Card */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{config.phoneNumber}</h3>
                  <p className="text-muted-foreground text-sm">{config.provider} • {config.voiceEngine}</p>
                  <div className="flex gap-2 mt-3">
                    <Link
                      href="/dashboard/phone-numbers"
                      className="text-sm text-primary hover:underline"
                    >
                      Manage phone numbers
                    </Link>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{config.callsToday}</p>
                  <p className="text-xs text-muted-foreground">calls today</p>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Monthly Usage
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Voice Minutes</span>
                    <span className="text-sm font-medium">
                      {config.usedMinutes.toLocaleString()} / {config.monthlyMinutes.toLocaleString()} min
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePercent}%` }}
                      className={`h-full rounded-full ${
                        usagePercent > 90 ? "bg-red-500" : usagePercent > 70 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(config.monthlyMinutes - config.usedMinutes).toLocaleString()} minutes remaining this month
                </p>
              </div>
            </div>

            {/* Call Settings */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Call Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-sm">Call recording</p>
                    <p className="text-xs text-muted-foreground">Record all calls for quality assurance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-sm">Call transcription</p>
                    <p className="text-xs text-muted-foreground">Automatically transcribe all calls</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">AI interruption handling</p>
                    <p className="text-xs text-muted-foreground">Allow callers to interrupt AI responses</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Voice Tab */}
        {activeTab === "voice" && (
          <motion.div
            key="voice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" />
                AI Voice Selection
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the voice your AI agent will use for phone calls
              </p>

              <div className="space-y-3">
                {voiceOptions.map((voice) => (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedVoice === voice.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedVoice === voice.id
                        ? "bg-primary text-white"
                        : "bg-muted"
                    }`}>
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{voice.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {voice.accent} • {voice.gender}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPreview(voice.id);
                      }}
                      className="p-3 rounded-xl bg-muted hover:bg-primary hover:text-white transition-colors"
                    >
                      {isPlaying === voice.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    {selectedVoice === voice.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Settings */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                Voice Settings
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Speaking Speed</label>
                    <span className="text-sm text-muted-foreground">1.0x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    defaultValue="1"
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Slower</span>
                    <span>Faster</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Voice Stability</label>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    defaultValue="75"
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>More variable</span>
                    <span>More stable</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Routing Tab */}
        {activeTab === "routing" && (
          <motion.div
            key="routing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Configure how incoming calls are routed
              </p>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Add Route
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/50">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                  <div className="col-span-1">#</div>
                  <div className="col-span-3">Name</div>
                  <div className="col-span-2">Pattern</div>
                  <div className="col-span-4">Destination</div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>
              <div className="divide-y divide-border">
                {callRoutes.map((route) => (
                  <div key={route.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 text-muted-foreground">{route.priority}</div>
                      <div className="col-span-3 font-medium">{route.name}</div>
                      <div className="col-span-2">
                        <span className="px-2 py-1 bg-muted rounded-lg text-sm font-mono">
                          {route.pattern}
                        </span>
                      </div>
                      <div className="col-span-4 text-sm text-muted-foreground">{route.destination}</div>
                      <div className="col-span-2 flex items-center gap-1">
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-600 text-sm">Route Priority</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Routes are evaluated in order. The first matching route will be used.
                    Use &quot;*&quot; as a catch-all pattern.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Voicemail Tab */}
        {activeTab === "voicemail" && (
          <motion.div
            key="voicemail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Voicemail className="w-5 h-5 text-primary" />
                Voicemail Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-sm">Enable voicemail</p>
                    <p className="text-xs text-muted-foreground">Allow callers to leave messages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="font-medium text-sm">Transcribe voicemails</p>
                    <p className="text-xs text-muted-foreground">Convert voice messages to text</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">Email notifications</p>
                    <p className="text-xs text-muted-foreground">Send voicemail to email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Voicemail Greeting</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Greeting Message</label>
                  <textarea
                    rows={3}
                    defaultValue="Hi, you've reached Acme Corporation. We're unable to take your call right now. Please leave a message after the beep, and we'll get back to you as soon as possible."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors">
                    <Play className="w-4 h-4" />
                    Preview
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors">
                    <Mic className="w-4 h-4" />
                    Record Custom
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
