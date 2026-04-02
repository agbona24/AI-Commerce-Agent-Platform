"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Check,
  Download,
  Plus,
  Trash2,
  Zap,
  Phone,
  MessageSquare,
  TrendingUp,
  Calendar,
  Crown,
  Sparkles,
  Building2,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { billingService, Subscription, Plan, Invoice, PaymentMethod, Usage } from "@/lib/api/billing";

const planNames: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

export default function BillingPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "payment">("overview");
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [subscriptionData, plansData, invoicesData, paymentMethodsData, usageData] = await Promise.all([
        billingService.getSubscription(),
        billingService.getPlans(),
        billingService.getInvoices(),
        billingService.getPaymentMethods(),
        billingService.getUsage(),
      ]);
      
      setSubscription(subscriptionData);
      setPlans(plansData);
      setInvoices(invoicesData);
      setPaymentMethods(paymentMethodsData);
      setUsage(usageData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load billing data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleChangePlan = async (planId: string) => {
    if (!subscription) return;
    
    try {
      setSaving(true);
      setError(null);
      await billingService.changePlan({
        plan: planId as 'free' | 'starter' | 'professional' | 'enterprise',
        billing_cycle: subscription.billing_cycle,
      });
      await fetchBillingData();
      setShowUpgradeModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change plan';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    try {
      setSaving(true);
      setError(null);
      await billingService.cancelSubscription();
      await fetchBillingData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    
    try {
      setError(null);
      await billingService.removePaymentMethod(methodId);
      await fetchBillingData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove payment method';
      setError(errorMessage);
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      setError(null);
      await billingService.setDefaultPaymentMethod(methodId);
      await fetchBillingData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set default payment method';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your plan, payment methods, and invoices</p>
        </div>
        <button 
          onClick={() => fetchBillingData()}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {[
          { id: "overview", label: "Overview" },
          { id: "invoices", label: "Invoices" },
          { id: "payment", label: "Payment Methods" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Current Plan */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">Current Plan</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-1">{planNames[subscription?.plan || 'free']}</h2>
                  <p className="opacity-80">
                    {subscription?.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'} • Next billing: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-4 py-2 bg-white text-violet-600 rounded-xl font-medium hover:bg-white/90 transition-colors"
                  >
                    Change Plan
                  </button>
                  {subscription?.plan !== 'free' && !subscription?.cancel_at_period_end && (
                    <button 
                      onClick={handleCancelSubscription}
                      disabled={saving}
                      className="px-4 py-2 bg-white/20 rounded-xl font-medium hover:bg-white/30 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Canceling...' : 'Cancel'}
                    </button>
                  )}
                  {subscription?.cancel_at_period_end && (
                    <span className="px-4 py-2 bg-yellow-500/20 rounded-xl font-medium">
                      Cancels at period end
                    </span>
                  )}
                </div>
              </div>
              {subscription?.features && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{subscription.features.agents === -1 ? 'Unlimited' : subscription.features.agents} AI Agents</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{subscription.features.conversations === -1 ? 'Unlimited' : subscription.features.conversations.toLocaleString()} conversations/mo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{subscription.features.storage_gb} GB storage</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{subscription.features.team_members === -1 ? 'Unlimited' : subscription.features.team_members} team members</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="capitalize">{subscription.features.support} support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="capitalize">{subscription.features.analytics} analytics</span>
                  </div>
                </div>
              )}
            </div>

            {/* Usage Stats */}
            {usage && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-6">Current Usage</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-violet-500" />
                      Conversations
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {usage.conversations.used.toLocaleString()} / {usage.conversations.limit === -1 ? '∞' : usage.conversations.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: usage.conversations.limit === -1 ? '10%' : `${Math.min((usage.conversations.used / usage.conversations.limit) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {usage.conversations.limit === -1 ? 'Unlimited' : `${Math.round((usage.conversations.used / usage.conversations.limit) * 100)}% used`}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      AI Agents
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {usage.agents.used} / {usage.agents.limit === -1 ? '∞' : usage.agents.limit}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: usage.agents.limit === -1 ? '10%' : `${Math.min((usage.agents.used / usage.agents.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-500" />
                      Knowledge Bases
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {usage.knowledge_bases.used} / {usage.knowledge_bases.limit === -1 ? '∞' : usage.knowledge_bases.limit}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: usage.knowledge_bases.limit === -1 ? '10%' : `${Math.min((usage.knowledge_bases.used / usage.knowledge_bases.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-500" />
                      Storage
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {usage.storage.used_gb} / {usage.storage.limit_gb} GB
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${Math.min((usage.storage.used_gb / usage.storage.limit_gb) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "This Month", value: "$79", icon: Calendar, color: "text-violet-500" },
                { label: "YTD Spend", value: "$553", icon: TrendingUp, color: "text-green-500" },
                { label: "Avg/Month", value: "$79", icon: CreditCard, color: "text-blue-500" },
                { label: "Savings", value: "$216", icon: Zap, color: "text-yellow-500" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "invoices" && (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Invoice History</h3>
                <button className="text-sm text-primary flex items-center gap-1">
                  <Download className="w-4 h-4" /> Download All
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Invoice</th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Date</th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Amount</th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Status</th>
                    <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/50">
                      <td className="px-4 py-4 font-medium">{invoice.id}</td>
                      <td className="px-4 py-4 text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="px-4 py-4 font-medium">${invoice.amount.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                          invoice.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {invoice.pdf_url && (
                          <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 ml-auto">
                            <Download className="w-4 h-4" /> PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Payment Methods</h3>
                <button 
                  onClick={() => alert('Stripe integration required for adding payment methods')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" /> Add Card
                </button>
              </div>
              <div className="space-y-4">
                {paymentMethods.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No payment methods added</p>
                ) : (
                paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{method.brand} •••• {method.last_four}</p>
                        <p className="text-sm text-muted-foreground">Expires {method.exp_month}/{method.exp_year}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.is_default ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                          Default
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          className="px-2 py-1 text-xs font-medium rounded-full bg-muted hover:bg-muted/80 transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button 
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>

            {/* Billing Info */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Billing Information</h3>
                <button className="text-sm text-primary">Edit</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Company Name</p>
                  <p className="font-medium">Vivax Commerce Ltd</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">billing@vivaxstore.com</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Address</p>
                  <p className="font-medium">123 Victoria Island, Lagos, Nigeria</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tax ID</p>
                  <p className="font-medium">NG-12345678</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground mb-6">Select the plan that best fits your business needs</p>
              
              <div className="grid md:grid-cols-4 gap-4">
                {plans.map((plan) => {
                  const isCurrentPlan = subscription?.plan === plan.id;
                  const isPopular = plan.id === 'professional';
                  return (
                    <div 
                      key={plan.id}
                      className={`relative p-6 rounded-2xl border-2 transition-all ${
                        isPopular 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {isPopular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                          Most Popular
                        </span>
                      )}
                      <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">${plan.price_monthly}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <ul className="space-y-2 mb-6 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {plan.features.agents === -1 ? 'Unlimited' : plan.features.agents} agents
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {plan.features.conversations === -1 ? 'Unlimited' : plan.features.conversations.toLocaleString()} conversations/mo
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {plan.features.storage_gb} GB storage
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500 capitalize" />
                          {plan.features.support} support
                        </li>
                      </ul>
                      <button 
                        onClick={() => handleChangePlan(plan.id)}
                        disabled={isCurrentPlan || saving}
                        className={`w-full py-2.5 rounded-xl font-medium transition-colors ${
                          isCurrentPlan
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : isPopular
                              ? "bg-primary text-white hover:opacity-90"
                              : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {saving ? 'Processing...' : isCurrentPlan ? "Current Plan" : "Select Plan"}
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
