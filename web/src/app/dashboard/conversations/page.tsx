"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MessageSquare,
  Phone,
  Globe,
  MoreHorizontal,
  Archive,
  Star,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
  PhoneIncoming,
  PhoneOutgoing,
  Mic,
  FileAudio,
} from "lucide-react";
import Link from "next/link";
import { conversationService } from "@/lib/api";
import type { Conversation } from "@/lib/api/types";

function getChannelIcon(channel: string) {
  switch (channel) {
    case "whatsapp":
      return <MessageSquare className="w-4 h-4 text-green-500" />;
    case "voice":
      return <Phone className="w-4 h-4 text-violet-500" />;
    case "web":
    case "web_widget":
      return <Globe className="w-4 h-4 text-blue-500" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "open":
    case "active":
      return "bg-green-500";
    case "waiting":
      return "bg-yellow-500";
    case "resolved":
    case "closed":
      return "bg-slate-400";
    case "escalated":
      return "bg-amber-500";
    default:
      return "bg-slate-400";
  }
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

const statusFilters = [
  { id: "all", label: "All" },
  { id: "open", label: "Active" },
  { id: "escalated", label: "Escalated" },
  { id: "waiting", label: "Pending" },
  { id: "resolved", label: "Resolved" },
];

const channelFilters = [
  { id: "all", label: "All Channels", icon: MessageSquare },
  { id: "voice", label: "Voice Calls", icon: Phone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "web", label: "Web Chat", icon: Globe },
];

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ConversationsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters: Record<string, unknown> = {
        page: pagination.currentPage,
        per_page: pagination.perPage,
      };

      if (activeFilter !== "all") {
        filters.status = activeFilter;
      }

      if (channelFilter !== "all") {
        filters.channel = channelFilter;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await conversationService.getConversations(filters);
      setConversations(response.data || []);
      setPagination({
        currentPage: response.meta?.current_page || 1,
        lastPage: response.meta?.last_page || 1,
        total: response.meta?.total || 0,
        perPage: response.meta?.per_page || 10,
      });
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, channelFilter, searchQuery, pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Debounced search - reset to page 1 when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(p => ({ ...p, currentPage: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setPagination(p => ({ ...p, currentPage: 1 }));
  };

  const handleChannelChange = (channelId: string) => {
    setChannelFilter(channelId);
    setPagination(p => ({ ...p, currentPage: 1 }));
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.lastPage) {
      setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {channelFilter === "voice" ? "Voice Calls" : 
             channelFilter === "whatsapp" ? "WhatsApp Conversations" : 
             channelFilter === "web" ? "Web Chat" : "Conversations"}
          </h1>
          <p className="text-muted-foreground">
            {channelFilter === "voice" 
              ? "View and manage all voice call history" 
              : "Manage all your customer conversations"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchConversations}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">Archive</span>
          </button>
        </div>
      </div>

      {/* Channel Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {channelFilters.map((channel) => {
          const Icon = channel.icon;
          return (
            <button
              key={channel.id}
              onClick={() => handleChannelChange(channel.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                channelFilter === channel.id
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 ${channel.id === 'voice' ? 'text-violet-500' : channel.id === 'whatsapp' ? 'text-green-500' : channel.id === 'web' ? 'text-blue-500' : ''}`} />
              {channel.label}
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeFilter === filter.id
                  ? "bg-primary text-white"
                  : "bg-card border border-border hover:bg-muted"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
          <button 
            onClick={fetchConversations}
            className="ml-auto text-sm text-red-500 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Conversations List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-1">No conversations found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || activeFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Conversations will appear here when customers reach out'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {conversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    href={`/dashboard/conversations/${conversation.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {(conversation.customer_name || conversation.customer_phone || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(conversation.status)}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">
                          {conversation.customer_name || conversation.customer_phone || 'Unknown Customer'}
                        </p>
                        {conversation.status === 'escalated' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Human
                          </span>
                        )}
                        {conversation.tags?.includes('starred') && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.summary || 'No messages yet'}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {conversation.channel === 'voice' ? (
                          <div className="flex items-center gap-1.5">
                            {(conversation.metadata as Record<string, unknown>)?.direction === 'outbound' ? (
                              <PhoneOutgoing className="w-4 h-4 text-violet-500" />
                            ) : (
                              <PhoneIncoming className="w-4 h-4 text-violet-500" />
                            )}
                            {typeof (conversation.metadata as Record<string, unknown>)?.duration === 'number' && (
                              <span className="text-xs font-medium text-muted-foreground">
                                {formatDuration((conversation.metadata as Record<string, unknown>)?.duration as number)}
                              </span>
                            )}
                          </div>
                        ) : (
                          getChannelIcon(conversation.channel)
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(conversation.last_message_at || conversation.updated_at)}
                        </span>
                      </div>
                      {conversation.channel === 'voice' ? (
                        <div className="flex items-center gap-2">
                          {Boolean((conversation.metadata as Record<string, unknown>)?.has_recording) && (
                            <span className="text-xs flex items-center gap-1 text-violet-500">
                              <FileAudio className="w-3 h-3" />
                              Recording
                            </span>
                          )}
                          {Boolean((conversation.metadata as Record<string, unknown>)?.has_transcript) && (
                            <span className="text-xs flex items-center gap-1 text-green-500">
                              <Mic className="w-3 h-3" />
                              Transcript
                            </span>
                          )}
                        </div>
                      ) : conversation.messages_count > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {conversation.messages_count} messages
                        </span>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // Open context menu
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {conversations.length} of {pagination.total} conversations
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevPage}
                  disabled={pagination.currentPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.lastPage}
                </span>
                <button 
                  onClick={handleNextPage}
                  disabled={pagination.currentPage >= pagination.lastPage}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
