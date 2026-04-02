"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Phone,
  Clock,
  DollarSign,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Target,
  ThumbsUp,
  ThumbsDown,
  Download,
  RefreshCw,
  Activity,
  Filter,
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
    sparkline: [40, 55, 45, 60, 70, 65, 80],
  },
  {
    name: "Voice Calls",
    value: "3,456",
    change: "+12.5%",
    trend: "up",
    icon: Phone,
    color: "from-green-500 to-emerald-600",
    sparkline: [30, 35, 40, 38, 50, 55, 60],
  },
  {
    name: "Avg Response Time",
    value: "1.8s",
    change: "-23%",
    trend: "up",
    icon: Clock,
    color: "from-cyan-500 to-blue-600",
    sparkline: [60, 50, 45, 40, 35, 30, 25],
  },
  {
    name: "Revenue Generated",
    value: "$48,290",
    change: "+32.1%",
    trend: "up",
    icon: DollarSign,
    color: "from-orange-500 to-red-600",
    sparkline: [20, 30, 45, 50, 60, 75, 90],
  },
];

const channelBreakdown = [
  { channel: "WhatsApp", conversations: 8240, percentage: 64, color: "bg-green-500" },
  { channel: "Voice AI", conversations: 3456, percentage: 27, color: "bg-violet-500" },
  { channel: "Web Chat", conversations: 1151, percentage: 9, color: "bg-blue-500" },
];

const topQueries = [
  { query: "Product availability", count: 1245, percentage: 85, sentiment: 92 },
  { query: "Pricing questions", count: 987, percentage: 72, sentiment: 88 },
  { query: "Order tracking", count: 756, percentage: 65, sentiment: 95 },
  { query: "Delivery time", count: 623, percentage: 58, sentiment: 78 },
  { query: "Returns policy", count: 445, percentage: 48, sentiment: 72 },
];

const recentPerformance = [
  { day: "Mon", conversations: 420, resolved: 398, revenue: 5200 },
  { day: "Tue", conversations: 385, resolved: 371, revenue: 4800 },
  { day: "Wed", conversations: 510, resolved: 489, revenue: 6100 },
  { day: "Thu", conversations: 475, resolved: 458, revenue: 5700 },
  { day: "Fri", conversations: 620, resolved: 598, revenue: 7800 },
  { day: "Sat", conversations: 380, resolved: 365, revenue: 4200 },
  { day: "Sun", conversations: 290, resolved: 280, revenue: 3100 },
];

const hourlyData = [
  { hour: "12am", calls: 12 }, { hour: "2am", calls: 8 }, { hour: "4am", calls: 5 },
  { hour: "6am", calls: 15 }, { hour: "8am", calls: 45 }, { hour: "10am", calls: 78 },
  { hour: "12pm", calls: 95 }, { hour: "2pm", calls: 88 }, { hour: "4pm", calls: 72 },
  { hour: "6pm", calls: 55 }, { hour: "8pm", calls: 38 }, { hour: "10pm", calls: 22 },
];

const agentPerformance = [
  { name: "Customer Support AI", calls: 1456, resolved: 94, avgTime: "2:30", satisfaction: 4.8 },
  { name: "Sales Assistant AI", calls: 892, resolved: 89, avgTime: "3:15", satisfaction: 4.6 },
  { name: "Appointment Booking AI", calls: 678, resolved: 97, avgTime: "1:45", satisfaction: 4.9 },
  { name: "Order Tracking AI", calls: 430, resolved: 98, avgTime: "1:20", satisfaction: 4.7 },
];

const sentimentData = {
  positive: 72,
  neutral: 20,
  negative: 8,
};

const dateRanges = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "custom", label: "Custom range" },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<"performance" | "revenue" | "hourly">("performance");

  const maxCalls = Math.max(...hourlyData.map(d => d.calls));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your AI performance metrics and business insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>{dateRanges.find(d => d.id === dateRange)?.label}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showDateDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden"
                >
                  {dateRanges.map(range => (
                    <button
                      key={range.id}
                      onClick={() => { setDateRange(range.id); setShowDateDropdown(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors ${
                        dateRange === range.id ? "bg-primary/10 text-primary font-medium" : ""
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" />
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
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
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
            {/* Mini Sparkline */}
            <div className="flex items-end gap-1 mt-3 h-8">
              {stat.sparkline.map((value, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm bg-gradient-to-t ${stat.color} opacity-60`}
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Chart Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        {/* Chart Tabs */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-1">
            {[
              { id: "performance", label: "Performance", icon: Activity },
              { id: "revenue", label: "Revenue", icon: DollarSign },
              { id: "hourly", label: "Hourly Distribution", icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id as typeof activeChartTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeChartTab === tab.id
                    ? "bg-primary text-white"
                    : "hover:bg-muted"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Chart Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeChartTab === "performance" && (
              <motion.div
                key="performance"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-end justify-between h-64 gap-4">
                  {recentPerformance.map((day, index) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col gap-1" style={{ height: "200px" }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.conversations / 620) * 100}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="w-full bg-primary/20 rounded-t-lg flex flex-col justify-end"
                        >
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(day.resolved / day.conversations) * 100}%` }}
                            transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                            className="w-full bg-primary rounded-t-lg"
                          />
                        </motion.div>
                      </div>
                      <span className="text-sm font-medium">{day.day}</span>
                      <span className="text-xs text-muted-foreground">{day.conversations}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary/20" />
                    <span className="text-sm text-muted-foreground">Total Conversations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary" />
                    <span className="text-sm text-muted-foreground">Resolved</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeChartTab === "revenue" && (
              <motion.div
                key="revenue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="h-64 flex items-end gap-2">
                  {recentPerformance.map((day, index) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.revenue / 7800) * 200}px` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg"
                      />
                      <span className="text-sm font-medium">{day.day}</span>
                      <span className="text-xs text-green-600 font-medium">${(day.revenue / 1000).toFixed(1)}k</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-500">$36.9k</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">$5.27k</p>
                      <p className="text-sm text-muted-foreground">Daily Average</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-500">+28%</p>
                      <p className="text-sm text-muted-foreground">vs Last Week</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeChartTab === "hourly" && (
              <motion.div
                key="hourly"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="h-64 flex items-end gap-1">
                  {hourlyData.map((hour, index) => (
                    <div key={hour.hour} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(hour.calls / maxCalls) * 200}px` }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                        className={`w-full rounded-t-sm ${
                          hour.calls > 70 ? "bg-red-500" :
                          hour.calls > 40 ? "bg-orange-500" :
                          hour.calls > 20 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                      />
                      <span className="text-[10px] text-muted-foreground rotate-[-45deg] mt-2">{hour.hour}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-xs text-muted-foreground">Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500" />
                    <span className="text-xs text-muted-foreground">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500" />
                    <span className="text-xs text-muted-foreground">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500" />
                    <span className="text-xs text-muted-foreground">Peak</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Channel Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-semibold text-lg mb-6">Channel Breakdown</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-36 h-36">
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
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="9 91"
                  strokeDashoffset="-91"
                  className="text-blue-500"
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
          <div className="space-y-3">
            {channelBreakdown.map((channel) => (
              <div key={channel.channel} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${channel.color}`} />
                  <span className="text-sm">{channel.channel}</span>
                </div>
                <span className="text-sm font-medium">{channel.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sentiment Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-semibold text-lg mb-6">Sentiment Analysis</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Positive</span>
                </div>
                <span className="text-sm font-bold text-green-500">{sentimentData.positive}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sentimentData.positive}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-green-500 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-400" />
                  <span className="text-sm font-medium">Neutral</span>
                </div>
                <span className="text-sm font-bold text-gray-500">{sentimentData.neutral}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sentimentData.neutral}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full bg-gray-400 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Negative</span>
                </div>
                <span className="text-sm font-bold text-red-500">{sentimentData.negative}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sentimentData.negative}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-red-500 rounded-full"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-green-500/10 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Great Performance!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your AI agents maintain a {sentimentData.positive}% positive sentiment rate, above industry average of 65%.
            </p>
          </div>
        </motion.div>

        {/* Resolution Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="font-semibold text-lg mb-6">Resolution Metrics</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted/50 rounded-xl text-center">
              <p className="text-3xl font-bold text-green-500">94%</p>
              <p className="text-xs text-muted-foreground mt-1">Auto-Resolved</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl text-center">
              <p className="text-3xl font-bold">6%</p>
              <p className="text-xs text-muted-foreground mt-1">Escalated</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">First Contact Resolution</span>
              <span className="font-medium">89%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Resolution Time</span>
              <span className="font-medium">2m 15s</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Customer Satisfaction</span>
              <span className="font-medium">4.8/5.0</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Agent Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-lg">AI Agent Performance</h3>
          <p className="text-sm text-muted-foreground">Compare performance across your AI agents</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Agent</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Calls Handled</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Resolution Rate</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Avg. Duration</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-3">Satisfaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {agentPerformance.map((agent, index) => (
                <motion.tr
                  key={agent.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{agent.calls.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${agent.resolved >= 95 ? "bg-green-500" : agent.resolved >= 90 ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{ width: `${agent.resolved}%` }}
                        />
                      </div>
                      <span className="font-medium">{agent.resolved}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{agent.avgTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{agent.satisfaction}</span>
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Top Queries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">Top Customer Queries</h3>
            <p className="text-sm text-muted-foreground">Most common topics customers ask about</p>
          </div>
        </div>
        <div className="space-y-4">
          {topQueries.map((query, index) => (
            <div key={query.query} className="flex items-center gap-4">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{query.query}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{query.count} queries</span>
                    <div className="flex items-center gap-1">
                      {query.sentiment >= 90 ? (
                        <ThumbsUp className="w-3 h-3 text-green-500" />
                      ) : query.sentiment >= 75 ? (
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      ) : (
                        <ThumbsDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className="text-xs text-muted-foreground">{query.sentiment}%</span>
                    </div>
                  </div>
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
