// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// User types
export interface User {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: 'owner' | 'admin' | 'agent' | 'member';
  timezone: string;
  language: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Tenant types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  primary_color: string;
  business_name: string | null;
  legal_name: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  address: Record<string, string> | null;
  tax_id: string | null;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  trial_ends_at: string | null;
  settings: TenantSettings | null;
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  ai?: {
    default_model?: string;
    temperature?: number;
    max_tokens?: number;
    tasks?: string[];
    tone?: string;
  };
  timezone?: string;
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  channels?: string[];
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  company_name: string;
  account_type: 'business' | 'agency';
}

export interface AuthResponse {
  user: User;
  tenant: Tenant;
  token: string;
}

// Onboarding types
export interface OnboardingData {
  // Business info
  business_name?: string;
  website?: string;
  team_size?: string;
  
  // Industry
  industry?: string;
  custom_industry?: string;
  
  // AI Configuration
  ai_tasks?: string[];
  ai_tone?: string;
  
  // Channels
  channels?: string[];
}

// Agent types
export interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  type: 'sales' | 'support' | 'booking' | 'lead_qualification' | 'custom';
  status: 'active' | 'inactive' | 'draft' | 'training' | 'paused';
  system_prompt: string | null;
  welcome_message: string | null;
  fallback_message: string | null;
  language: string;
  channels: string[] | null;
  voice_id: string | null;
  voice_settings: Record<string, unknown> | null;
  workflow: Record<string, unknown> | null;
  model: string;
  temperature: number;
  max_tokens: number;
  is_default: boolean;
  conversations_count: number;
  avg_rating: number | null;
  created_at: string;
  updated_at: string;
}

// Product types
export interface Product {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  cost: number | null;
  quantity: number;
  low_stock_threshold: number;
  currency: string;
  status: 'active' | 'draft' | 'archived';
  images: string[] | null;
  variants: Record<string, unknown>[] | null;
  specifications: Record<string, string> | null;
  is_featured: boolean;
  view_count: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: string;
  tenant_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
  products_count?: number;
}

// Conversation types
export interface Conversation {
  id: string;
  tenant_id: string;
  agent_id: string | null;
  external_id: string | null;
  channel: 'web_widget' | 'whatsapp' | 'voice' | 'email' | 'sms';
  status: 'open' | 'waiting' | 'resolved' | 'escalated' | 'closed' | 'active';
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_metadata: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  summary: string | null;
  tags: string[] | null;
  sentiment_score: number | null;
  sentiment?: string | null;
  messages_count: number;
  started_at?: string | null;
  ended_at?: string | null;
  last_message_at: string | null;
  resolved_at: string | null;
  escalated_at?: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  agent?: Agent;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content_type: string;
  content: string;
  attachments: Record<string, unknown>[] | null;
  metadata: Record<string, unknown> | null;
  confidence_score: number | null;
  tokens_used: number | null;
  response_time_ms: number | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Knowledge Base types
export interface KnowledgeBase {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  type: 'text' | 'document' | 'website' | 'faq' | 'product' | 'api';
  embeddings_status: 'pending' | 'processing' | 'completed' | 'failed';
  source_url: string | null;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  chunks_count: number;
  last_synced_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Integration types
export interface Integration {
  id: string;
  tenant_id: string;
  name: string;
  provider: string;
  type: 'ecommerce' | 'communication' | 'payment' | 'crm' | 'analytics' | 'automation';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  settings: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  last_synced_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Analytics types
export interface AnalyticsOverview {
  total_conversations: number;
  conversation_change?: number;
  active_conversations: number;
  resolved_today: number;
  calls_handled?: number;
  calls_change?: number;
  response_rate?: number;
  response_rate_change?: number;
  active_customers?: number;
  customers_change?: number;
  avg_response_time: number;
  avg_resolution_time: number;
  satisfaction_score: number;
  total_messages: number;
  ai_handled_percentage: number;
  top_channels: { channel: string; count: number }[];
  hourly_distribution: { hour: number; count: number }[];
}
