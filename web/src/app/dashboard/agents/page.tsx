"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Plus,
  Play,
  Pause,
  Settings,
  MoreHorizontal,
  TrendingUp,
  MessageSquare,
  Clock,
  Zap,
  Edit2,
  Trash2,
  Copy,
} from "lucide-react";
import { useState } from "react";

const agents = [
  {
    id: "1",
    name: "Sales Assistant",
    description: "Handles product inquiries, pricing questions, and closes sales",
    status: "active",
    channels: ["whatsapp", "voice", "web"],
    stats: {
      conversations: 1245,
      successRate: 94,
      avgResponseTime: "1.8s",
    },
    lastActive: "Just now",
  },
  {
    id: "2",
    name: "Support Agent",
    description: "Resolves customer issues, tracks orders, handles complaints",
    status: "active",
    channels: ["whatsapp", "web"],
    stats: {
      conversations: 892,
      successRate: 97,
      avgResponseTime: "2.1s",
    },
    lastActive: "2 min ago",
  },
  {
    id: "3",
    name: "Appointment Booker",
    description: "Schedules appointments, sends reminders, handles rescheduling",
    status: "paused",
    channels: ["voice", "whatsapp"],
    stats: {
      conversations: 345,
      successRate: 91,
      avgResponseTime: "1.5s",
    },
    lastActive: "1 hour ago",
  },
];

export default function AgentsPage() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">Create and manage your AI agents</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Create Agent
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{agent.name}</h3>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    agent.status === "active"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      agent.status === "active" ? "bg-green-500" : "bg-yellow-500"
                    }`} />
                    {agent.status === "active" ? "Active" : "Paused"}
                  </span>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === agent.id ? null : agent.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
                
                {activeDropdown === agent.id && (
                  <div className="absolute right-0 top-10 w-48 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm">
                      <Edit2 className="w-4 h-4" />
                      Edit Agent
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm">
                      <Settings className="w-4 h-4" />
                      Configure
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm">
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm text-red-500">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>

            {/* Channels */}
            <div className="flex items-center gap-2 mb-6">
              {agent.channels.map((channel) => (
                <span
                  key={channel}
                  className="px-2 py-1 bg-muted rounded text-xs font-medium capitalize"
                >
                  {channel}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-bold">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  {agent.stats.conversations}
                </div>
                <p className="text-xs text-muted-foreground">Chats</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-green-500">
                  <TrendingUp className="w-4 h-4" />
                  {agent.stats.successRate}%
                </div>
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-lg font-bold">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {agent.stats.avgResponseTime}
                </div>
                <p className="text-xs text-muted-foreground">Response</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                agent.status === "active"
                  ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                  : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
              }`}>
                {agent.status === "active" ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Activate
                  </>
                )}
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted font-medium transition-colors">
                <Settings className="w-4 h-4" />
                Configure
              </button>
            </div>
          </motion.div>
        ))}

        {/* Create New Agent Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border-2 border-dashed border-border rounded-2xl p-6 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center min-h-[300px] group"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Create New Agent</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Build a custom AI agent for your specific business needs
          </p>
        </motion.button>
      </div>
    </div>
  );
}
