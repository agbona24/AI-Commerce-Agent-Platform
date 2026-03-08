"use client";

import { motion } from "framer-motion";
import {
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Users,
  MessageSquare,
  Phone,
  Globe,
  Palette,
  Key,
  ChevronRight,
  Mail,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const settingsSections = [
  {
    title: "Account",
    items: [
      {
        name: "Profile",
        description: "Manage your personal information",
        icon: User,
        href: "/dashboard/settings/profile",
      },
      {
        name: "Business Details",
        description: "Update company information and branding",
        icon: Building2,
        href: "/dashboard/settings/business",
      },
      {
        name: "Team Members",
        description: "Invite and manage team access",
        icon: Users,
        href: "/dashboard/settings/team",
      },
    ],
  },
  {
    title: "Channels",
    items: [
      {
        name: "WhatsApp",
        description: "Connect and configure WhatsApp Business",
        icon: MessageSquare,
        href: "/dashboard/settings/whatsapp",
        status: "connected",
      },
      {
        name: "Voice AI",
        description: "Set up phone number and voice settings",
        icon: Phone,
        href: "/dashboard/settings/voice",
        status: "not_connected",
      },
      {
        name: "Web Widget",
        description: "Customize chat widget for your website",
        icon: Globe,
        href: "/dashboard/settings/widget",
        status: "connected",
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        name: "Notifications",
        description: "Configure alerts and email preferences",
        icon: Bell,
        href: "/dashboard/settings/notifications",
      },
      {
        name: "Appearance",
        description: "Customize theme and display options",
        icon: Palette,
        href: "/dashboard/settings/appearance",
      },
    ],
  },
  {
    title: "Security & Billing",
    items: [
      {
        name: "Security",
        description: "Password, 2FA, and login settings",
        icon: Shield,
        href: "/dashboard/settings/security",
      },
      {
        name: "API Keys",
        description: "Manage API access and webhooks",
        icon: Key,
        href: "/dashboard/settings/api",
      },
      {
        name: "Billing",
        description: "Subscription, invoices, and payment methods",
        icon: CreditCard,
        href: "/dashboard/settings/billing",
      },
    ],
  },
];

function getStatusBadge(status?: string) {
  if (!status) return null;
  
  if (status === "connected") {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-500">
        Connected
      </span>
    );
  }
  
  return (
    <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
      Not Connected
    </span>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            {section.title}
          </h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {section.items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {'status' in item && getStatusBadge(item.status)}
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white"
      >
        <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
        <p className="text-white/80 text-sm mb-4">
          Our support team is available 24/7 to help you get the most out of Vivax AI
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-sm font-medium">
            <Mail className="w-4 h-4" />
            Email Support
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-sm font-medium">
            <MessageSquare className="w-4 h-4" />
            Live Chat
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-sm font-medium">
            <Smartphone className="w-4 h-4" />
            Schedule Call
          </button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border border-red-500/20 rounded-2xl p-6"
      >
        <h3 className="font-semibold text-lg text-red-500 mb-2">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your account and all associated data
        </p>
        <button className="px-4 py-2 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-medium">
          Delete Account
        </button>
      </motion.div>
    </div>
  );
}
