"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding (always dark) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-950 via-slate-900 to-cyan-950">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 via-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">
              Vivax <span className="text-violet-400">AI</span>
            </span>
          </Link>

          {/* Main content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold leading-tight mb-4 text-white">
                AI-Powered Business
                <br />
                <span className="gradient-text">Automation Platform</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-md">
                Automate customer calls, WhatsApp messages, and sales with intelligent AI agents that work 24/7.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              {[
                "Voice AI that answers calls naturally",
                "WhatsApp automation with product catalogs",
                "Multi-business portfolio for agencies",
                "5-minute setup, no coding required",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-violet-400" />
                  </div>
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-sm text-slate-400">
            © 2026 Vivax AI. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Theme toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-primary to-cyan-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Vivax <span className="text-primary">AI</span>
              </span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
