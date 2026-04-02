"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Phone,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Zap,
  Globe,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { analyticsService, conversationService, agentService } from "@/lib/api";
import type { AnalyticsOverview, Conversation, Agent } from "@/lib/api/types";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const quickActions = [
  {
    title: "Train AI Agent",
    description: "Add knowledge to improve responses",
    icon: Bot,
    color: "from-violet-500 to-purple-600",
    href: "/dashboard/knowledge",
  },
  {
    title: "Connect WhatsApp",
    description: "Link your business number",
    icon: MessageSquare,
    color: "from-green-500 to-emerald-600",
    href: "/dashboard/integrations",
  },
  {
    title: "Set Up Voice AI",
    description: "Configure phone automation",
    icon: Phone,
    color: "from-cyan-500 to-blue-600",
    href: "/dashboard/voice-setup",
  },
  {
    title: "View Analytics",
    description: "Track performance metrics",
    icon: TrendingUp,
    color: "from-orange-500 to-red-600",
    href: "/dashboard/analytics",
  },
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
    case "open":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "resolved":
    case "closed":
      return "bg-slate-400";
    default:
      return "bg-slate-400";
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [realtimeStats, setRealtimeStats] = useState({
    active_conversations: 0,
    avg_response_time: '0s',
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [analyticsData, conversationsData, agentsData, realtimeData] = await Promise.all([
          analyticsService.getOverview('7d').catch(() => null),
          conversationService.getConversations({ per_page: 5 }).catch(() => ({ data: [] })),
          agentService.getAgents({ per_page: 5 }).catch(() => ({ data: [] })),
          analyticsService.getRealtimeAnalytics().catch(() => ({
            active_conversations: 0,
            avg_wait_time: 0,
          })),
        ]);
        
        if (analyticsData) setAnalytics(analyticsData);
        setConversations(conversationsData.data || []);
        setAgents(agentsData.data || []);
        setRealtimeStats({
          active_conversations: realtimeData.active_conversations || 0,
          avg_response_time: `${(realtimeData.avg_wait_time || 0).toFixed(1)}s`,
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Build stats from analytics data
  const stats = [
    {
      name: "Total Conversations",
      value: analytics?.total_conversations?.toLocaleString() || '0',
      change: analytics?.conversation_change ? `${analytics.conversation_change > 0 ? '+' : ''}${analytics.conversation_change}%` : '+0%',
      trend: (analytics?.conversation_change || 0) >= 0 ? 'up' : 'down',
      icon: MessageSquare,
      color: "from-violet-500 to-purple-600",
    },
    {
      name: "Calls Handled",
      value: analytics?.calls_handled?.toLocaleString() || '0',
      change: analytics?.calls_change ? `${analytics.calls_change > 0 ? '+' : ''}${analytics.calls_change}%` : '+0%',
      trend: (analytics?.calls_change || 0) >= 0 ? 'up' : 'down',
      icon: Phone,
      color: "from-green-500 to-emerald-600",
    },
    {
      name: "Response Rate",
      value: `${analytics?.response_rate || 0}%`,
      change: analytics?.response_rate_change ? `${analytics.response_rate_change > 0 ? '+' : ''}${analytics.response_rate_change}%` : '+0%',
      trend: (analytics?.response_rate_change || 0) >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: "from-cyan-500 to-blue-600",
    },
    {
      name: "Active Customers",
      value: analytics?.active_customers?.toLocaleString() || '0',
      change: analytics?.customers_change ? `${analytics.customers_change > 0 ? '+' : ''}${analytics.customers_change}%` : '+0%',
      trend: (analytics?.customers_change || 0) >= 0 ? 'up' : 'down',
      icon: Users,
      color: "from-orange-500 to-red-600",
    },
  ];

  // Get user's first name
  const firstName = user?.first_name || 'there';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {firstName}! 👋</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your AI agents today.</p>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            variants={fadeInUp}
            className="p-5 lg:p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-green-500" : "text-red-500"
              }`}>
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.name}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Conversations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="font-semibold text-lg">Recent Conversations</h2>
              <p className="text-sm text-muted-foreground">Latest customer interactions</p>
            </div>
            <Link href="/dashboard/conversations" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Conversations will appear here when customers reach out</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/dashboard/conversations/${conversation.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {(conversation.customer_name || conversation.customer_phone || 'C').charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{conversation.customer_name || conversation.customer_phone || 'Unknown'}</p>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.summary || 'No messages yet'}</p>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(conversation.channel)}
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(conversation.updated_at)}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* AI Agents Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">AI Agents</h2>
              <Link href="/dashboard/agents" className="text-sm text-primary font-medium hover:underline">
                Manage
              </Link>
            </div>
            <div className="space-y-3">
              {agents.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bot className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No agents yet</p>
                  <Link href="/dashboard/agents/new" className="text-sm text-primary hover:underline mt-1 inline-block">
                    Create your first agent
                  </Link>
                </div>
              ) : (
                agents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/dashboard/agents/${agent.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{agent.name}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          agent.status === "active" 
                            ? "bg-green-500/10 text-green-500" 
                            : agent.status === "training"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {agent.type} • {agent.model || 'gpt-4'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Live Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Your AI is Live!</h3>
              <p className="text-white/80 text-sm">Handling conversations across all channels 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{realtimeStats.active_conversations}</p>
              <p className="text-xs text-white/70">Active Now</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{realtimeStats.avg_response_time}</p>
              <p className="text-xs text-white/70">Avg Response</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-xs text-white/70">Availability</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
