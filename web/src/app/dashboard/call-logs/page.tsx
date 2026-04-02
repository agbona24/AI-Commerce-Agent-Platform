"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Bot,
  Play,
  Pause,
  Download,
  ChevronRight,
  X,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  FileText,
} from "lucide-react";

interface CallLog {
  id: string;
  phoneNumber: string;
  callerName: string;
  direction: "inbound" | "outbound";
  status: "completed" | "missed" | "voicemail" | "transferred";
  duration: number;
  agentName: string;
  agentId: string;
  sentiment: "positive" | "neutral" | "negative";
  summary: string;
  transcript: TranscriptEntry[];
  recordingUrl?: string;
  createdAt: string;
  resolvedIssue: boolean;
  tags: string[];
}

interface TranscriptEntry {
  role: "agent" | "customer";
  content: string;
  timestamp: number;
}


const formatDuration = (seconds: number): string => {
  if (seconds === 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function CallLogsPage() {
  const [calls] = useState<CallLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDirection, setFilterDirection] = useState<string>("all");
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.phoneNumber.includes(searchQuery) ||
      call.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || call.status === filterStatus;
    const matchesDirection = filterDirection === "all" || call.direction === filterDirection;
    return matchesSearch && matchesStatus && matchesDirection;
  });

  const getStatusIcon = (status: string, direction: string) => {
    if (status === "missed") return <PhoneMissed className="w-4 h-4 text-red-500" />;
    if (direction === "outbound") return <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
    return <PhoneIncoming className="w-4 h-4 text-green-500" />;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case "negative":
        return <ThumbsDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const stats = {
    total: calls.length,
    completed: calls.filter((c) => c.status === "completed").length,
    missed: calls.filter((c) => c.status === "missed").length,
    avgDuration: (() => {
      const withDuration = calls.filter((c) => c.duration > 0);
      if (withDuration.length === 0) return 0;
      return Math.round(withDuration.reduce((sum, c) => sum + c.duration, 0) / withDuration.length);
    })(),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Call Logs</h1>
          <p className="text-muted-foreground">View and analyze all voice conversations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Calls", value: stats.total.toString(), icon: Phone, color: "from-violet-500 to-purple-600" },
          { label: "Completed", value: stats.completed.toString(), icon: PhoneIncoming, color: "from-green-500 to-emerald-600" },
          { label: "Missed", value: stats.missed.toString(), icon: PhoneMissed, color: "from-red-500 to-rose-600" },
          { label: "Avg Duration", value: formatDuration(stats.avgDuration), icon: Clock, color: "from-cyan-500 to-blue-600" },
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

      {/* Search & Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, number, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
            showFilters ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>

        <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors">
          <Calendar className="w-4 h-4" />
          Today
        </button>
      </div>

      {/* Filter Options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="missed">Missed</option>
                  <option value="voicemail">Voicemail</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Direction</label>
                <select
                  value={filterDirection}
                  onChange={(e) => setFilterDirection(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="all">All Directions</option>
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setFilterStatus("all");
                  setFilterDirection("all");
                }}
                className="text-sm text-primary hover:underline ml-auto"
              >
                Clear filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        {filteredCalls.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredCalls.map((call, index) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCall(call)}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      call.status === "missed"
                        ? "bg-red-500/10"
                        : call.direction === "outbound"
                        ? "bg-blue-500/10"
                        : "bg-green-500/10"
                    }`}
                  >
                    {getStatusIcon(call.status, call.direction)}
                  </div>

                  {/* Caller Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{call.callerName}</p>
                      {call.status === "voicemail" && (
                        <span className="px-2 py-0.5 text-xs bg-orange-500/10 text-orange-500 rounded-full">
                          Voicemail
                        </span>
                      )}
                      {call.status === "transferred" && (
                        <span className="px-2 py-0.5 text-xs bg-purple-500/10 text-purple-500 rounded-full">
                          Transferred
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{call.phoneNumber}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        {call.agentName}
                      </span>
                    </div>
                  </div>

                  {/* Summary Preview */}
                  <div className="hidden lg:block flex-1 max-w-md">
                    <p className="text-sm text-muted-foreground line-clamp-2">{call.summary}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      {getSentimentIcon(call.sentiment)}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatDuration(call.duration)}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatDate(call.createdAt)} {formatTime(call.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
            {calls.length === 0 ? (
              <>
                <h3 className="font-semibold text-lg mb-2">No calls yet</h3>
                <p className="text-muted-foreground">Call logs will appear here once your agents start receiving or making calls</p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-lg mb-2">No calls found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Call Detail Modal */}
      <AnimatePresence>
        {selectedCall && (
          <CallDetailModal call={selectedCall} onClose={() => setSelectedCall(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CallDetailModal({ call, onClose }: { call: CallLog; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"transcript" | "summary">("transcript");

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-card border-l border-border shadow-xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    call.status === "missed"
                      ? "bg-red-500/10"
                      : call.direction === "outbound"
                      ? "bg-blue-500/10"
                      : "bg-green-500/10"
                  }`}
                >
                  {call.direction === "outbound" ? (
                    <PhoneOutgoing className="w-5 h-5 text-blue-500" />
                  ) : call.status === "missed" ? (
                    <PhoneMissed className="w-5 h-5 text-red-500" />
                  ) : (
                    <PhoneIncoming className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{call.callerName}</h2>
                  <p className="text-muted-foreground">{call.phoneNumber}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{formatDuration(call.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                {formatDate(call.createdAt)} at {formatTime(call.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
              <Bot className="w-4 h-4 text-muted-foreground" />
              <span>{call.agentName}</span>
            </div>
          </div>

          {/* Recording Player */}
          {call.recordingUrl && (
            <div className="mt-4 p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary rounded-full" />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>1:23</span>
                    <span>{formatDuration(call.duration)}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "transcript"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Transcript
              </div>
            </button>
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "summary"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Summary
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "transcript" ? (
            <div className="space-y-4">
              {call.transcript.length > 0 ? (
                call.transcript.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-3 ${entry.role === "agent" ? "" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        entry.role === "agent"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {entry.role === "agent" ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`flex-1 p-4 rounded-2xl ${
                        entry.role === "agent"
                          ? "bg-primary/5 rounded-tl-none"
                          : "bg-muted rounded-tr-none"
                      }`}
                    >
                      <p className="text-sm">{entry.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {Math.floor(entry.timestamp / 60)}:{(entry.timestamp % 60).toString().padStart(2, "0")}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transcript available</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="font-semibold mb-2">Call Summary</h3>
                <p className="text-muted-foreground">{call.summary}</p>
              </div>

              {/* Sentiment */}
              <div>
                <h3 className="font-semibold mb-2">Sentiment Analysis</h3>
                <div className="flex items-center gap-3">
                  <div
                    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                      call.sentiment === "positive"
                        ? "bg-green-500/10 text-green-600"
                        : call.sentiment === "negative"
                        ? "bg-red-500/10 text-red-600"
                        : "bg-gray-500/10 text-gray-600"
                    }`}
                  >
                    {call.sentiment === "positive" ? (
                      <ThumbsUp className="w-4 h-4" />
                    ) : call.sentiment === "negative" ? (
                      <ThumbsDown className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                    <span className="capitalize font-medium">{call.sentiment}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {call.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div>
                <h3 className="font-semibold mb-2">Resolution Status</h3>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                    call.resolvedIssue
                      ? "bg-green-500/10 text-green-600"
                      : "bg-yellow-500/10 text-yellow-600"
                  }`}
                >
                  {call.resolvedIssue ? "Issue Resolved" : "Pending Follow-up"}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
