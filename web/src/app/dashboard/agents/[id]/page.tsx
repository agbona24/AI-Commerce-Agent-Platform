"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Settings,
  Phone,
  Volume2,
  GitBranch,
  HelpCircle,
  Zap,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Users,
  PhoneIncoming,
  PhoneOff,
  Mic,
  TrendingUp,
  Copy,
  RefreshCw,
  Send,
  Bot,
  User,
  Sparkles,
  Calendar,
  Package,
  Headphones,
  ArrowDownRight,
  ArrowUpRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Unlock,
  GripVertical,
  Move,
} from "lucide-react";

// Sample agent data
const agentData = {
  id: "voice-agent-1",
  name: "Customer Support Voice AI",
  description: "Handles inbound calls, answers FAQs, routes to departments, takes messages",
  status: "active" as const,
  type: "voice",
  greeting: "Hello! Thank you for calling Vivax Store. I'm your AI assistant. How can I help you today?",
  personality: "friendly",
  stats: {
    totalCalls: 1245,
    avgDuration: "3:45",
    successRate: 94,
    transferRate: 12,
  },
};

// Visual Workflow Steps with positions
interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition" | "end";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  x: number;
  y: number;
  connections: string[]; // IDs of nodes this connects to
  branchLabels?: Record<string, string>; // Connection labels for decision nodes
}

const initialWorkflowNodes: WorkflowNode[] = [
  {
    id: "1",
    type: "trigger",
    title: "Incoming Call",
    description: "Call received",
    icon: PhoneIncoming,
    color: "from-green-500 to-emerald-600",
    x: 80,
    y: 200,
    connections: ["2"],
  },
  {
    id: "2",
    type: "action",
    title: "Play Greeting",
    description: "Welcome message",
    icon: Volume2,
    color: "from-blue-500 to-indigo-600",
    x: 280,
    y: 200,
    connections: ["3"],
  },
  {
    id: "3",
    type: "condition",
    title: "Understand Intent",
    description: "AI Analysis",
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    x: 480,
    y: 200,
    connections: ["4a", "4b", "4c", "4d", "4e"],
    branchLabels: {
      "4a": "Order Status",
      "4b": "Product Info",
      "4c": "Support",
      "4d": "Appointment",
      "4e": "Other",
    },
  },
  {
    id: "4a",
    type: "action",
    title: "Check Order",
    description: "Look up order",
    icon: Package,
    color: "from-orange-500 to-red-600",
    x: 700,
    y: 60,
    connections: ["6"],
  },
  {
    id: "4b",
    type: "action",
    title: "Product Info",
    description: "Answer questions",
    icon: HelpCircle,
    color: "from-cyan-500 to-blue-600",
    x: 700,
    y: 150,
    connections: ["6"],
  },
  {
    id: "4c",
    type: "condition",
    title: "Support Triage",
    description: "Assess issue",
    icon: AlertTriangle,
    color: "from-yellow-500 to-amber-600",
    x: 700,
    y: 240,
    connections: ["5a", "5b"],
    branchLabels: {
      "5a": "Simple",
      "5b": "Complex",
    },
  },
  {
    id: "4d",
    type: "action",
    title: "Book Appointment",
    description: "Schedule meeting",
    icon: Calendar,
    color: "from-pink-500 to-rose-600",
    x: 700,
    y: 330,
    connections: ["6"],
  },
  {
    id: "4e",
    type: "action",
    title: "Transfer to Human",
    description: "Connect to agent",
    icon: Headphones,
    color: "from-slate-500 to-gray-600",
    x: 700,
    y: 420,
    connections: ["6"],
  },
  {
    id: "5a",
    type: "action",
    title: "Resolve Issue",
    description: "Self-service fix",
    icon: CheckCircle2,
    color: "from-green-500 to-emerald-600",
    x: 920,
    y: 200,
    connections: ["6"],
  },
  {
    id: "5b",
    type: "action",
    title: "Escalate",
    description: "Transfer call",
    icon: Users,
    color: "from-red-500 to-rose-600",
    x: 920,
    y: 300,
    connections: ["6"],
  },
  {
    id: "6",
    type: "end",
    title: "End Call",
    description: "Goodbye",
    icon: PhoneOff,
    color: "from-gray-500 to-slate-600",
    x: 1120,
    y: 240,
    connections: [],
  },
];

// Q&A Pairs
const qaPairs = [
  {
    id: "1",
    category: "Orders",
    question: "What is the status of my order?",
    answer: "I'd be happy to help you check your order status. Could you please provide your order number or the email address used for the purchase?",
    followUp: "Once I have that information, I'll look up your order and give you a real-time update on its status including shipping details.",
    usageCount: 156,
  },
  {
    id: "2",
    category: "Orders",
    question: "Can I change or cancel my order?",
    answer: "I understand you'd like to modify your order. Orders can be changed or cancelled within 1 hour of placement. Let me check the status of your order. What's your order number?",
    followUp: "If the order hasn't been processed yet, I can help you make changes or cancel it right away.",
    usageCount: 89,
  },
  {
    id: "3",
    category: "Products",
    question: "What products do you offer?",
    answer: "We offer a wide range of products including electronics, home goods, and lifestyle accessories. Is there a specific category or product type you're interested in?",
    followUp: "I can provide detailed information about any product, including specifications, pricing, and availability.",
    usageCount: 134,
  },
  {
    id: "4",
    category: "Products",
    question: "Do you have this item in stock?",
    answer: "Let me check our inventory for you. Which product are you looking for? Please provide the product name or SKU if you have it.",
    followUp: "I'll give you real-time availability information and can also check other sizes or colors if needed.",
    usageCount: 98,
  },
  {
    id: "5",
    category: "Shipping",
    question: "How long does shipping take?",
    answer: "Our standard shipping typically takes 3-5 business days. We also offer express shipping (1-2 days) and same-day delivery in select areas. Would you like me to check delivery options for your location?",
    followUp: "I can provide an estimated delivery date once you share your zip code.",
    usageCount: 112,
  },
  {
    id: "6",
    category: "Returns",
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for most items. Products must be in their original packaging and unused condition. Would you like to initiate a return for a recent purchase?",
    followUp: "I can email you a prepaid return label and guide you through the return process.",
    usageCount: 76,
  },
  {
    id: "7",
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. For orders over $100, we also offer Buy Now, Pay Later options.",
    followUp: "Is there a specific payment method you'd like to use? I can help you complete your purchase.",
    usageCount: 45,
  },
  {
    id: "8",
    category: "Support",
    question: "I need to speak with a human agent",
    answer: "I understand you'd like to speak with a human representative. I'll connect you right away. Before I transfer you, may I ask what your inquiry is about so I can direct you to the right department?",
    followUp: "Please hold while I transfer your call. Your estimated wait time is approximately 2 minutes.",
    usageCount: 67,
  },
];

// Conditions
const conditions = [
  {
    id: "1",
    name: "Business Hours Check",
    description: "Route calls differently based on operating hours",
    trigger: "When: Call received",
    rules: [
      { condition: "Current time is between 9 AM - 6 PM EST", action: "Continue normal flow" },
      { condition: "Current time is outside business hours", action: "Play after-hours message & offer voicemail" },
    ],
    isActive: true,
  },
  {
    id: "2",
    name: "VIP Customer Detection",
    description: "Identify and prioritize VIP customers",
    trigger: "When: Caller identified",
    rules: [
      { condition: "Customer lifetime value > $5,000", action: "Route to priority queue" },
      { condition: "Customer has active subscription", action: "Enable premium support options" },
      { condition: "Default", action: "Normal support flow" },
    ],
    isActive: true,
  },
  {
    id: "3",
    name: "High Volume Handling",
    description: "Manage call volume during peak times",
    trigger: "When: Queue length > 10",
    rules: [
      { condition: "Wait time > 5 minutes", action: "Offer callback option" },
      { condition: "Simple inquiry detected", action: "Attempt self-service resolution" },
    ],
    isActive: true,
  },
  {
    id: "4",
    name: "Sentiment Detection",
    description: "Respond to customer emotional state",
    trigger: "When: Negative sentiment detected",
    rules: [
      { condition: "Caller sounds frustrated", action: "Use empathetic response templates" },
      { condition: "Caller requests manager", action: "Immediate escalation" },
      { condition: "Multiple failed attempts", action: "Offer human transfer" },
    ],
    isActive: true,
  },
  {
    id: "5",
    name: "Language Preference",
    description: "Handle multi-language support",
    trigger: "When: Non-English detected",
    rules: [
      { condition: "Spanish detected", action: "Switch to Spanish responses" },
      { condition: "French detected", action: "Switch to French responses" },
      { condition: "Other language", action: "Offer transfer to multilingual agent" },
    ],
    isActive: false,
  },
];

type TabType = "workflow" | "qa" | "conditions" | "simulator";

// Workflow Node Component
function WorkflowNodeComponent({
  node,
  onDrag,
  isSelected,
  onSelect,
  zoom,
  isLocked,
}: {
  node: WorkflowNode;
  onDrag: (id: string, x: number, y: number) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  zoom: number;
  isLocked: boolean;
}) {
  const Icon = node.icon;
  const isDecision = node.type === "condition";
  
  return (
    <motion.div
      drag={!isLocked}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_, info) => {
        onDrag(
          node.id,
          node.x + info.offset.x / zoom,
          node.y + info.offset.y / zoom
        );
      }}
      onClick={() => onSelect(node.id)}
      className={`absolute cursor-pointer group`}
      style={{
        left: node.x * zoom,
        top: node.y * zoom,
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
      }}
      whileHover={{ scale: zoom * 1.05 }}
      whileTap={{ scale: zoom * 0.98 }}
    >
      <div
        className={`relative ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""} ${
          isDecision ? "rotate-45" : ""
        }`}
      >
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${node.color} flex items-center justify-center shadow-lg transition-shadow group-hover:shadow-xl`}
        >
          <Icon className={`w-7 h-7 text-white ${isDecision ? "-rotate-45" : ""}`} />
        </div>
        {!isLocked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className={`mt-2 text-center ${isDecision ? "ml-4" : ""}`}>
        <p className="text-xs font-semibold truncate max-w-[80px]">{node.title}</p>
        <p className="text-[10px] text-muted-foreground truncate max-w-[80px]">{node.description}</p>
      </div>
    </motion.div>
  );
}

// Bezier connection line component
function ConnectionLine({
  from,
  to,
  label,
  zoom,
  fromNode,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
  zoom: number;
  fromNode: WorkflowNode;
}) {
  // Calculate connection points (center of nodes + offset)
  const nodeWidth = 64;
  const nodeHeight = 64;
  
  const startX = (from.x + nodeWidth / 2) * zoom;
  const startY = (from.y + nodeHeight / 2) * zoom;
  const endX = (to.x + nodeWidth / 2) * zoom;
  const endY = (to.y + nodeHeight / 2) * zoom;
  
  // Control points for bezier curve (n8n style - smooth horizontal curves)
  const dx = endX - startX;
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);
  
  const path = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
  
  // Calculate midpoint for label
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 - 10;
  
  // Get color based on from node
  const getStrokeColor = () => {
    switch (fromNode.type) {
      case "trigger": return "#22c55e";
      case "action": return "#3b82f6";
      case "condition": return "#8b5cf6";
      default: return "#6b7280";
    }
  };

  return (
    <g>
      {/* Shadow line */}
      <path
        d={path}
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={4 * zoom}
        strokeLinecap="round"
      />
      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={getStrokeColor()}
        strokeWidth={2.5 * zoom}
        strokeLinecap="round"
        className="transition-all"
      />
      {/* Arrow head */}
      <circle
        cx={endX}
        cy={endY}
        r={4 * zoom}
        fill={getStrokeColor()}
      />
      {/* Label */}
      {label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-30 * zoom}
            y={-10 * zoom}
            width={60 * zoom}
            height={18 * zoom}
            rx={4 * zoom}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth={1}
            className="dark:fill-slate-800 dark:stroke-slate-600"
          />
          <text
            x={0}
            y={3 * zoom}
            textAnchor="middle"
            fontSize={9 * zoom}
            fill="#6b7280"
            className="dark:fill-slate-400 font-medium"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

export default function AgentDetailPage() {
  const [activeTab, setActiveTab] = useState<TabType>("workflow");
  const [expandedQA, setExpandedQA] = useState<string | null>(null);
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);
  const [simulatorMessages, setSimulatorMessages] = useState<Array<{role: "user" | "agent", text: string}>>([
    { role: "agent", text: agentData.greeting },
  ]);
  const [simulatorInput, setSimulatorInput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [qaFilter, setQaFilter] = useState("all");
  
  // Workflow editor state
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>(initialWorkflowNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.85);
  const [isLocked, setIsLocked] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Handle node drag
  const handleNodeDrag = useCallback((id: string, x: number, y: number) => {
    setWorkflowNodes(prev =>
      prev.map(node =>
        node.id === id ? { ...node, x: Math.max(0, x), y: Math.max(0, y) } : node
      )
    );
  }, []);
  
  // Reset to initial positions
  const resetLayout = () => {
    setWorkflowNodes(initialWorkflowNodes);
    setZoom(0.85);
  };

  const tabs = [
    { id: "workflow" as const, label: "Call Flow", icon: GitBranch },
    { id: "qa" as const, label: "Q&A Library", icon: HelpCircle },
    { id: "conditions" as const, label: "Conditions", icon: Zap },
    { id: "simulator" as const, label: "Test Agent", icon: Play },
  ];

  const categories = ["all", ...Array.from(new Set(qaPairs.map(q => q.category)))];

  const filteredQA = qaFilter === "all" ? qaPairs : qaPairs.filter(q => q.category === qaFilter);

  const simulateResponse = () => {
    if (!simulatorInput.trim()) return;
    
    setSimulatorMessages(prev => [...prev, { role: "user", text: simulatorInput }]);
    setSimulatorInput("");
    setIsSimulating(true);

    // Simulate AI response
    setTimeout(() => {
      const input = simulatorInput.toLowerCase();
      let response = "I understand. Let me help you with that. Could you provide more details?";
      
      if (input.includes("order") && input.includes("status")) {
        response = qaPairs.find(q => q.question.toLowerCase().includes("status"))?.answer || response;
      } else if (input.includes("return") || input.includes("refund")) {
        response = qaPairs.find(q => q.category === "Returns")?.answer || response;
      } else if (input.includes("ship") || input.includes("delivery")) {
        response = qaPairs.find(q => q.category === "Shipping")?.answer || response;
      } else if (input.includes("human") || input.includes("agent") || input.includes("person")) {
        response = qaPairs.find(q => q.question.toLowerCase().includes("human"))?.answer || response;
      } else if (input.includes("product") || input.includes("item")) {
        response = qaPairs.find(q => q.question.toLowerCase().includes("products"))?.answer || response;
      }

      setSimulatorMessages(prev => [...prev, { role: "agent", text: response }]);
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/agents"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Volume2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{agentData.name}</h1>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              </div>
              <p className="text-muted-foreground">{agentData.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 transition-colors">
            <Pause className="w-4 h-4" />
            Pause Agent
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Calls", value: agentData.stats.totalCalls.toLocaleString(), icon: Phone, color: "text-blue-500", trend: "+12%" },
          { label: "Avg Duration", value: agentData.stats.avgDuration, icon: Clock, color: "text-violet-500", trend: "-8%" },
          { label: "Success Rate", value: `${agentData.stats.successRate}%`, icon: TrendingUp, color: "text-green-500", trend: "+3%" },
          { label: "Transfer Rate", value: `${agentData.stats.transferRate}%`, icon: Users, color: "text-orange-500", trend: "-5%" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className={`text-xs font-medium flex items-center gap-1 ${stat.trend.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                {stat.trend.startsWith("+") ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "workflow" && (
          <motion.div
            key="workflow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* n8n-style Workflow Editor */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold">Call Flow Diagram</h2>
                  <div className="flex items-center gap-1 px-2 py-1 bg-background rounded-lg border border-border">
                    <button
                      onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}
                      className="p-1.5 hover:bg-muted rounded transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium px-2 min-w-[50px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                      className="p-1.5 hover:bg-muted rounded transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setZoom(0.85)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Reset Zoom"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsLocked(!isLocked)}
                    className={`p-2 rounded-lg transition-colors ${isLocked ? "bg-yellow-500/10 text-yellow-600" : "hover:bg-muted"}`}
                    title={isLocked ? "Unlock Nodes" : "Lock Nodes"}
                  >
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetLayout}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" />
                    Add Node
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div 
                ref={canvasRef}
                className="relative h-[500px] overflow-auto bg-[radial-gradient(circle,#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(circle,#374151_1px,transparent_1px)] bg-[length:20px_20px]"
                style={{ cursor: isLocked ? "default" : "grab" }}
              >
                {/* SVG Connections Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: "1300px", minHeight: "500px" }}>
                  {workflowNodes.map(node => 
                    node.connections.map(targetId => {
                      const targetNode = workflowNodes.find(n => n.id === targetId);
                      if (!targetNode) return null;
                      return (
                        <ConnectionLine
                          key={`${node.id}-${targetId}`}
                          from={{ x: node.x, y: node.y }}
                          to={{ x: targetNode.x, y: targetNode.y }}
                          label={node.branchLabels?.[targetId]}
                          zoom={zoom}
                          fromNode={node}
                        />
                      );
                    })
                  )}
                </svg>

                {/* Nodes Layer */}
                <div className="relative" style={{ minWidth: "1300px", minHeight: "500px" }}>
                  {workflowNodes.map(node => (
                    <WorkflowNodeComponent
                      key={node.id}
                      node={node}
                      onDrag={handleNodeDrag}
                      isSelected={selectedNode === node.id}
                      onSelect={setSelectedNode}
                      zoom={zoom}
                      isLocked={isLocked}
                    />
                  ))}
                </div>

                {/* Instructions overlay */}
                {!isLocked && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur-sm rounded-lg border border-border text-xs text-muted-foreground">
                    <Move className="w-3.5 h-3.5" />
                    Drag nodes to reposition
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <span className="text-sm text-muted-foreground">Trigger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500" />
                    <span className="text-sm text-muted-foreground">Action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-violet-500 rotate-45" />
                    <span className="text-sm text-muted-foreground">Decision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-500" />
                    <span className="text-sm text-muted-foreground">End</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {workflowNodes.length} nodes • {workflowNodes.reduce((acc, n) => acc + n.connections.length, 0)} connections
                </span>
              </div>
            </div>

            {/* Selected Node Details Panel */}
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                {(() => {
                  const node = workflowNodes.find(n => n.id === selectedNode);
                  if (!node) return null;
                  const Icon = node.icon;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{node.title}</h3>
                            <p className="text-sm text-muted-foreground">{node.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setSelectedNode(null)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Type</p>
                          <p className="text-sm font-medium capitalize">{node.type}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Node ID</p>
                          <p className="text-sm font-medium">{node.id}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Position</p>
                          <p className="text-sm font-medium">x: {Math.round(node.x)}, y: {Math.round(node.y)}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Connections</p>
                          <p className="text-sm font-medium">{node.connections.length} outgoing</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}

            {/* Greeting Preview */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-3">Greeting Message</h3>
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">AI Agent</p>
                    <p className="text-muted-foreground">&ldquo;{agentData.greeting}&rdquo;</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "qa" && (
          <motion.div
            key="qa"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Q&A Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold">Questions & Answers Library</h2>
                <p className="text-sm text-muted-foreground">Manage how your agent responds to common questions</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={qaFilter}
                  onChange={(e) => setQaFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
                  ))}
                </select>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
                  <Plus className="w-4 h-4" />
                  Add Q&A
                </button>
              </div>
            </div>

            {/* Q&A List */}
            <div className="space-y-3">
              {filteredQA.map((qa) => (
                <div
                  key={qa.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedQA(expandedQA === qa.id ? null : qa.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <HelpCircle className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{qa.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{qa.category}</span>
                          <span className="text-xs text-muted-foreground">Used {qa.usageCount} times</span>
                        </div>
                      </div>
                    </div>
                    {expandedQA === qa.id ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedQA === qa.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1 block">Primary Response</label>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm">{qa.answer}</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground mb-1 block">Follow-up</label>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm">{qa.followUp}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors">
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors">
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* AI Suggestion */}
            <div className="p-4 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-200 dark:border-violet-800 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">AI-Powered Q&A Generation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Let AI analyze your business and generate relevant Q&A pairs based on your industry and services.
                  </p>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors">
                    <Sparkles className="w-4 h-4" />
                    Generate Q&A with AI
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "conditions" && (
          <motion.div
            key="conditions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Conditions Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold">Conditions & Rules</h2>
                <p className="text-sm text-muted-foreground">Define how your agent handles different scenarios</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Add Condition
              </button>
            </div>

            {/* Conditions List */}
            <div className="space-y-3">
              {conditions.map((condition) => (
                <div
                  key={condition.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedCondition(expandedCondition === condition.id ? null : condition.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        condition.isActive ? "bg-amber-500/10" : "bg-gray-500/10"
                      }`}>
                        <Zap className={`w-5 h-5 ${condition.isActive ? "text-amber-500" : "text-gray-500"}`} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{condition.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            condition.isActive ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"
                          }`}>
                            {condition.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{condition.description}</p>
                      </div>
                    </div>
                    {expandedCondition === condition.id ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedCondition === condition.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 space-y-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-violet-500/10 text-violet-500 rounded font-medium">TRIGGER</span>
                            <span>{condition.trigger}</span>
                          </div>

                          <div className="space-y-2">
                            {condition.rules.map((rule, idx) => (
                              <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded font-medium">IF</span>
                                  <span className="text-sm">{rule.condition}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded font-medium">THEN</span>
                                  <span className="text-sm">{rule.action}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors">
                              <Edit2 className="w-4 h-4" />
                              Edit Rules
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors">
                              {condition.isActive ? (
                                <>
                                  <XCircle className="w-4 h-4" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  Enable
                                </>
                              )}
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "simulator" && (
          <motion.div
            key="simulator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold">Agent Simulator</h2>
                <p className="text-sm text-muted-foreground">Test how your agent responds to different scenarios</p>
              </div>
              <button
                onClick={() => setSimulatorMessages([{ role: "agent", text: agentData.greeting }])}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {/* Chat Simulator */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Simulator Header */}
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Simulated Call</p>
                    <p className="text-xs text-muted-foreground">Testing {agentData.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Connected
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {simulatorMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "agent"
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : "bg-gradient-to-br from-blue-500 to-indigo-600"
                    }`}>
                      {msg.role === "agent" ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.role === "agent"
                        ? "bg-muted"
                        : "bg-primary text-white"
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isSimulating && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="p-3 bg-muted rounded-2xl">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={simulatorInput}
                    onChange={(e) => setSimulatorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && simulateResponse()}
                    placeholder="Type a message to test the agent..."
                    className="flex-1 px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={simulateResponse}
                    disabled={!simulatorInput.trim() || isSimulating}
                    className="p-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Test Scenarios */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-medium mb-3">Quick Test Scenarios</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "What's my order status?",
                  "I want to return an item",
                  "How long does shipping take?",
                  "I need to speak to someone",
                  "What products do you have?",
                  "Can I cancel my order?",
                ].map((scenario) => (
                  <button
                    key={scenario}
                    onClick={() => {
                      setSimulatorInput(scenario);
                    }}
                    className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    {scenario}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
