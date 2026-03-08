"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MessageSquare,
  Phone,
  Globe,
  MoreHorizontal,
  ChevronDown,
  Archive,
  Star,
  Clock,
} from "lucide-react";
import Link from "next/link";

// Mock conversations data
const conversations = [
  {
    id: "1",
    customer: {
      name: "Chioma Adeyemi",
      phone: "+234 801 234 5678",
    },
    lastMessage: "Hi, I want to know if you have the Nike Air Max in size 43?",
    channel: "whatsapp",
    time: "2 min ago",
    status: "active",
    unread: 2,
    starred: true,
  },
  {
    id: "2",
    customer: {
      name: "Emmanuel Okafor",
      phone: "+234 802 345 6789",
    },
    lastMessage: "Can I schedule an appointment for tomorrow 3pm?",
    channel: "voice",
    time: "15 min ago",
    status: "resolved",
    unread: 0,
    starred: false,
  },
  {
    id: "3",
    customer: {
      name: "Fatima Hassan",
      phone: "+234 803 456 7890",
    },
    lastMessage: "What are your delivery charges to Abuja?",
    channel: "whatsapp",
    time: "32 min ago",
    status: "pending",
    unread: 1,
    starred: false,
  },
  {
    id: "4",
    customer: {
      name: "David Mensah",
      phone: "+234 804 567 8901",
    },
    lastMessage: "I need to track my order #ORD-2847",
    channel: "web",
    time: "1 hr ago",
    status: "resolved",
    unread: 0,
    starred: true,
  },
  {
    id: "5",
    customer: {
      name: "Grace Okonkwo",
      phone: "+234 805 678 9012",
    },
    lastMessage: "Do you offer payment plans for the iPhone 15?",
    channel: "whatsapp",
    time: "2 hr ago",
    status: "resolved",
    unread: 0,
    starred: false,
  },
  {
    id: "6",
    customer: {
      name: "Ahmed Ibrahim",
      phone: "+234 806 789 0123",
    },
    lastMessage: "Thanks for the quick response! I'll place my order now.",
    channel: "whatsapp",
    time: "3 hr ago",
    status: "resolved",
    unread: 0,
    starred: false,
  },
  {
    id: "7",
    customer: {
      name: "Sandra Eze",
      phone: "+234 807 890 1234",
    },
    lastMessage: "Is the red dress still available in medium?",
    channel: "web",
    time: "4 hr ago",
    status: "pending",
    unread: 3,
    starred: false,
  },
];

const filters = [
  { id: "all", label: "All", count: 127 },
  { id: "active", label: "Active", count: 8 },
  { id: "pending", label: "Pending", count: 12 },
  { id: "resolved", label: "Resolved", count: 107 },
];

function getChannelIcon(channel: string) {
  switch (channel) {
    case "whatsapp":
      return <MessageSquare className="w-4 h-4 text-green-500" />;
    case "voice":
      return <Phone className="w-4 h-4 text-violet-500" />;
    case "web":
      return <Globe className="w-4 h-4 text-blue-500" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "resolved":
      return "bg-slate-400";
    default:
      return "bg-slate-400";
  }
}

export default function ConversationsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Conversations</h1>
          <p className="text-muted-foreground">Manage all your customer conversations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">Archive</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
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
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeFilter === filter.id
                  ? "bg-primary text-white"
                  : "bg-card border border-border hover:bg-muted"
              }`}
            >
              {filter.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                activeFilter === filter.id
                  ? "bg-white/20"
                  : "bg-muted"
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="divide-y divide-border">
          {conversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/dashboard/conversations/${conversation.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {conversation.customer.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(conversation.status)}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold truncate">{conversation.customer.name}</p>
                    {conversation.starred && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(conversation.channel)}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {conversation.time}
                    </span>
                  </div>
                  {conversation.unread > 0 && (
                    <span className="px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
                      {conversation.unread}
                    </span>
                  )}
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
            Showing 1-7 of 127 conversations
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
