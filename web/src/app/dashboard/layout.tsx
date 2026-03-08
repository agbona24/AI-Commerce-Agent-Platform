"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Zap,
  Bell,
  Search,
  Plus,
  Building2,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// Mock data - in real app, this would come from auth context
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  avatar: null,
  accountType: "agency" as "business" | "agency",
};

const mockWorkspaces = [
  { id: "1", name: "My Agency", type: "agency" as const },
  { id: "2", name: "Acme Dental Clinic", type: "client" as const },
  { id: "3", name: "Lagos Auto Parts", type: "client" as const },
  { id: "4", name: "Fresh Bites Restaurant", type: "client" as const },
];

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Conversations", href: "/dashboard/conversations", icon: MessageSquare, badge: 12 },
  { name: "AI Agents", href: "/dashboard/agents", icon: Bot },
  { name: "Knowledge Base", href: "/dashboard/knowledge", icon: BookOpen },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(mockWorkspaces[0]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close button */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Vivax <span className="text-primary">AI</span></span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workspace Switcher */}
          {mockUser.accountType === "agency" && (
            <div className="p-4 border-b border-border">
              <div className="relative">
                <button
                  onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    currentWorkspace.type === "agency" 
                      ? "bg-gradient-to-br from-violet-500 to-purple-600" 
                      : "bg-gradient-to-br from-emerald-500 to-teal-600"
                  }`}>
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{currentWorkspace.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentWorkspace.type}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${workspaceDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {workspaceDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-2">
                        <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">Workspaces</p>
                        {mockWorkspaces.map((workspace) => (
                          <button
                            key={workspace.id}
                            onClick={() => {
                              setCurrentWorkspace(workspace);
                              setWorkspaceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              currentWorkspace.id === workspace.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              workspace.type === "agency" 
                                ? "bg-gradient-to-br from-violet-500 to-purple-600" 
                                : "bg-gradient-to-br from-emerald-500 to-teal-600"
                            }`}>
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium">{workspace.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{workspace.type}</p>
                            </div>
                            {currentWorkspace.id === workspace.id && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-border p-2">
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-primary">
                          <Plus className="w-4 h-4" />
                          <span className="text-sm font-medium">Add New Client</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {mockUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{mockUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">{mockUser.email}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border w-64 lg:w-80">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations, contacts..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="hidden lg:inline-flex px-2 py-0.5 text-xs font-medium text-muted-foreground bg-background border border-border rounded">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </button>

              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
