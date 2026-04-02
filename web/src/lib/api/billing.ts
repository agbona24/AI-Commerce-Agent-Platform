import { apiRequest } from './client';

// Types
export interface PlanFeatures {
  agents: number;
  conversations: number;
  knowledge_bases: number;
  team_members: number;
  storage_gb: number;
  integrations: string[];
  support: string;
  analytics: string;
}

export interface UsageItem {
  used: number;
  limit: number;
}

export interface StorageUsage {
  used_gb: number;
  limit_gb: number;
}

export interface Usage {
  agents: UsageItem;
  conversations: UsageItem;
  knowledge_bases: UsageItem;
  team_members: UsageItem;
  storage: StorageUsage;
}

export interface Subscription {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  features: PlanFeatures;
  usage: Usage;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: PlanFeatures;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  pdf_url: string | null;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last_four: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface ChangePlanData {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  billing_cycle: 'monthly' | 'yearly';
}

// Billing API Service
export const billingService = {
  // Get current subscription
  async getSubscription(): Promise<Subscription> {
    const response = await apiRequest<{ data: Subscription }>('/billing/subscription');
    return response.data;
  },

  // Get available plans
  async getPlans(): Promise<Plan[]> {
    const response = await apiRequest<{ data: Plan[] }>('/billing/plans');
    return response.data;
  },

  // Change subscription plan
  async changePlan(data: ChangePlanData): Promise<{ plan: string; billing_cycle: string; status: string }> {
    const response = await apiRequest<{ data: { plan: string; billing_cycle: string; status: string } }>('/billing/change-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Cancel subscription
  async cancelSubscription(): Promise<void> {
    await apiRequest('/billing/cancel', {
      method: 'POST',
    });
  },

  // Resume subscription
  async resumeSubscription(): Promise<void> {
    await apiRequest('/billing/resume', {
      method: 'POST',
    });
  },

  // Get invoices
  async getInvoices(): Promise<Invoice[]> {
    const response = await apiRequest<{ data: Invoice[] }>('/billing/invoices');
    return response.data;
  },

  // Get usage
  async getUsage(): Promise<Usage> {
    const response = await apiRequest<{ data: Usage }>('/billing/usage');
    return response.data;
  },

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiRequest<{ data: PaymentMethod[] }>('/billing/payment-methods');
    return response.data;
  },

  // Add payment method
  async addPaymentMethod(token: string, type: 'card' | 'bank_account' = 'card'): Promise<PaymentMethod> {
    const response = await apiRequest<{ data: PaymentMethod }>('/billing/payment-methods', {
      method: 'POST',
      body: JSON.stringify({ token, type }),
    });
    return response.data;
  },

  // Remove payment method
  async removePaymentMethod(methodId: string): Promise<void> {
    await apiRequest(`/billing/payment-methods/${methodId}`, {
      method: 'DELETE',
    });
  },

  // Set default payment method
  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    await apiRequest(`/billing/payment-methods/${methodId}/default`, {
      method: 'POST',
    });
  },
};
