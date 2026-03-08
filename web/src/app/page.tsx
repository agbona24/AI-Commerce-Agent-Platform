"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Bot,
  Clock,
  TrendingUp,
  ArrowRight,
  Check,
  Play,
  Sparkles,
  ShoppingBag,
  Mic,
  MicOff,
  Volume2,
  PhoneCall,
  PhoneOff,
  Send,
  Star,
  Store,
  Package,
  CreditCard,
  Truck,
  Quote,
  Building2,
  Users,
  CheckCircle2,
  X,
  Stethoscope,
  Home as HomeIcon,
  UtensilsCrossed,
  GraduationCap,
  Minimize2,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// Navigation
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25">
              <Bot className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Vivax<span className="text-primary">AI</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">How It Works</a>
            <a href="#voice" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Voice AI</a>
            <a href="#whatsapp" className="text-muted-foreground hover:text-foreground transition-colors font-medium">WhatsApp</a>
            <a href="#industries" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Industries</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
              Sign In
            </Link>
            <Link href="/register" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// Hero Section with Clear Value Proposition
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/50 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-violet-600/20 via-primary/20 to-cyan-500/20 blur-3xl rounded-full" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 blur-3xl rounded-full" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-primary">AI That Actually Works</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Your AI Employee That{" "}
              <span className="relative inline-block">
                <span className="gradient-text">Answers Calls,</span>
              </span>{" "}
              <span className="relative inline-block">
                <span className="gradient-text">Sells Products,</span>
              </span>{" "}
              & Supports Customers <span className="text-cyan-400">24/7</span>
            </motion.h1>

            {/* Clear Value Proposition */}
            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Stop losing customers to missed calls and slow responses. VivaxAI is an intelligent voice + WhatsApp agent that handles calls, answers questions, showcases your products, and closes sales — even while you sleep.
            </motion.p>

            {/* Key Benefits */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-8">
              {[
                { icon: Phone, text: "Voice Calls" },
                { icon: MessageCircle, text: "WhatsApp" },
                { icon: ShoppingBag, text: "Product Sales" },
                { icon: Clock, text: "24/7 Available" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-border text-sm">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 text-white font-semibold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all">
                Start Free — No Card Required
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-border bg-card/50 text-foreground font-semibold text-lg hover:bg-card hover:border-primary/50 transition-all">
                <Play className="w-5 h-5 text-primary" />
                Watch 2-Min Demo
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div variants={fadeInUp} className="flex items-center gap-6 mt-10 pt-10 border-t border-border/50">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 border-2 border-background flex items-center justify-center text-white text-xs font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Trusted by <span className="text-foreground font-medium">2,500+</span> businesses</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Visual Demo */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative">
            <HeroPhoneDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Hero Phone Demo - Shows live call visualization
function HeroPhoneDemo() {
  const [isCallActive, setIsCallActive] = useState(true);
  const [callDuration, setCallDuration] = useState(45);

  useEffect(() => {
    if (isCallActive) {
      const interval = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative">
      {/* Floating elements */}
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-4 -left-8 p-4 rounded-2xl bg-card border border-border shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-semibold">+47% Sales</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
        </div>
      </motion.div>

      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute -bottom-4 -right-8 p-4 rounded-2xl bg-card border border-border shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <p className="text-sm font-semibold">1,247 Chats</p>
            <p className="text-xs text-muted-foreground">Handled today</p>
          </div>
        </div>
      </motion.div>

      {/* Main Phone Mockup */}
      <div className="relative mx-auto w-[300px] sm:w-[340px]">
        {/* Phone frame */}
        <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-black/50 border border-gray-800">
          {/* Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-10" />
          
          {/* Screen */}
          <div className="relative bg-gradient-to-b from-violet-950 via-background to-background rounded-[2.5rem] overflow-hidden aspect-[9/19]">
            {/* Call UI */}
            <div className="absolute inset-0 flex flex-col">
              {/* Caller info */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 pt-16">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">JD</span>
                  </div>
                  {isCallActive && (
                    <div className="absolute inset-0 rounded-full border-4 border-green-500/50 animate-ping" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-1">John Doe</h3>
                <p className="text-muted-foreground text-sm mb-2">+234 801 234 5678</p>
                <div className="flex items-center gap-2 text-green-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">{formatTime(callDuration)}</span>
                </div>

                {/* Voice waveform */}
                <div className="flex items-center justify-center gap-1 mt-6 h-12">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: isCallActive ? [8, 32, 8] : 8 }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.08,
                        ease: "easeInOut",
                      }}
                      className="w-1 bg-gradient-to-t from-primary to-cyan-400 rounded-full"
                    />
                  ))}
                </div>

                {/* AI Transcript */}
                <div className="mt-6 w-full px-4">
                  <div className="bg-card/50 rounded-2xl p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">AI Responding</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      &quot;Great! I can help you with that. Let me check our latest products for you...&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Call Controls */}
              <div className="p-6 pb-10">
                <div className="flex items-center justify-center gap-6">
                  <button className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                    <Volume2 className="w-6 h-6" />
                  </button>
                  <button className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                    {isCallActive ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => setIsCallActive(!isCallActive)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isCallActive ? "bg-red-500" : "bg-green-500"
                    }`}
                  >
                    {isCallActive ? <PhoneOff className="w-7 h-7 text-white" /> : <PhoneCall className="w-7 h-7 text-white" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-600/30 via-primary/30 to-cyan-500/30 blur-3xl rounded-full scale-150" />
      </div>
    </div>
  );
}

// Integrations Section
function Integrations() {
  const integrations = [
    {
      name: "WhatsApp",
      logo: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      description: "Official Business API",
    },
    {
      name: "Paystack",
      logo: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#00C3F7">
          <path d="M2 4h20v2H2V4zm0 7h20v2H2v-2zm0 7h20v2H2v-2z"/>
        </svg>
      ),
      description: "Accept Payments",
    },
    {
      name: "Flutterwave",
      logo: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#F5A623">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
      description: "Payment Gateway",
    },
    {
      name: "Shopify",
      logo: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#96BF48">
          <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-.843-.823-1.13-1.11c-.29-.29-.85-.203-1.07-.138-.026.008-.474.147-.88.273-.066-.191-.145-.396-.243-.609-.365-.832-.9-1.272-1.55-1.274h-.002c-.045 0-.091.004-.136.01-.02-.024-.04-.046-.061-.068-.421-.434-.962-.641-1.605-.618-1.248.044-2.49 1.003-3.498 2.702-.709 1.193-1.248 2.69-1.399 3.848-.785.244-1.334.414-1.334.414-.396.124-.409.137-.461.511-.039.28-.787 6.053-.787 6.053l9.295 1.736.003-.003zM10.93 7.56c-.645.2-1.35.419-2.023.628.195-.754.566-1.506 1.02-1.996.171-.184.411-.388.681-.503.27.537.329 1.263.322 1.871zm-1.583-3.13c.146 0 .272.025.382.073-.256.126-.503.322-.737.587-.603.681-1.064 1.741-1.253 2.771-.56.173-1.112.345-1.607.498.368-1.67 1.788-3.881 3.215-3.929zm.695 8.678c.053.878.942 1.324.955 1.332l-.002.003c.008.006.86.513.925 1.333.089 1.137-.768 2.262-2.273 2.262-.233 0-.477-.024-.729-.071-.878-.168-1.564-.536-2.073-1.054.348-.01.67-.047.963-.11.752-.164.956-.515.983-.797.053-.548-.441-.875-.813-1.109-.227-.143-.444-.279-.584-.442-.39-.454-.393-1.008-.015-1.523.242-.328.619-.53 1.046-.53.157 0 .32.025.487.072.398.112.68.322.867.518.084.088.158.18.215.269.041-.095.084-.188.128-.278-.056-.051-.114-.1-.173-.148-.261-.21-.573-.394-.922-.509a2.62 2.62 0 00-.797-.119c-.766 0-1.434.392-1.844 1.054-.49.789-.441 1.777.112 2.421.227.264.51.465.82.63-.392.187-.879.292-1.495.292-.168 0-.338-.008-.507-.025v.003c-.9-.086-1.642-.396-2.173-.88.06-.003.119-.006.178-.01 2.687-.21 3.677-1.768 3.815-3.015.08-.73-.088-1.248-.18-1.553l.009-.003c.008.024.016.047.024.07.069.192.162.385.286.566zm2.043-7.251c.008.452-.038.941-.128 1.432-.663.205-1.386.43-2.088.647.222-.984.648-1.957 1.16-2.58.194-.236.464-.474.779-.608-.043.357-.053.725-.044 1.109h.321z"/>
        </svg>
      ),
      description: "E-commerce Sync",
    },
    {
      name: "Retell AI",
      logo: (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Phone className="w-4 h-4 text-white" />
        </div>
      ),
      description: "Voice AI Engine",
    },
    {
      name: "OpenAI",
      logo: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
        </svg>
      ),
      description: "GPT-4 Powered",
    },
  ];

  return (
    <section className="py-20 border-y border-border/50 bg-gradient-to-b from-background to-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
          <motion.p variants={fadeInUp} className="text-sm text-muted-foreground mb-4">POWERED BY INDUSTRY LEADERS</motion.p>
          <motion.h3 variants={fadeInUp} className="text-2xl sm:text-3xl font-bold">Seamless <span className="gradient-text">Integrations</span></motion.h3>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {integrations.map((integration) => (
            <motion.div
              key={integration.name}
              variants={scaleIn}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 text-center"
            >
              <div className="flex justify-center mb-3">{integration.logo}</div>
              <p className="font-semibold text-sm mb-1">{integration.name}</p>
              <p className="text-xs text-muted-foreground">{integration.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// What You Get Section - Clear breakdown
function WhatYouGet() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">What You Get</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            A Complete AI Team,{" "}
            <span className="gradient-text">Not Just a Chatbot</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            VivaxAI combines voice calls, WhatsApp messaging, and e-commerce in one intelligent platform that actually understands your business.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Phone,
              title: "AI Voice Receptionist",
              description: "Answers every call professionally. Takes messages, schedules appointments, transfers to humans when needed. Sounds natural, not robotic.",
              features: ["Natural conversation", "Call routing", "Appointment booking", "Message taking"],
              color: "from-violet-500 to-purple-600",
            },
            {
              icon: MessageCircle,
              title: "WhatsApp AI Agent",
              description: "Instant replies to customer messages. Handles inquiries, shares product info, and processes orders via WhatsApp automatically.",
              features: ["Instant responses", "Product catalogs", "Order processing", "Payment links"],
              color: "from-green-500 to-emerald-600",
            },
            {
              icon: ShoppingBag,
              title: "Commerce Assistant",
              description: "Your AI sales agent that showcases products, answers questions, and guides customers through purchases 24/7.",
              features: ["Product recommendations", "Inventory checks", "Price quotes", "Sales closing"],
              color: "from-cyan-500 to-blue-600",
            },
          ].map((item) => (
            <motion.div key={item.title} variants={fadeInUp} className="group relative p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-500">
              {/* Gradient hover effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground mb-6">{item.description}</p>
              
              <ul className="space-y-2">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Voice AI Demo Section
function VoiceAIDemo() {
  const [activeMessage, setActiveMessage] = useState(0);

  const conversation = [
    { type: "caller", text: "Hi, I want to know your business hours" },
    { type: "ai", text: "Hello! Thanks for calling Acme Electronics. We're open Monday to Saturday, 9 AM to 8 PM. Is there anything specific you'd like to know about our services?" },
    { type: "caller", text: "Do you have iPhone 15 Pro in stock?" },
    { type: "ai", text: "Yes, we have the iPhone 15 Pro available in all colors! The 256GB model is ₦1,450,000 and the 512GB is ₦1,750,000. Would you like me to reserve one for you?" },
    { type: "caller", text: "Can I come pick it up today?" },
    { type: "ai", text: "Absolutely! I've marked the 256GB Space Black as reserved for you. Just ask for Sarah at the counter. Can I get your name for the reservation?" },
  ];

  const conversationLength = conversation.length;
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMessage((prev) => (prev < conversationLength - 1 ? prev + 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, [conversationLength]);

  return (
    <section id="voice" className="py-24 bg-gradient-to-b from-card/50 to-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-violet-500/10 blur-3xl rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <Phone className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-500">Voice AI</span>
            </motion.div>

            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-6">
              Every Call Answered.<br />
              <span className="text-violet-400">Every Customer Impressed.</span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground mb-8">
              Your AI receptionist speaks naturally, understands context, and handles complex conversations. No more voicemail, no more missed opportunities.
            </motion.p>

            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4 mb-8">
              {[
                { value: "2.1s", label: "Avg Answer Time" },
                { value: "95%", label: "Resolution Rate" },
                { value: "24/7", label: "Availability" },
                { value: "40+", label: "Languages" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border">
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/25">
                Try Voice AI Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Live Demo */}
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="relative p-6 rounded-3xl bg-card border border-border shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Live Call Demo</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-muted-foreground">In Progress</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">03:24</div>
              </div>

              {/* Conversation */}
              <div className="space-y-4 min-h-[400px]">
                <AnimatePresence mode="popLayout">
                  {conversation.slice(0, activeMessage + 1).map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.type === "ai" ? "justify-start" : "justify-end"}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.type === "ai"
                          ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30"
                          : "bg-muted"
                      }`}>
                        {msg.type === "ai" && (
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-4 h-4 text-violet-500" />
                            <span className="text-xs font-medium text-violet-500">AI Agent</span>
                          </div>
                        )}
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Voice waveform indicator */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-1">
                {[25, 32, 18, 38, 22, 35, 28, 40, 15, 33, 26, 37, 20, 30, 24, 36, 19, 34, 27, 31].map((height, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, height, 4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
                    className="w-1 bg-gradient-to-t from-violet-500 to-purple-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// WhatsApp Commerce Demo
function WhatsAppDemo() {
  const [selectedProduct, setSelectedProduct] = useState(0);

  const products = [
    { name: "iPhone 15 Pro Max", price: "₦1,850,000", image: "📱", inStock: true },
    { name: "MacBook Pro 16\"", price: "₦2,450,000", image: "💻", inStock: true },
    { name: "AirPods Pro 2", price: "₦185,000", image: "🎧", inStock: false },
  ];

  return (
    <section id="whatsapp" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-green-500/10 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Phone mockup */}
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="order-2 lg:order-1">
            <div className="relative mx-auto w-[300px] sm:w-[320px]">
              {/* Phone frame */}
              <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-black/50 border border-gray-800">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-10" />
                
                {/* WhatsApp Screen */}
                <div className="bg-[#111b21] rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  {/* WhatsApp Header */}
                  <div className="bg-[#202c33] px-4 py-3 pt-12 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">TechStore AI</p>
                      <p className="text-xs text-green-500">online</p>
                    </div>
                  </div>

                  {/* Chat area */}
                  <div className="p-3 space-y-3 h-[380px] overflow-y-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiIGZpbGw9IiMwYjE0MWEiLz4KPC9zdmc+')] bg-repeat">
                    {/* AI Message */}
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                        <p className="text-sm text-white">Hello! 👋 Welcome to TechStore. I can help you browse products, check prices, or place an order. What are you looking for?</p>
                        <p className="text-xs text-gray-500 text-right mt-1">10:30 AM</p>
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                        <p className="text-sm text-white">Show me your latest phones</p>
                        <p className="text-xs text-gray-400 text-right mt-1">10:31 AM ✓✓</p>
                      </div>
                    </div>

                    {/* Product Catalog */}
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%]">
                        <p className="text-sm text-white mb-2">Here are our top phones! 📱</p>
                        <div className="space-y-2">
                          {products.map((product, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedProduct(idx)}
                              className={`p-2 rounded-xl bg-[#0b141a] border cursor-pointer transition-all ${
                                selectedProduct === idx ? "border-green-500" : "border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{product.image}</span>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-white">{product.name}</p>
                                  <p className="text-xs text-green-500">{product.price}</p>
                                </div>
                                {product.inStock ? (
                                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-500">In Stock</span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-500">Out</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 text-right mt-2">10:31 AM</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 px-2">
                      <button className="px-3 py-1.5 rounded-full bg-[#202c33] border border-green-500/30 text-xs text-white">
                        💳 Pay Now
                      </button>
                      <button className="px-3 py-1.5 rounded-full bg-[#202c33] border border-green-500/30 text-xs text-white">
                        🚚 Delivery Info
                      </button>
                      <button className="px-3 py-1.5 rounded-full bg-[#202c33] border border-green-500/30 text-xs text-white">
                        💬 Speak to Human
                      </button>
                    </div>
                  </div>

                  {/* Input area */}
                  <div className="absolute bottom-8 left-3 right-3 flex items-center gap-2">
                    <div className="flex-1 bg-[#202c33] rounded-full px-4 py-2 flex items-center">
                      <input type="text" placeholder="Type a message" className="bg-transparent text-white text-sm flex-1 outline-none" />
                    </div>
                    <button className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 bg-green-500/20 blur-3xl rounded-full scale-150" />
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="order-1 lg:order-2">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">WhatsApp Commerce</span>
            </motion.div>

            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-6">
              Turn WhatsApp Into Your<br />
              <span className="text-green-400">24/7 Sales Machine</span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground mb-8">
              Your AI agent showcases products, answers questions, processes orders, and accepts payments — all within WhatsApp. Customers never need to leave the app.
            </motion.p>

            <motion.div variants={fadeInUp} className="space-y-4 mb-8">
              {[
                { icon: Package, text: "Product catalogs with images and pricing" },
                { icon: CreditCard, text: "In-chat payment links (Paystack, Flutterwave)" },
                { icon: Truck, text: "Order tracking and delivery updates" },
                { icon: Users, text: "Seamless handoff to human agents" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-green-500" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/25">
                Connect WhatsApp
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Commerce AI Section - Product Shopping
function CommerceDemo() {
  return (
    <section id="commerce" className="py-24 bg-gradient-to-b from-background to-card/50 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <ShoppingBag className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-medium text-cyan-500">AI Commerce</span>
          </motion.div>

          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            An AI Salesperson That{" "}
            <span className="text-cyan-400">Never Sleeps</span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your product catalog once. Your AI learns everything — prices, features, availability — and sells for you around the clock.
          </motion.p>
        </motion.div>

        {/* Product Demo Grid */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { emoji: "📱", name: "iPhone 15 Pro", price: "₦1,450,000", category: "Phones" },
            { emoji: "💻", name: "MacBook Air M3", price: "₦1,200,000", category: "Laptops" },
            { emoji: "⌚", name: "Apple Watch Ultra", price: "₦650,000", category: "Watches" },
            { emoji: "🎧", name: "AirPods Max", price: "₦480,000", category: "Audio" },
          ].map((product) => (
            <motion.div key={product.name} variants={scaleIn} className="group p-6 rounded-2xl bg-card border border-border hover:border-cyan-500/50 transition-all duration-300">
              <div className="text-5xl mb-4">{product.emoji}</div>
              <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
              <h4 className="font-semibold mb-2">{product.name}</h4>
              <p className="text-lg font-bold text-cyan-400">{product.price}</p>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-green-500">● In Stock</span>
                <button className="text-xs text-primary hover:underline">Ask AI →</button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Sales Conversation Example */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="max-w-3xl mx-auto">
          <div className="p-8 rounded-3xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">AI Sales Conversation</p>
                <p className="text-sm text-muted-foreground">How your AI handles product inquiries</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="bg-primary/10 rounded-2xl px-4 py-2 max-w-[80%]">
                  <p className="text-sm">I need a laptop for video editing, budget is around 1.5M</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl px-4 py-3 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs font-medium text-cyan-500">AI Agent</span>
                  </div>
                  <p className="text-sm">Perfect! For video editing at that budget, I recommend the <strong>MacBook Pro 14&quot; M3 Pro</strong> at ₦1,450,000. It has incredible performance with:</p>
                  <ul className="text-sm mt-2 space-y-1 ml-4 list-disc">
                    <li>18GB unified memory</li>
                    <li>512GB SSD storage</li>
                    <li>ProRes acceleration</li>
                    <li>18-hour battery life</li>
                  </ul>
                  <p className="text-sm mt-2">Would you like to see a comparison with other options, or shall I proceed with this one?</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Industry Use Cases Section
function IndustryUseCases() {
  const industries = [
    {
      icon: Stethoscope,
      name: "Dental Clinics",
      color: "from-blue-500 to-cyan-500",
      tagline: "Never miss an appointment booking",
      conversation: [
        { type: "user", text: "Hi, I need to book an appointment for teeth cleaning" },
        { type: "ai", text: "Hello! I'd be happy to help you book a teeth cleaning appointment at Smile Dental. We have availability tomorrow at 10 AM, 2 PM, or Thursday at 9 AM. Which works best for you?" },
        { type: "user", text: "Tomorrow 2 PM works" },
        { type: "ai", text: "Perfect! I've booked your teeth cleaning for tomorrow at 2 PM with Dr. Adaeze. You'll receive an SMS confirmation shortly. Please arrive 10 minutes early. Is there anything else I can help with?" },
      ],
      stats: ["85% booking rate", "Zero missed calls", "24/7 scheduling"],
    },
    {
      icon: HomeIcon,
      name: "Real Estate",
      color: "from-emerald-500 to-green-500",
      tagline: "Qualify leads while you sleep",
      conversation: [
        { type: "user", text: "I saw your listing for the 3-bedroom in Lekki" },
        { type: "ai", text: "Great choice! That's our premium 3-bedroom apartment in Lekki Phase 1. It's ₦85M with 4 bathrooms, a home office, and 24/7 security. Are you looking to buy for personal use or investment?" },
        { type: "user", text: "Investment. What's the rental yield?" },
        { type: "ai", text: "Excellent! Properties in that area yield 6-8% annually. Current market rent is ₦6.5M/year. I can schedule a viewing with our agent David. He's available tomorrow or Saturday. Which works?" },
      ],
      stats: ["3x more leads", "40% qualified", "Instant response"],
    },
    {
      icon: Stethoscope,
      name: "Healthcare",
      color: "from-rose-500 to-pink-500",
      tagline: "Compassionate care, automated",
      conversation: [
        { type: "user", text: "I need to refill my prescription" },
        { type: "ai", text: "I can help with that. Can you please provide your patient ID or the name the prescription is under?" },
        { type: "user", text: "Chinedu Okafor, ID 45892" },
        { type: "ai", text: "Thank you, Mr. Okafor. I see your Metformin prescription is due for refill. I've sent the request to our pharmacy. It will be ready for pickup in 2 hours. Would you like us to prepare delivery instead?" },
      ],
      stats: ["50% less hold time", "HIPAA compliant", "Prescription refills"],
    },
    {
      icon: ShoppingBag,
      name: "E-Commerce",
      color: "from-orange-500 to-amber-500",
      tagline: "Turn browsers into buyers",
      conversation: [
        { type: "user", text: "Do you have Nike Air Max in size 43?" },
        { type: "ai", text: "Yes! We have the Nike Air Max 90 in size 43 available in white, black, and the new infrared colorway. Prices start at ₦125,000. Want me to show you pictures?" },
        { type: "user", text: "Show me the infrared" },
        { type: "ai", text: "[Image] Here's the Nike Air Max 90 Infrared in size 43. It's ₦145,000 with free delivery in Lagos. I can send you a payment link right now — would you like to proceed?" },
      ],
      stats: ["32% conversion", "AOV +₦15K", "Auto upsells"],
    },
    {
      icon: UtensilsCrossed,
      name: "Restaurants",
      color: "from-red-500 to-rose-500",
      tagline: "Fill every table, automatically",
      conversation: [
        { type: "user", text: "Do you have a table for 4 tonight?" },
        { type: "ai", text: "Hello! Welcome to Lagos Grill. For tonight, we have availability at 6:30 PM or 8:45 PM for a party of 4. We also have a special Chef's Table experience available. Which time works for you?" },
        { type: "user", text: "8:45 PM please" },
        { type: "ai", text: "Booked! Table for 4 at 8:45 PM tonight. Would you like to pre-order any dishes? Our Suya Platter and Jollof Rice are customer favorites. You'll receive a confirmation SMS shortly." },
      ],
      stats: ["90% table fill rate", "Pre-orders +25%", "No-show alerts"],
    },
    {
      icon: GraduationCap,
      name: "Education",
      color: "from-violet-500 to-purple-500",
      tagline: "Enroll more students",
      conversation: [
        { type: "user", text: "What courses do you offer for data science?" },
        { type: "ai", text: "We offer 3 data science programs: Beginner (3 months, ₦250K), Professional (6 months, ₦450K), and Executive (12 months, ₦850K). All include job placement support. Which level interests you?" },
        { type: "user", text: "Professional. When's the next cohort?" },
        { type: "ai", text: "Our Professional Data Science cohort starts March 15th. Only 8 spots left! Would you like to schedule a free consultation call with our admissions team, or I can send you the enrollment form now?" },
      ],
      stats: ["2x enrollments", "Lead nurturing", "Auto follow-ups"],
    },
  ];

  const [activeIndustry, setActiveIndustry] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    // Reset message index asynchronously when industry changes
    const resetFrame = requestAnimationFrame(() => setMsgIndex(0));
    const maxMsgs = industries[activeIndustry].conversation.length - 1;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev < maxMsgs ? prev + 1 : 0));
    }, 3000);
    return () => {
      cancelAnimationFrame(resetFrame);
      clearInterval(interval);
    };
  }, [activeIndustry, industries]);

  const currentIndustry = industries[activeIndustry];

  return (
    <section id="industries" className="py-24 bg-gradient-to-b from-card/50 to-background relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-violet-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Industry Solutions</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Built For <span className="gradient-text">Your Industry</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how businesses like yours use VivaxAI to transform customer interactions
          </motion.p>
        </motion.div>

        {/* Industry Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {industries.map((industry, idx) => (
            <button
              key={industry.name}
              onClick={() => setActiveIndustry(idx)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${activeIndustry === idx
                ? `bg-gradient-to-r ${industry.color} text-white shadow-lg`
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              <industry.icon className="w-4 h-4" />
              {industry.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={currentIndustry.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left: Conversation Demo */}
          <div className="p-6 rounded-3xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentIndustry.color} flex items-center justify-center`}>
                <currentIndustry.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">{currentIndustry.name}</p>
                <p className="text-sm text-muted-foreground">{currentIndustry.tagline}</p>
              </div>
            </div>

            <div className="space-y-4 min-h-[280px]">
              <AnimatePresence mode="popLayout">
                {currentIndustry.conversation.slice(0, msgIndex + 1).map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === "ai" ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.type === "ai"
                      ? `bg-gradient-to-r ${currentIndustry.color}/20 border border-${currentIndustry.color.split("-")[1]}-500/30`
                      : "bg-muted"
                    }`}>
                      {msg.type === "ai" && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium text-primary">AI Agent</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Stats & Benefits */}
          <div>
            <h3 className="text-2xl font-bold mb-4">{currentIndustry.name} AI Agent</h3>
            <p className="text-muted-foreground mb-8">
              Deployed in minutes, trained on your specific business needs. Handle appointments, inquiries, and sales automatically.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {currentIndustry.stats.map((stat) => (
                <div key={stat} className="p-4 rounded-xl bg-card border border-border text-center">
                  <p className="text-sm font-semibold gradient-text">{stat}</p>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${currentIndustry.color} text-white font-semibold shadow-lg hover:opacity-90 transition-opacity`}
            >
              Get AI for {currentIndustry.name}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Results Section - Before/After
function Results() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Real Results From{" "}
            <span className="gradient-text">Real Businesses</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what happens when you deploy VivaxAI
          </motion.p>
        </motion.div>

        {/* Before/After Comparison */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Before */}
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold">Before VivaxAI</p>
                <p className="text-sm text-muted-foreground">The struggle was real</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                "60% of calls went to voicemail",
                "Average response time: 4+ hours",
                "Lost $15K+/month in missed sales",
                "Staff overwhelmed with repetitive queries",
                "No 24/7 support capability",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-red-200/80">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* After */}
          <motion.div variants={fadeInUp} className="p-8 rounded-3xl bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="font-semibold">After VivaxAI</p>
                <p className="text-sm text-muted-foreground">The transformation</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                "100% of calls answered instantly",
                "Average response time: 2 seconds",
                "47% increase in monthly revenue",
                "Staff focused on high-value tasks",
                "True 24/7/365 availability",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-green-200/80">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: "47%", label: "Revenue Increase", color: "text-green-400" },
            { value: "95%", label: "Calls Answered", color: "text-violet-400" },
            { value: "60%", label: "Cost Reduction", color: "text-cyan-400" },
            { value: "4.9★", label: "Customer Rating", color: "text-yellow-400" },
          ].map((stat) => (
            <motion.div key={stat.label} variants={scaleIn} className="p-6 rounded-2xl bg-card border border-border text-center">
              <div className={`text-4xl sm:text-5xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Testimonials
function Testimonials() {
  const testimonials = [
    {
      quote: "VivaxAI transformed our business. We went from missing 60% of calls to capturing every lead. Our revenue increased 47% in 3 months.",
      name: "Adaeze Okonkwo",
      role: "CEO, TechRetail Nigeria",
      avatar: "AO",
    },
    {
      quote: "The WhatsApp integration is incredible. Customers can browse products, ask questions, and pay — all without leaving the chat. It's like having 20 sales reps working 24/7.",
      name: "David Mensah",
      role: "Founder, ShopGhana",
      avatar: "DM",
    },
    {
      quote: "Setup took 5 minutes. Literally. I uploaded our product list, and the AI started handling customer queries immediately. Best investment we've made.",
      name: "Fatima Hassan",
      role: "Operations Manager, MobileHub",
      avatar: "FH",
    },
  ];

  return (
    <section className="py-24 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-6">
            Loved by <span className="gradient-text">Business Owners</span>
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.name} variants={fadeInUp} className="p-8 rounded-3xl bg-card border border-border">
              <Quote className="w-10 h-10 text-primary/30 mb-4" />
              <p className="text-muted-foreground mb-6">&quot;{testimonial.quote}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Pricing Section
function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "₦25,000",
      period: "/month",
      description: "Perfect for small businesses",
      features: [
        "1 AI Agent",
        "500 conversations/mo",
        "WhatsApp or Voice (pick one)",
        "Basic product catalog (50 items)",
        "Email support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "₦75,000",
      period: "/month",
      description: "For growing businesses",
      features: [
        "3 AI Agents",
        "5,000 conversations/mo",
        "WhatsApp + Voice calls",
        "Full product catalog (500 items)",
        "Payment integration",
        "Priority support",
        "Analytics dashboard",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Unlimited AI Agents",
        "Unlimited conversations",
        "All channels + API access",
        "Unlimited products",
        "Custom AI training",
        "Dedicated account manager",
        "White-label option",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free for 14 days. No credit card required.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeInUp}
              className={`relative p-8 rounded-3xl ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/10 to-card border-2 border-primary shadow-xl shadow-primary/10"
                  : "bg-card border border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 text-white text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.name === "Enterprise" ? "/contact" : "/register"}
                className={`block w-full py-3 rounded-full font-semibold text-center transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-violet-600 via-primary to-cyan-500 text-white hover:opacity-90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Final CTA
function FinalCTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-violet-950 via-primary/20 to-cyan-950 border border-primary/30 text-center overflow-hidden"
        >
          {/* Background effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 via-primary to-cyan-500 flex items-center justify-center mb-8 shadow-2xl shadow-primary/50">
              <Bot className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Never Miss<br />
              <span className="gradient-text">Another Customer?</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join 2,500+ businesses using VivaxAI to automate customer interactions. Setup takes 5 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="px-10 py-4 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 text-white font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Interactive Live Chat Demo Widget
function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{type: 'user' | 'ai', text: string}[]>([
    { type: 'ai', text: "Hi! 👋 I'm VivaxAI. Try asking me anything — like \"What are your prices?\" or \"Book an appointment\"" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const aiResponses: { [key: string]: string } = {
    'price': "Our plans start at ₦25,000/month for Starter, ₦75,000/month for Professional, and custom pricing for Enterprise. All plans include a 14-day free trial! Would you like me to help you choose the right plan?",
    'appointment': "I'd be happy to schedule an appointment for you! We have availability tomorrow at 10 AM, 2 PM, or 4 PM. Which time works best for you?",
    'demo': "Great! I can show you a live demo right now. What industry are you in? (E.g., Dental, Real Estate, E-commerce, Restaurant)",
    'work': "VivaxAI works in 3 simple steps: 1) Connect your WhatsApp/Phone, 2) Upload your business info, 3) Go live in 5 minutes! Your AI agent then handles calls, messages, and sales 24/7.",
    'whatsapp': "Yes! We integrate directly with WhatsApp Business API. Your AI can respond to messages, share product catalogs, send payment links, and even process orders — all automatically.",
    'voice': "Our voice AI sounds incredibly natural! Powered by Retell AI, it can answer calls, schedule appointments, take messages, and transfer to humans when needed. Want to hear a sample?",
    'hello': "Hello! Welcome to VivaxAI. I'm here to help you learn how our AI can automate your customer calls, WhatsApp messages, and sales. What would you like to know?",
    'hi': "Hey there! 👋 Thanks for trying out VivaxAI. I'm an AI assistant — ask me about pricing, features, or how we can help your business!",
    'help': "I can help you with: \n• Pricing & plans\n• Product features\n• Scheduling a demo\n• Industry-specific solutions\n\nJust type your question!",
    'default': "That's a great question! Our team would love to give you a detailed answer. Would you like me to schedule a quick call with a product specialist, or I can send you more information via email?"
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('how much')) return aiResponses['price'];
    if (lowerMsg.includes('appointment') || lowerMsg.includes('book') || lowerMsg.includes('schedule')) return aiResponses['appointment'];
    if (lowerMsg.includes('demo') || lowerMsg.includes('show')) return aiResponses['demo'];
    if (lowerMsg.includes('work') || lowerMsg.includes('how')) return aiResponses['work'];
    if (lowerMsg.includes('whatsapp')) return aiResponses['whatsapp'];
    if (lowerMsg.includes('voice') || lowerMsg.includes('call')) return aiResponses['voice'];
    if (lowerMsg.includes('hello')) return aiResponses['hello'];
    if (lowerMsg.includes('hi') || lowerMsg.includes('hey')) return aiResponses['hi'];
    if (lowerMsg.includes('help')) return aiResponses['help'];
    return aiResponses['default'];
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'ai', text: getAIResponse(userMessage) }]);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500 text-white shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform ${isOpen ? 'hidden' : ''}`}
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-card rounded-3xl shadow-2xl border border-border overflow-hidden ${isMinimized ? 'h-[72px]' : 'h-[550px] max-h-[calc(100vh-48px)]'}`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 via-primary to-cyan-500 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">VivaxAI</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-white/80">Online • Try me!</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  {isMinimized ? <Maximize2 className="w-4 h-4 text-white" /> : <Minimize2 className="w-4 h-4 text-white" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto h-[390px] space-y-4 bg-background">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'ai' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.type === 'ai' ? 'bg-card border border-border' : 'bg-gradient-to-r from-violet-600 to-primary text-white'}`}>
                        {msg.type === 'ai' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-3 h-3 text-primary" />
                            <span className="text-xs font-medium text-primary">VivaxAI</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-card border border-border rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Replies */}
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                  {['Pricing', 'How it works', 'Book demo'].map((quick) => (
                    <button
                      key={quick}
                      onClick={() => {
                        setInput(quick);
                        setTimeout(() => handleSend(), 100);
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors whitespace-nowrap"
                    >
                      {quick}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-background border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Powered by VivaxAI • <button className="text-primary hover:underline">Start free trial</button>
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-border py-16 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-primary to-cyan-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">VivaxAI</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-xs">
              AI-powered voice and WhatsApp automation for businesses that want to scale without limits.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#voice" className="hover:text-foreground transition-colors">Voice AI</a></li>
              <li><a href="#whatsapp" className="hover:text-foreground transition-colors">WhatsApp</a></li>
              <li><a href="#commerce" className="hover:text-foreground transition-colors">Commerce</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 VivaxAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>🇳🇬 Made in Nigeria</span>
            <span>🌍 Serving Africa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Page
export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Integrations />
      <WhatYouGet />
      <VoiceAIDemo />
      <WhatsAppDemo />
      <CommerceDemo />
      <IndustryUseCases />
      <Results />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
      <LiveChatWidget />
    </main>
  );
}
