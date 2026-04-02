"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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
  Edit2,
  Trash2,
  Copy,
  Eye,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { agentService } from "@/lib/api";
import type { Agent } from "@/lib/api/types";

export default function AgentsPage() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAgents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await agentService.getAgents({ per_page: 50 });
      setAgents(response.data || []);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setError('Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleToggleStatus = async (agent: Agent) => {
    setActionLoading(agent.id);
    try {
      const newStatus = agent.status === 'active' ? 'inactive' : 'active';
      await agentService.updateStatus(agent.id, newStatus);
      setAgents(agents.map(a => 
        a.id === agent.id ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      console.error('Failed to update agent status:', err);
    } finally {
      setActionLoading(null);
      setActiveDropdown(null);
    }
  };

  const handleDuplicate = async (agent: Agent) => {
    setActionLoading(agent.id);
    try {
      const newAgent = await agentService.duplicateAgent(agent.id);
      setAgents([...agents, newAgent]);
    } catch (err) {
      console.error('Failed to duplicate agent:', err);
    } finally {
      setActionLoading(null);
      setActiveDropdown(null);
    }
  };

  const handleDelete = async (agent: Agent) => {
    if (!confirm(`Are you sure you want to delete "${agent.name}"?`)) return;
    
    setActionLoading(agent.id);
    try {
      await agentService.deleteAgent(agent.id);
      setAgents(agents.filter(a => a.id !== agent.id));
    } catch (err) {
      console.error('Failed to delete agent:', err);
    } finally {
      setActionLoading(null);
      setActiveDropdown(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-500/10', text: 'text-green-500', dot: 'bg-green-500', label: 'Active' };
      case 'training':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500', label: 'Training' };
      case 'inactive':
      case 'paused':
        return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', dot: 'bg-yellow-500', label: 'Paused' };
      default:
        return { bg: 'bg-slate-500/10', text: 'text-slate-500', dot: 'bg-slate-500', label: status };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">Create and manage your AI agents</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAgents}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/dashboard/agents/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
          <button 
            onClick={fetchAgents}
            className="ml-auto text-sm text-red-500 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent, index) => {
          const statusBadge = getStatusBadge(agent.status);
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <Link href={`/dashboard/agents/${agent.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                      {statusBadge.label}
                    </span>
                  </div>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === agent.id ? null : agent.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    disabled={actionLoading === agent.id}
                  >
                    {actionLoading === agent.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  
                  {activeDropdown === agent.id && (
                    <div className="absolute right-0 top-10 w-48 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                      <Link
                        href={`/dashboard/agents/${agent.id}`}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Agent
                      </Link>
                      <Link
                        href={`/dashboard/agents/${agent.id}/edit`}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Agent
                      </Link>
                      <button 
                        onClick={() => handleDuplicate(agent)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <button 
                        onClick={() => handleDelete(agent)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-sm text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {agent.description || `${agent.type} agent`}
              </p>

              {/* Channels */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                {(agent.channels || []).map((channel) => (
                  <span
                    key={channel}
                    className="px-2 py-1 bg-muted rounded text-xs font-medium capitalize"
                  >
                    {channel.replace('_', ' ')}
                  </span>
                ))}
                {(!agent.channels || agent.channels.length === 0) && (
                  <span className="text-xs text-muted-foreground">No channels configured</span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    {agent.conversations_count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Chats</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold text-green-500">
                    <TrendingUp className="w-4 h-4" />
                    {agent.avg_rating ? `${(agent.avg_rating * 20).toFixed(0)}%` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {agent.model?.replace('gpt-', '') || 'gpt-4'}
                  </div>
                  <p className="text-xs text-muted-foreground">Model</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleToggleStatus(agent)}
                  disabled={actionLoading === agent.id}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                    agent.status === "active"
                      ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                      : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                  }`}
                >
                  {actionLoading === agent.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : agent.status === "active" ? (
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
                <Link
                  href={`/dashboard/agents/${agent.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted font-medium transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Configure
                </Link>
              </div>
            </motion.div>
          );
        })}

        {/* Create New Agent Card */}
        <Link href="/dashboard/agents/new">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border-2 border-dashed border-border rounded-2xl p-6 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center min-h-[300px] group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Create New Agent</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Build a custom AI agent for your specific business needs
            </p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
