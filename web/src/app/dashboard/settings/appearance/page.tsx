"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Palette,
  Sun,
  Moon,
  Monitor,
  Type,
  Layout,
  Maximize2,
  CheckCircle2,
  Save,
  Eye,
  Grid,
  Sidebar,
  PanelLeftClose,
  Sparkles,
} from "lucide-react";

const themeOptions = [
  { id: "light", name: "Light", icon: Sun, description: "Clean and bright interface" },
  { id: "dark", name: "Dark", icon: Moon, description: "Easier on the eyes" },
  { id: "system", name: "System", icon: Monitor, description: "Match your device settings" },
];

const accentColors = [
  { id: "violet", color: "#7C3AED", name: "Violet" },
  { id: "blue", color: "#3B82F6", name: "Blue" },
  { id: "green", color: "#10B981", name: "Green" },
  { id: "orange", color: "#F97316", name: "Orange" },
  { id: "pink", color: "#EC4899", name: "Pink" },
  { id: "cyan", color: "#06B6D4", name: "Cyan" },
];

const fontSizes = [
  { id: "small", name: "Small", scale: 0.875 },
  { id: "default", name: "Default", scale: 1 },
  { id: "large", name: "Large", scale: 1.125 },
];

const densityOptions = [
  { id: "compact", name: "Compact", description: "Fit more content", icon: Grid },
  { id: "default", name: "Default", description: "Balanced spacing", icon: Layout },
  { id: "comfortable", name: "Comfortable", description: "More breathing room", icon: Maximize2 },
];

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accentColor, setAccentColor] = useState("violet");
  const [fontSize, setFontSize] = useState("default");
  const [density, setDensity] = useState("default");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Set mounted on client side to avoid hydration mismatch
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!mounted) {
    return null;
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
          <h1 className="text-2xl font-bold">Appearance</h1>
          <p className="text-muted-foreground">Customize theme and display options</p>
        </div>
      </div>

      {/* Theme Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Theme
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                theme === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                theme === option.id ? "bg-primary text-white" : "bg-muted"
              }`}>
                <option.icon className="w-6 h-6" />
              </div>
              <p className="font-medium">{option.name}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Accent Color */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Accent Color
        </h2>
        <div className="flex flex-wrap gap-3">
          {accentColors.map((color) => (
            <button
              key={color.id}
              onClick={() => setAccentColor(color.id)}
              className={`group relative w-12 h-12 rounded-xl transition-transform hover:scale-110 ${
                accentColor === color.id ? "ring-2 ring-offset-2 ring-offset-background" : ""
              }`}
              style={{ 
                backgroundColor: color.color,
                "--tw-ring-color": color.color,
              } as React.CSSProperties}
            >
              {accentColor === color.id && (
                <CheckCircle2 className="absolute inset-0 m-auto w-5 h-5 text-white" />
              )}
              <span className="sr-only">{color.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Selected: {accentColors.find(c => c.id === accentColor)?.name}
        </p>
      </motion.div>

      {/* Font Size */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Type className="w-5 h-5 text-primary" />
          Font Size
        </h2>
        <div className="flex gap-3">
          {fontSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => setFontSize(size.id)}
              className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                fontSize === size.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span 
                className="font-medium"
                style={{ fontSize: `${size.scale}rem` }}
              >
                Aa
              </span>
              <p className="text-xs text-muted-foreground mt-1">{size.name}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Density */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Layout className="w-5 h-5 text-primary" />
          Content Density
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {densityOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setDensity(option.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                density === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <option.icon className={`w-6 h-6 mb-2 ${
                density === option.id ? "text-primary" : "text-muted-foreground"
              }`} />
              <p className="font-medium text-sm">{option.name}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Layout Options */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Sidebar className="w-5 h-5 text-primary" />
          Layout Options
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Collapse sidebar by default</p>
                <p className="text-xs text-muted-foreground">Show only icons in sidebar</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sidebarCollapsed}
                onChange={(e) => setSidebarCollapsed(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Enable animations</p>
                <p className="text-xs text-muted-foreground">Smooth transitions and effects</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={animations}
                onChange={(e) => setAnimations(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          Preview
        </h2>
        <div className="p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: accentColors.find(c => c.id === accentColor)?.color }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Sample Card Title</p>
              <p className="text-sm text-muted-foreground">This is how your content will look</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ backgroundColor: accentColors.find(c => c.id === accentColor)?.color }}
            >
              Primary Action
            </button>
            <button className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
              Secondary
            </button>
          </div>
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
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Save className="w-5 h-5" />
              </motion.div>
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
