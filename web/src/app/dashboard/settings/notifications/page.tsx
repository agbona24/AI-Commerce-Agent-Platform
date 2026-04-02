"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { settingsService, NotificationSettings } from "@/lib/api";

interface NotificationToggleProps {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  checked: boolean;
  onChange: () => void;
}

function NotificationToggle({
  id,
  title,
  description,
  icon: Icon,
  iconColor,
  checked,
  onChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-xl">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_new_conversation: true,
    email_conversation_assigned: true,
    email_daily_summary: true,
    push_new_message: true,
    push_escalation: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notification settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notifSettings = await settingsService.getNotifications();
        setSettings(notifSettings);
      } catch (err) {
        console.error("Error loading notification settings:", err);
        // Use defaults if API fails
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await settingsService.updateNotifications(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving notification settings:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save settings";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev: NotificationSettings) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground">Manage how and when you receive alerts</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Email Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h3 className="font-semibold">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Configure which emails you want to receive
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          <NotificationToggle
            id="email_new_conversation"
            title="New conversation started"
            description="Receive an email when a new customer conversation begins"
            icon={MessageSquare}
            iconColor="bg-blue-500/10 text-blue-500"
            checked={settings.email_new_conversation}
            onChange={() => toggleSetting("email_new_conversation")}
          />

          <NotificationToggle
            id="email_conversation_assigned"
            title="Conversation assigned to you"
            description="Receive an email when a conversation is assigned to you"
            icon={MessageSquare}
            iconColor="bg-green-500/10 text-green-500"
            checked={settings.email_conversation_assigned}
            onChange={() => toggleSetting("email_conversation_assigned")}
          />

          <NotificationToggle
            id="email_daily_summary"
            title="Daily summary"
            description="Receive a daily digest of key metrics and activity"
            icon={Mail}
            iconColor="bg-orange-500/10 text-orange-500"
            checked={settings.email_daily_summary}
            onChange={() => toggleSetting("email_daily_summary")}
          />
        </div>
      </motion.div>

      {/* Push Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Configure browser and mobile push notifications
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          <NotificationToggle
            id="push_new_message"
            title="New messages"
            description="Receive push notifications for new messages in conversations"
            icon={MessageSquare}
            iconColor="bg-violet-500/10 text-violet-500"
            checked={settings.push_new_message}
            onChange={() => toggleSetting("push_new_message")}
          />

          <NotificationToggle
            id="push_escalation"
            title="Escalation required"
            description="Receive push notifications when AI requests human intervention"
            icon={AlertTriangle}
            iconColor="bg-red-500/10 text-red-500"
            checked={settings.push_escalation}
            onChange={() => toggleSetting("push_escalation")}
          />
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
