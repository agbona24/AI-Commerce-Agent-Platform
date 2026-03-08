"use client";

import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Bot,
  Zap,
  Clock,
  Globe,
  Shield,
  TrendingUp,
  Users,
  Headphones,
  ArrowRight,
  Check,
  Play,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Navigation
function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Nexus AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">
              Use Cases
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// Hero Section
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">AI-Powered Business Automation</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Your Business Never
            <br />
            <span className="gradient-text">Sleeps Anymore</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            AI agents that answer calls, respond to WhatsApp messages, and handle
            customer support 24/7. Set up in 5 minutes, no coding required.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/register"
              className="group px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold text-lg flex items-center gap-2 hover:opacity-90 transition-all glow"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 rounded-full border border-border bg-card text-foreground font-semibold text-lg flex items-center gap-2 hover:bg-muted/50 transition-colors">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          >
            {[
              { value: "10K+", label: "Calls Handled" },
              { value: "50K+", label: "Messages Sent" },
              { value: "99.9%", label: "Uptime" },
              { value: "<2s", label: "Response Time" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* AI Visualization */}
          <motion.div
            variants={fadeInUp}
            className="relative mt-16 mx-auto max-w-4xl"
          >
            <AIVisualization />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// AI Visualization Component
function AIVisualization() {
  return (
    <div className="relative">
      {/* Central orb */}
      <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 blur-xl pulse-ring" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-accent opacity-40 blur-lg pulse-ring" style={{ animationDelay: "0.5s" }} />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center glow">
          <Bot className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
        </div>
      </div>

      {/* Floating icons */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 left-1/4 sm:left-1/3 p-3 rounded-xl bg-card border border-border"
      >
        <Phone className="w-6 h-6 text-primary" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-8 right-1/4 sm:right-1/3 p-3 rounded-xl bg-card border border-border"
      >
        <MessageCircle className="w-6 h-6 text-accent" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 left-1/3 p-3 rounded-xl bg-card border border-border"
      >
        <Headphones className="w-6 h-6 text-secondary" />
      </motion.div>
    </div>
  );
}

// Features Section
function Features() {
  const features = [
    {
      icon: Phone,
      title: "Voice AI Calls",
      description: "Natural voice conversations powered by advanced AI. Answers calls, takes messages, and routes inquiries.",
      color: "text-primary",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Automation",
      description: "Instant replies to WhatsApp messages. Handle orders, answer questions, and engage customers.",
      color: "text-accent",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Never miss a call or message. Your AI agent works round the clock, every day of the year.",
      color: "text-secondary",
    },
    {
      icon: Zap,
      title: "5-Minute Setup",
      description: "No coding required. Enter your business details, customize your agent, and go live instantly.",
      color: "text-yellow-500",
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Communicate in multiple languages. AI automatically detects and responds in the customer's language.",
      color: "text-green-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption, GDPR compliant, and SOC 2 certified. Your data is always protected.",
      color: "text-red-500",
    },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to
            <span className="gradient-text"> Automate</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features that transform how you engage with customers
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Use Cases Section
function UseCases() {
  const [activeTab, setActiveTab] = useState(0);

  const useCases = [
    {
      id: "receptionist",
      icon: Headphones,
      title: "AI Receptionist",
      headline: "Never Miss a Call Again",
      description: "Your AI receptionist answers every call professionally, schedules appointments, takes messages, and routes urgent calls to the right person. Works 24/7 without breaks.",
      benefits: [
        "Answer calls in seconds",
        "Schedule appointments automatically",
        "Route calls intelligently",
        "Take detailed messages",
        "Reduce missed calls by 95%",
      ],
      image: "receptionist",
    },
    {
      id: "support",
      icon: Users,
      title: "Customer Support",
      headline: "Instant Support, Happy Customers",
      description: "Handle customer inquiries instantly across WhatsApp and voice. Resolve common issues automatically, escalate complex cases to humans seamlessly.",
      benefits: [
        "Instant response to queries",
        "Smart escalation to humans",
        "Consistent support quality",
        "Reduce support costs by 60%",
        "24/7 availability",
      ],
      image: "support",
    },
    {
      id: "sales",
      icon: TrendingUp,
      title: "Sales Agent",
      headline: "Convert Leads While You Sleep",
      description: "Qualify leads, answer product questions, and book meetings automatically. Your AI sales agent engages prospects the moment they reach out.",
      benefits: [
        "Instant lead qualification",
        "Product recommendations",
        "Book meetings automatically",
        "Follow up on leads",
        "Increase conversions by 40%",
      ],
      image: "sales",
    },
  ];

  const activeCase = useCases[activeTab];

  return (
    <section id="use-cases" className="py-24 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">
            One Platform,
            <span className="gradient-text"> Endless Possibilities</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">
            See how businesses use Nexus AI to transform their operations
          </motion.p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {useCases.map((useCase, index) => (
            <button
              key={useCase.id}
              onClick={() => setActiveTab(index)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === index
                  ? "bg-gradient-to-r from-primary to-secondary text-white"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <useCase.icon className="w-5 h-5" />
              {useCase.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeCase.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">{activeCase.headline}</h3>
            <p className="text-muted-foreground mb-8">{activeCase.description}</p>
            <ul className="space-y-4">
              {activeCase.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Use Case Visual */}
          <div className="relative">
            <UseCaseVisual type={activeCase.image} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Use Case Visual Component
function UseCaseVisual({ type }: { type: string }) {
  return (
    <div className="relative p-8 rounded-2xl bg-gradient-to-br from-card to-muted/20 border border-border">
      {/* Mock conversation */}
      <div className="space-y-4">
        {type === "receptionist" && (
          <>
            <ConversationBubble
              type="incoming"
              icon={<Phone className="w-4 h-4" />}
              message="Incoming call from +234 801 234 5678"
              time="Just now"
            />
            <ConversationBubble
              type="ai"
              message="Hello! Thank you for calling Acme Corp. How can I help you today?"
              time="0:02"
            />
            <ConversationBubble
              type="user"
              message="I'd like to schedule an appointment"
              time="0:05"
            />
            <ConversationBubble
              type="ai"
              message="I'd be happy to help you schedule an appointment. We have availability tomorrow at 10 AM or 2 PM. Which works better for you?"
              time="0:08"
            />
          </>
        )}
        {type === "support" && (
          <>
            <ConversationBubble
              type="incoming"
              icon={<MessageSquare className="w-4 h-4" />}
              message="New WhatsApp message"
              time="Just now"
            />
            <ConversationBubble
              type="user"
              message="Hi, I need help with my order #12345"
              time="2:30 PM"
            />
            <ConversationBubble
              type="ai"
              message="Hi! I found your order. It shipped yesterday and is expected to arrive tomorrow. Would you like the tracking link?"
              time="2:30 PM"
            />
            <ConversationBubble
              type="user"
              message="Yes please!"
              time="2:31 PM"
            />
          </>
        )}
        {type === "sales" && (
          <>
            <ConversationBubble
              type="incoming"
              icon={<MessageSquare className="w-4 h-4" />}
              message="New lead from website"
              time="Just now"
            />
            <ConversationBubble
              type="ai"
              message="Hi! Thanks for your interest in our services. What brings you here today?"
              time="3:15 PM"
            />
            <ConversationBubble
              type="user"
              message="I want to learn more about your enterprise plan"
              time="3:16 PM"
            />
            <ConversationBubble
              type="ai"
              message="Great! Our enterprise plan includes unlimited AI agents, priority support, and custom integrations. Would you like to schedule a demo with our team?"
              time="3:16 PM"
            />
          </>
        )}
      </div>
    </div>
  );
}

// Conversation Bubble Component
function ConversationBubble({
  type,
  message,
  time,
  icon,
}: {
  type: "ai" | "user" | "incoming";
  message: string;
  time: string;
  icon?: React.ReactNode;
}) {
  if (type === "incoming") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        {icon}
        <span>{message}</span>
        <span className="ml-auto text-xs">{time}</span>
      </div>
    );
  }

  return (
    <div className={`flex ${type === "ai" ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          type === "ai"
            ? "bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30"
            : "bg-muted"
        }`}
      >
        {type === "ai" && (
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">AI Agent</span>
          </div>
        )}
        <p className="text-sm">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}

// How It Works Section
function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Sign Up & Configure",
      description: "Create your account and tell us about your business. Enter your company details, services, and FAQs.",
      icon: Zap,
    },
    {
      number: "02",
      title: "Customize Your Agent",
      description: "Choose your AI agent's name, voice, and personality. Set up your business hours and preferences.",
      icon: Bot,
    },
    {
      number: "03",
      title: "Connect Channels",
      description: "Link your WhatsApp Business account or get a new phone number. Your AI is ready to go live.",
      icon: MessageCircle,
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">
            Go Live in
            <span className="gradient-text"> 5 Minutes</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">
            The fastest way to deploy your AI business assistant
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div key={step.number} variants={fadeInUp} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary to-transparent" />
              )}
              
              <div className="relative z-10 p-8 rounded-2xl bg-card border border-border text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm font-mono text-primary mb-2">{step.number}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
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
      price: "$49",
      period: "/month",
      description: "Perfect for small businesses",
      features: [
        "1 AI Agent",
        "1,000 conversations/mo",
        "WhatsApp integration",
        "Basic analytics",
        "Email support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$149",
      period: "/month",
      description: "For growing businesses",
      features: [
        "5 AI Agents",
        "10,000 conversations/mo",
        "WhatsApp + Voice",
        "Advanced analytics",
        "Priority support",
        "Custom integrations",
        "Human handover",
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
        "All channels",
        "Custom AI training",
        "Dedicated support",
        "SLA guarantee",
        "White-label option",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">
            Simple,
            <span className="gradient-text"> Transparent Pricing</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeInUp}
              className={`relative p-8 rounded-2xl ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/10 to-card border-2 border-primary"
                  : "bg-card border border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
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

              <button
                className={`w-full py-3 rounded-full font-medium transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section
function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-card to-secondary/20 border border-primary/30 text-center overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of businesses using Nexus AI to automate customer
              interactions. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity glow"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#pricing"
                className="px-8 py-4 rounded-full border border-border bg-card/50 text-foreground font-semibold hover:bg-card transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Nexus AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered business automation for the modern enterprise.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground">Integrations</a></li>
              <li><a href="#" className="hover:text-foreground">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Careers</a></li>
              <li><a href="#" className="hover:text-foreground">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
              <li><a href="#" className="hover:text-foreground">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Nexus AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
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
      <Features />
      <UseCases />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
