"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Bell,
  X,
  MessageSquare,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Settings,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

interface Notification {
  id: string;
  type: "conversation" | "call" | "alert" | "success" | "team" | "analytics" | "security";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Escalation Required",
    message: "Customer Sarah M. is requesting a human agent for order issue #12847",
    time: "2 min ago",
    read: false,
    actionUrl: "/dashboard/conversations/12847",
  },
  {
    id: "2",
    type: "call",
    title: "Missed Call",
    message: "Missed call from +1 (555) 123-4567 at 2:34 PM",
    time: "15 min ago",
    read: false,
    actionUrl: "/dashboard/conversations",
  },
  {
    id: "3",
    type: "success",
    title: "Issue Auto-Resolved",
    message: "AI agent successfully resolved order tracking inquiry",
    time: "32 min ago",
    read: false,
  },
  {
    id: "4",
    type: "analytics",
    title: "Weekly Report Ready",
    message: "Your weekly performance report is now available",
    time: "1 hour ago",
    read: true,
    actionUrl: "/dashboard/analytics",
  },
  {
    id: "5",
    type: "team",
    title: "New Team Member",
    message: "John D. has joined your workspace as an Admin",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "6",
    type: "conversation",
    title: "High Volume Alert",
    message: "Incoming conversation volume is 40% above average",
    time: "3 hours ago",
    read: true,
    actionUrl: "/dashboard/analytics",
  },
  {
    id: "7",
    type: "security",
    title: "New Login Detected",
    message: "New login from Chrome on macOS in San Francisco",
    time: "5 hours ago",
    read: true,
  },
];

const notificationIcons: Record<Notification["type"], React.ElementType> = {
  conversation: MessageSquare,
  call: Phone,
  alert: AlertTriangle,
  success: CheckCircle2,
  team: Users,
  analytics: TrendingUp,
  security: Shield,
};

const notificationColors: Record<Notification["type"], string> = {
  conversation: "bg-blue-500/10 text-blue-500",
  call: "bg-green-500/10 text-green-500",
  alert: "bg-orange-500/10 text-orange-500",
  success: "bg-emerald-500/10 text-emerald-500",
  team: "bg-violet-500/10 text-violet-500",
  analytics: "bg-cyan-500/10 text-cyan-500",
  security: "bg-red-500/10 text-red-500",
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [hasNewNotification, setHasNewNotification] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Simulate receiving new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setHasNewNotification(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setHasNewNotification(false);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (hasNewNotification) setHasNewNotification(false);
        }}
        className="relative p-2 hover:bg-muted rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
        {hasNewNotification && unreadCount > 0 && (
          <motion.span
            className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <Link
                    href="/dashboard/settings/notifications"
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification, index) => {
                      const Icon = notificationIcons[notification.type];
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`p-3 hover:bg-muted/50 transition-colors relative ${
                            !notification.read ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                notificationColors[notification.type]
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm truncate">
                                  {notification.title}
                                </p>
                                <button
                                  onClick={() => dismissNotification(notification.id)}
                                  className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                >
                                  <X className="w-3 h-3 text-muted-foreground" />
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {notification.time}
                                </span>
                                {notification.actionUrl && (
                                  <Link
                                    href={notification.actionUrl}
                                    onClick={() => {
                                      markAsRead(notification.id);
                                      setIsOpen(false);
                                    }}
                                    className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                                  >
                                    View <ChevronRight className="w-3 h-3" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                          {!notification.read && (
                            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border bg-muted/30">
                <Link
                  href="/dashboard/conversations"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-primary hover:underline"
                >
                  View all activity
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
