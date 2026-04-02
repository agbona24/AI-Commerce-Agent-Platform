"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Globe,
  Star,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Download,
  Copy,
  Share2,
  Flag,
  Archive,
  Trash2,
  Bot,
  User,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Send,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  Users,
  Calendar,
  FileText,
  ExternalLink,
  Loader2,
  UserCheck,
} from "lucide-react";
import { conversationService } from "@/lib/api";

// Type for transcript display
interface TranscriptMessage {
  id: number;
  role: "agent" | "user" | "system";
  text: string;
  timestamp: string;
  sentiment: string;
}

// Type for conversation display data
interface ConversationDisplayData {
  id: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    avatar: string | null;
    totalConversations: number;
    customerSince: string;
    tags: string[];
  };
  channel: string;
  status: string;
  duration: string;
  startTime: string;
  endTime: string;
  agent: string;
  sentiment: string;
  satisfactionScore: number;
  resolved: boolean;
  starred: boolean;
  topics: string[];
  summary: string;
  isEscalated: boolean;
  assignedTo: string | null;
}

const aiInsights = [
  { label: "Intent Detection", value: "Product Inquiry", confidence: 98 },
  { label: "Sentiment", value: "Positive", confidence: 92 },
  { label: "Resolution", value: "Order Placed", confidence: 100 },
  { label: "Escalation Need", value: "None", confidence: 95 },
];

const relatedConversations = [
  { id: "12", date: "Feb 28", topic: "Order Status", duration: "2:15" },
  { id: "8", date: "Feb 15", topic: "Return Request", duration: "4:30" },
  { id: "5", date: "Jan 22", topic: "Product Inquiry", duration: "1:45" },
];

function getSentimentColor(sentiment: string) {
  switch (sentiment) {
    case "positive": return "text-green-500";
    case "negative": return "text-red-500";
    default: return "text-gray-500";
  }
}

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params.id as string;
  
  // API data states
  const [conversationData, setConversationData] = useState<ConversationDisplayData | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Handover states
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [isHandingBack, setIsHandingBack] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // UI states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [activeTab, setActiveTab] = useState<"transcript" | "insights" | "customer">("transcript");
  const totalDuration = 135; // 2:15 in seconds
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation data
  const fetchConversation = useCallback(async () => {
    try {
      setError(null);
      const conv = await conversationService.getConversation(conversationId);
      const meta = (conv.metadata || conv.customer_metadata || {}) as Record<string, unknown>;
      
      // Transform API data to display format
      const displayData: ConversationDisplayData = {
        id: conv.id?.toString() || conversationId,
        customer: {
          name: conv.customer_name || (meta.customer_name as string) || "Unknown Customer",
          phone: conv.customer_phone || (meta.customer_phone as string) || "",
          email: conv.customer_email || (meta.customer_email as string) || "",
          avatar: (meta.customer_avatar as string) || null,
          totalConversations: (meta.total_conversations as number) || 1,
          customerSince: (meta.customer_since as string) || "Unknown",
          tags: (conv.tags || meta.tags as string[]) || [],
        },
        channel: conv.channel || "web_widget",
        status: conv.status || "active",
        duration: (meta.duration as string) || "0:00",
        startTime: conv.started_at ? new Date(conv.started_at).toLocaleString() : 
                   conv.created_at ? new Date(conv.created_at).toLocaleString() : "Unknown",
        endTime: conv.ended_at ? new Date(conv.ended_at).toLocaleString() : 
                 conv.resolved_at ? new Date(conv.resolved_at).toLocaleString() : "",
        agent: conv.agent?.name || "AI Agent",
        sentiment: conv.sentiment || (conv.sentiment_score && conv.sentiment_score > 0 ? "positive" : 
                   conv.sentiment_score && conv.sentiment_score < 0 ? "negative" : "neutral"),
        satisfactionScore: (meta.satisfaction_score as number) || 0,
        resolved: conv.status === "resolved",
        starred: (meta.starred as boolean) || false,
        topics: (meta.topics as string[]) || [],
        summary: conv.summary || "",
        isEscalated: conv.status === "escalated" || !!conv.assigned_to,
        assignedTo: conv.assigned_to?.toString() || null,
      };
      
      setConversationData(displayData);
      
      // Transform messages to transcript format
      if (conv.messages && Array.isArray(conv.messages)) {
        const transcriptMessages: TranscriptMessage[] = conv.messages.map((msg, index) => ({
          id: typeof msg.id === 'string' ? parseInt(msg.id) || index + 1 : index + 1,
          role: (msg.role === "assistant" ? "agent" : msg.role) as "agent" | "user" | "system",
          text: msg.content || "",
          timestamp: msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : `0:${index * 10}`,
          sentiment: (msg.metadata?.sentiment as string) || "neutral",
        }));
        setTranscript(transcriptMessages);
      }
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setError("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);
  
  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Handle taking over from AI
  const handleTakeOver = async () => {
    if (!conversationData) return;
    
    try {
      setIsTakingOver(true);
      await conversationService.escalate(conversationId);
      
      // Update local state
      setConversationData(prev => prev ? {
        ...prev,
        isEscalated: true,
        status: "escalated",
      } : null);
      
      // Add system message to transcript
      setTranscript(prev => [...prev, {
        id: prev.length + 1,
        role: "system",
        text: "Conversation has been taken over by a human agent.",
        timestamp: new Date().toLocaleTimeString(),
        sentiment: "neutral",
      }]);
    } catch (err) {
      console.error("Error taking over conversation:", err);
      setError("Failed to take over conversation");
    } finally {
      setIsTakingOver(false);
    }
  };
  
  // Handle handing back to AI
  const handleHandBackToAI = async () => {
    if (!conversationData) return;
    
    try {
      setIsHandingBack(true);
      // Update conversation to remove escalation
      await conversationService.handBackToAI(conversationId);
      
      // Update local state
      setConversationData(prev => prev ? {
        ...prev,
        isEscalated: false,
        status: "active",
        assignedTo: null,
      } : null);
      
      // Add system message
      setTranscript(prev => [...prev, {
        id: prev.length + 1,
        role: "system",
        text: "Conversation has been handed back to AI agent.",
        timestamp: new Date().toLocaleTimeString(),
        sentiment: "neutral",
      }]);
    } catch (err) {
      console.error("Error handing back to AI:", err);
      setError("Failed to hand back to AI");
    } finally {
      setIsHandingBack(false);
    }
  };
  
  // Handle sending operator message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !conversationData) return;
    
    try {
      setIsSendingMessage(true);
      
      // Add message optimistically
      const newMessage: TranscriptMessage = {
        id: transcript.length + 1,
        role: "agent",
        text: replyText,
        timestamp: new Date().toLocaleTimeString(),
        sentiment: "neutral",
      };
      setTranscript(prev => [...prev, newMessage]);
      
      // Send via API
      await conversationService.sendMessage(conversationId, {
        content: replyText,
        type: "text",
        metadata: { sent_by_human: true },
      });
      
      setReplyText("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
      // Remove optimistic message on error
      setTranscript(prev => prev.slice(0, -1));
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < totalDuration) {
      interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, totalDuration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Error state
  if (error || !conversationData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-medium">{error || "Conversation not found"}</p>
        <Link 
          href="/dashboard/conversations"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Back to Conversations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/conversations"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                {conversationData.customer.name.charAt(0)}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-background ${
                conversationData.status === "resolved" ? "bg-green-500" : 
                conversationData.status === "escalated" ? "bg-amber-500" :
                conversationData.status === "active" ? "bg-yellow-500" : "bg-gray-400"
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{conversationData.customer.name}</h1>
                {conversationData.starred && (
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                )}
                {conversationData.isEscalated && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Human Agent
                  </span>
                )}
                {conversationData.customer.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  {conversationData.channel === "voice" ? <Phone className="w-4 h-4" /> : 
                   conversationData.channel === "whatsapp" ? <MessageSquare className="w-4 h-4" /> :
                   <Globe className="w-4 h-4" />}
                  {conversationData.customer.phone}
                </span>
                <span>•</span>
                <span>{conversationData.startTime}</span>
                <span>•</span>
                <span>{conversationData.duration}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Archive className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Flag className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden"
                >
                  <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download Recording
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Copy Transcript
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Export as PDF
                  </button>
                  <hr className="border-border" />
                  <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950 text-red-500 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Conversation
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Player (for voice calls) */}
          {conversationData.channel === "voice" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Call Recording</h3>
                <button className="text-sm text-primary flex items-center gap-1">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
              
              {/* Waveform visualization */}
              <div className="relative h-16 bg-muted rounded-lg overflow-hidden mb-4">
                <div className="absolute inset-0 flex items-center justify-center gap-0.5 px-4">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all ${
                        (i / 60) * totalDuration <= currentTime ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                      style={{ height: `${20 + Math.random() * 40}%` }}
                    />
                  ))}
                </div>
                {/* Progress overlay */}
                <div 
                  className="absolute inset-y-0 left-0 bg-primary/10"
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button 
                    onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 10))}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min={0}
                    max={totalDuration}
                    value={currentTime}
                    onChange={(e) => setCurrentTime(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <span className="text-sm font-mono text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex border-b border-border">
              {[
                { id: "transcript", label: "Transcript", icon: MessageSquare },
                { id: "insights", label: "AI Insights", icon: Sparkles },
                { id: "customer", label: "Customer Info", icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-muted border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "transcript" && (
                <motion.div
                  key="transcript"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 space-y-4 max-h-[500px] overflow-y-auto"
                >
                  {transcript.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "agent" 
                          ? "bg-gradient-to-br from-violet-500 to-purple-600" 
                          : "bg-gradient-to-br from-blue-500 to-cyan-600"
                      }`}>
                        {message.role === "agent" ? (
                          <Bot className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                        <div className={`inline-block max-w-[85%] p-3 rounded-2xl ${
                          message.role === "agent"
                            ? "bg-muted rounded-tl-none"
                            : "bg-primary text-white rounded-tr-none"
                        }`}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
                          message.role === "user" ? "justify-end" : ""
                        }`}>
                          <span>{message.timestamp}</span>
                          <span className={getSentimentColor(message.sentiment)}>●</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
              
              {/* Escalation Banner & Message Input */}
              {activeTab === "transcript" && conversationData.isEscalated && (
                <div className="border-t border-border">
                  <div className="bg-amber-50 dark:bg-amber-950/30 px-4 py-2 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-700 dark:text-amber-400">
                      You are handling this conversation
                    </span>
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      disabled={isSendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || isSendingMessage}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Send
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "insights" && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 space-y-6"
                >
                  {/* AI Summary */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      AI-Generated Summary
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-xl">
                      {conversationData.summary}
                    </p>
                  </div>

                  {/* Topics */}
                  <div>
                    <h4 className="font-semibold mb-3">Detected Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {conversationData.topics.map(topic => (
                        <span key={topic} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Insights Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {aiInsights.map((insight) => (
                      <div key={insight.label} className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground mb-1">{insight.label}</p>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{insight.value}</p>
                          <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full">
                            {insight.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sentiment Timeline */}
                  <div>
                    <h4 className="font-semibold mb-3">Sentiment Over Time</h4>
                    <div className="h-8 bg-muted rounded-lg overflow-hidden flex">
                      <div className="w-[10%] bg-gray-400" title="Neutral" />
                      <div className="w-[90%] bg-green-500" title="Positive" />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>Start</span>
                      <span>End</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "customer" && (
                <motion.div
                  key="customer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 space-y-6"
                >
                  {/* Customer Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="font-medium text-sm">{conversationData.customer.email}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium text-sm">{conversationData.customer.phone}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Customer Since</p>
                      <p className="font-medium text-sm">{conversationData.customer.customerSince}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Total Conversations</p>
                      <p className="font-medium text-sm">{conversationData.customer.totalConversations}</p>
                    </div>
                  </div>

                  {/* Previous Conversations */}
                  <div>
                    <h4 className="font-semibold mb-3">Previous Conversations</h4>
                    <div className="space-y-2">
                      {relatedConversations.map(conv => (
                        <Link
                          key={conv.id}
                          href={`/dashboard/conversations/${conv.id}`}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-violet-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{conv.topic}</p>
                              <p className="text-xs text-muted-foreground">{conv.date} • {conv.duration}</p>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4">Conversation Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  conversationData.resolved ? "text-green-500" : "text-yellow-500"
                }`}>
                  {conversationData.resolved ? (
                    <><CheckCircle2 className="w-4 h-4" /> Resolved</>
                  ) : (
                    <><Clock className="w-4 h-4" /> Pending</>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Agent</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Bot className="w-4 h-4 text-violet-500" />
                  {conversationData.agent}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="text-sm font-medium">{conversationData.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sentiment</span>
                <span className={`text-sm font-medium flex items-center gap-1 ${getSentimentColor(conversationData.sentiment)}`}>
                  {conversationData.sentiment === "positive" ? <ThumbsUp className="w-4 h-4" /> :
                   conversationData.sentiment === "negative" ? <ThumbsDown className="w-4 h-4" /> :
                   <div className="w-4 h-4 rounded-full bg-gray-400" />}
                  {conversationData.sentiment.charAt(0).toUpperCase() + conversationData.sentiment.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Satisfaction</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{conversationData.satisfactionScore}</span>
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {/* Take Over / Hand Back Button */}
              {conversationData.status !== "resolved" && (
                conversationData.isEscalated ? (
                  <button 
                    onClick={handleHandBackToAI}
                    disabled={isHandingBack}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 transition-colors text-left disabled:opacity-50"
                  >
                    {isHandingBack ? (
                      <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                    ) : (
                      <Bot className="w-5 h-5 text-violet-500" />
                    )}
                    <span className="text-sm font-medium text-violet-600">Hand Back to AI</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleTakeOver}
                    disabled={isTakingOver}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 transition-colors text-left disabled:opacity-50"
                  >
                    {isTakingOver ? (
                      <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-amber-500" />
                    )}
                    <span className="text-sm font-medium text-amber-600">Take Over from AI</span>
                  </button>
                )
              )}
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-left">
                <Phone className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Call Customer</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-left">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Send Message</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-left">
                <Users className="w-5 h-5 text-violet-500" />
                <span className="text-sm font-medium">Assign to Team</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-left">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium">Schedule Follow-up</span>
              </button>
            </div>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Tags</h3>
              <button className="text-sm text-primary flex items-center gap-1">
                <Tag className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Completed", "Nike", "Lagos Delivery", "Size 43"].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-muted rounded-lg text-sm flex items-center gap-1">
                  {tag}
                  <button className="text-muted-foreground hover:text-foreground">
                    <XCircle className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
