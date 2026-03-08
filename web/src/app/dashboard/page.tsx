"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Phone,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Zap,
  Globe,
  ChevronRight,
  Play,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";

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

// Mock data
const stats = [
  {
    name: "Total Conversations",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: MessageSquare,
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Calls Handled",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: Phone,
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "Response Rate",
    value: "98.5%",
    change: "+2.1%",
    trend: "up",
    icon: TrendingUp,
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "Active Customers",
    value: "856",
    change: "-3.2%",
    trend: "down",
    icon: Users,
    color: "from-orange-500 to-red-600",
  },
];

const recentConversations = [
  {
    id: "1",
    customer: "Chioma Adeyemi",
    message: "Hi, I want to know if you have the Nike Air Max in size 43?",
    channel: "whatsapp",
    time: "2 min ago",
    status: "active",
    avatar: null,
  },
  {
    id: "2",
    customer: "Emmanuel Okafor",
    message: "Can I schedule an appointment for tomorrow 3pm?",
    channel: "voice",
    time: "15 min ago",
    status: "resolved",
    avatar: null,
  },
  {
    id: "3",
    customer: "Fatima Hassan",
    message: "What are your delivery charges to Abuja?",
    channel: "whatsapp",
    time: "32 min ago",
    status: "pending",
    avatar: null,
  },
  {
    id: "4",
    customer: "David Mensah",
    message: "I need to track my order #ORD-2847",
    channel: "web",
    time: "1 hr ago",
    status: "resolved",
    avatar: null,
  },
  {
    id: "5",
    customer: "Grace Okonkwo",
    message: "Do you offer payment plans for the iPhone 15?",
    channel: "whatsapp",
    time: "2 hr ago",
    status: "resolved",
    avatar: null,
  },
];

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
    href: "/dashboard/settings/channels",
  },
  {
    title: "Set Up Voice AI",
    description: "Configure phone automation",
    icon: Phone,
    color: "from-cyan-500 to-blue-600",
    href: "/dashboard/settings/voice",
  },
  {
    title: "View Analytics",
    description: "Track performance metrics",
    icon: TrendingUp,
    color: "from-orange-500 to-red-600",
    href: "/dashboard/analytics",
  },
];

const agents = [
  {
    id: "1",
    name: "Sales Assistant",
    status: "active",
    conversations: 145,
    successRate: 94,
  },
  {
    id: "2",
    name: "Support Agent",
    status: "active",
    conversations: 89,
    successRate: 97,
  },
  {
    id: "3",
    name: "Appointment Booker",
    status: "paused",
    conversations: 34,
    successRate: 91,
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
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "resolved":
      return "bg-slate-400";
    default:
      return "bg-slate-400";
  }
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, John! 👋</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your AI agents today.</p>
      </div>

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
            {recentConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/dashboard/conversations/${conversation.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {conversation.customer.charAt(0)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{conversation.customer}</p>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conversation.message}</p>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(conversation.channel)}
                    <span className="text-xs text-muted-foreground">{conversation.time}</span>
                  </div>
                </div>
              </Link>
            ))}
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
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
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
                          : "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {agent.conversations} chats • {agent.successRate}% success
                    </p>
                  </div>
                  <button className="p-1 hover:bg-muted rounded transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
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
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-white/70">Active Now</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">2.1s</p>
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
