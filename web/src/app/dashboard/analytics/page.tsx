"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Phone,
  Clock,
  DollarSign,
  BarChart3,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState } from "react";

const stats = [
  {
    name: "Total Conversations",
    value: "12,847",
    change: "+18.2%",
    trend: "up",
    icon: MessageSquare,
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Voice Calls",
    value: "3,456",
    change: "+12.5%",
    trend: "up",
    icon: Phone,
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "Avg Response Time",
    value: "1.8s",
    change: "-23%",
    trend: "up",
    icon: Clock,
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "Revenue Generated",
    value: "$48,290",
    change: "+32.1%",
    trend: "up",
    icon: DollarSign,
    color: "from-orange-500 to-red-600",
  },
];

const channelBreakdown = [
  { channel: "WhatsApp", conversations: 8240, percentage: 64, color: "bg-green-500" },
  { channel: "Voice AI", conversations: 3456, percentage: 27, color: "bg-violet-500" },
  { channel: "Web Chat", conversations: 1151, percentage: 9, color: "bg-blue-500" },
];

const topQueries = [
  { query: "Product availability", count: 1245, percentage: 85 },
  { query: "Pricing questions", count: 987, percentage: 72 },
  { query: "Order tracking", count: 756, percentage: 65 },
  { query: "Delivery time", count: 623, percentage: 58 },
  { query: "Returns policy", count: 445, percentage: 48 },
];

const recentPerformance = [
  { day: "Mon", conversations: 420, resolved: 398 },
  { day: "Tue", conversations: 385, resolved: 371 },
  { day: "Wed", conversations: 510, resolved: 489 },
  { day: "Thu", conversations: 475, resolved: 458 },
  { day: "Fri", conversations: 620, resolved: 598 },
  { day: "Sat", conversations: 380, resolved: 365 },
  { day: "Sun", conversations: 290, resolved: 280 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your AI performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Last 7 days</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity">
            <BarChart3 className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 lg:p-6 rounded-2xl bg-card border border-border"
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
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-semibold text-lg mb-6">Weekly Performance</h3>
          <div className="space-y-4">
            {recentPerformance.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <span className="w-10 text-sm text-muted-foreground">{day.day}</span>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden flex">
                  <div
                    className="h-full bg-primary/30"
                    style={{ width: `${(day.conversations / 620) * 100}%` }}
                  />
                  <div
                    className="h-full bg-primary -ml-[${(day.resolved / 620) * 100}%]"
                    style={{ width: `${(day.resolved / 620) * 100}%`, marginLeft: `-${(day.conversations / 620) * 100}%` }}
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{day.conversations}</p>
                  <p className="text-xs text-muted-foreground">{Math.round((day.resolved / day.conversations) * 100)}% resolved</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/30" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-sm text-muted-foreground">Resolved</span>
            </div>
          </div>
        </motion.div>

        {/* Channel Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-semibold text-lg mb-6">Channel Breakdown</h3>
          <div className="space-y-6">
            {channelBreakdown.map((channel) => (
              <div key={channel.channel}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{channel.channel}</span>
                  <span className="text-sm text-muted-foreground">
                    {channel.conversations.toLocaleString()} ({channel.percentage}%)
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${channel.percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`h-full ${channel.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Donut placeholder */}
          <div className="flex items-center justify-center mt-8">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="64 36"
                  className="text-green-500"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="27 73"
                  strokeDashoffset="-64"
                  className="text-violet-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold">12.8k</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Queries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="font-semibold text-lg mb-6">Top Customer Queries</h3>
        <div className="space-y-4">
          {topQueries.map((query, index) => (
            <div key={query.query} className="flex items-center gap-4">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{query.query}</span>
                  <span className="text-sm text-muted-foreground">{query.count} queries</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${query.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
