<?php

namespace App\Http\Controllers\Api\V1\Billing;

use App\Http\Controllers\Api\V1\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillingController extends BaseController
{
    /**
     * Get current subscription details
     */
    public function subscription(): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        
        // Get billing info from tenant settings
        $settings = $tenant->settings ?? [];
        $billing = $settings['billing'] ?? [];
        
        $subscription = [
            'plan' => $billing['plan'] ?? 'free',
            'status' => $billing['status'] ?? 'active',
            'billing_cycle' => $billing['billing_cycle'] ?? 'monthly',
            'current_period_start' => $billing['current_period_start'] ?? now()->startOfMonth()->toISOString(),
            'current_period_end' => $billing['current_period_end'] ?? now()->endOfMonth()->toISOString(),
            'cancel_at_period_end' => $billing['cancel_at_period_end'] ?? false,
            'features' => $this->getPlanFeatures($billing['plan'] ?? 'free'),
            'usage' => $this->getCurrentUsage($tenant),
        ];
        
        return $this->success($subscription);
    }

    /**
     * Get available plans
     */
    public function plans(): JsonResponse
    {
        $plans = [
            [
                'id' => 'free',
                'name' => 'Free',
                'description' => 'Perfect for getting started',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'features' => $this->getPlanFeatures('free'),
            ],
            [
                'id' => 'starter',
                'name' => 'Starter',
                'description' => 'For small businesses',
                'price_monthly' => 29,
                'price_yearly' => 290,
                'features' => $this->getPlanFeatures('starter'),
            ],
            [
                'id' => 'professional',
                'name' => 'Professional',
                'description' => 'For growing businesses',
                'price_monthly' => 79,
                'price_yearly' => 790,
                'features' => $this->getPlanFeatures('professional'),
            ],
            [
                'id' => 'enterprise',
                'name' => 'Enterprise',
                'description' => 'For large organizations',
                'price_monthly' => 199,
                'price_yearly' => 1990,
                'features' => $this->getPlanFeatures('enterprise'),
            ],
        ];
        
        return $this->success($plans);
    }

    /**
     * Change subscription plan
     */
    public function changePlan(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plan' => 'required|string|in:free,starter,professional,enterprise',
            'billing_cycle' => 'required|string|in:monthly,yearly',
        ]);
        
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        
        $settings['billing'] = array_merge($settings['billing'] ?? [], [
            'plan' => $data['plan'],
            'billing_cycle' => $data['billing_cycle'],
            'status' => 'active',
            'current_period_start' => now()->toISOString(),
            'current_period_end' => $data['billing_cycle'] === 'yearly' 
                ? now()->addYear()->toISOString() 
                : now()->addMonth()->toISOString(),
        ]);
        
        $tenant->update(['settings' => $settings]);
        
        return $this->success([
            'plan' => $data['plan'],
            'billing_cycle' => $data['billing_cycle'],
            'status' => 'active',
        ], 'Subscription updated successfully');
    }

    /**
     * Cancel subscription
     */
    public function cancel(Request $request): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        
        $settings['billing'] = array_merge($settings['billing'] ?? [], [
            'cancel_at_period_end' => true,
        ]);
        
        $tenant->update(['settings' => $settings]);
        
        return $this->success(null, 'Subscription will cancel at end of billing period');
    }

    /**
     * Resume cancelled subscription
     */
    public function resume(): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        
        $settings['billing'] = array_merge($settings['billing'] ?? [], [
            'cancel_at_period_end' => false,
        ]);
        
        $tenant->update(['settings' => $settings]);
        
        return $this->success(null, 'Subscription resumed');
    }

    /**
     * Get billing history / invoices
     */
    public function invoices(): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        $billing = $settings['billing'] ?? [];
        
        // In production, this would fetch from Stripe/payment provider
        $invoices = $billing['invoices'] ?? [
            [
                'id' => 'inv_001',
                'date' => now()->subMonth()->toISOString(),
                'amount' => 79.00,
                'currency' => 'USD',
                'status' => 'paid',
                'description' => 'Professional Plan - Monthly',
                'pdf_url' => null,
            ],
            [
                'id' => 'inv_002',
                'date' => now()->subMonths(2)->toISOString(),
                'amount' => 79.00,
                'currency' => 'USD',
                'status' => 'paid',
                'description' => 'Professional Plan - Monthly',
                'pdf_url' => null,
            ],
        ];
        
        return $this->success($invoices);
    }

    /**
     * Get payment methods
     */
    public function paymentMethods(): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        $billing = $settings['billing'] ?? [];
        
        $methods = $billing['payment_methods'] ?? [];
        
        return $this->success($methods);
    }

    /**
     * Add payment method
     */
    public function addPaymentMethod(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => 'required|string|in:card,bank_account',
            'token' => 'required|string', // Stripe token in production
        ]);
        
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        
        // In production, this would use Stripe API
        $newMethod = [
            'id' => 'pm_' . uniqid(),
            'type' => $data['type'],
            'last_four' => '4242',
            'brand' => 'visa',
            'exp_month' => 12,
            'exp_year' => 2027,
            'is_default' => empty($settings['billing']['payment_methods'] ?? []),
        ];
        
        $settings['billing']['payment_methods'] = array_merge(
            $settings['billing']['payment_methods'] ?? [],
            [$newMethod]
        );
        
        $tenant->update(['settings' => $settings]);
        
        return $this->created($newMethod, 'Payment method added');
    }

    /**
     * Remove payment method
     */
    public function removePaymentMethod(string $methodId): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        
        $methods = $settings['billing']['payment_methods'] ?? [];
        $settings['billing']['payment_methods'] = array_filter($methods, function ($m) use ($methodId) {
            return ($m['id'] ?? '') !== $methodId;
        });
        
        $tenant->update(['settings' => $settings]);
        
        return $this->success(null, 'Payment method removed');
    }

    /**
     * Set default payment method
     */
    public function setDefaultPaymentMethod(string $methodId): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        
        $methods = $settings['billing']['payment_methods'] ?? [];
        
        foreach ($methods as &$method) {
            $method['is_default'] = ($method['id'] ?? '') === $methodId;
        }
        
        $settings['billing']['payment_methods'] = $methods;
        $tenant->update(['settings' => $settings]);
        
        return $this->success(null, 'Default payment method updated');
    }

    /**
     * Get usage statistics
     */
    public function usage(): JsonResponse
    {
        $tenant = auth()->user()->tenant;
        
        return $this->success($this->getCurrentUsage($tenant));
    }

    /**
     * Get plan features
     */
    private function getPlanFeatures(string $plan): array
    {
        $features = [
            'free' => [
                'agents' => 1,
                'conversations' => 100,
                'knowledge_bases' => 1,
                'team_members' => 1,
                'storage_gb' => 0.5,
                'integrations' => ['widget'],
                'support' => 'community',
                'analytics' => 'basic',
            ],
            'starter' => [
                'agents' => 3,
                'conversations' => 1000,
                'knowledge_bases' => 5,
                'team_members' => 5,
                'storage_gb' => 5,
                'integrations' => ['widget', 'whatsapp'],
                'support' => 'email',
                'analytics' => 'standard',
            ],
            'professional' => [
                'agents' => 10,
                'conversations' => 10000,
                'knowledge_bases' => 20,
                'team_members' => 20,
                'storage_gb' => 25,
                'integrations' => ['widget', 'whatsapp', 'voice'],
                'support' => 'priority',
                'analytics' => 'advanced',
            ],
            'enterprise' => [
                'agents' => -1, // unlimited
                'conversations' => -1,
                'knowledge_bases' => -1,
                'team_members' => -1,
                'storage_gb' => 100,
                'integrations' => ['widget', 'whatsapp', 'voice', 'custom'],
                'support' => 'dedicated',
                'analytics' => 'custom',
            ],
        ];
        
        return $features[$plan] ?? $features['free'];
    }

    /**
     * Get current usage for tenant
     */
    private function getCurrentUsage($tenant): array
    {
        return [
            'agents' => [
                'used' => $tenant->agents()->count(),
                'limit' => $this->getPlanFeatures($tenant->settings['billing']['plan'] ?? 'free')['agents'],
            ],
            'conversations' => [
                'used' => $tenant->conversations()->whereMonth('created_at', now()->month)->count(),
                'limit' => $this->getPlanFeatures($tenant->settings['billing']['plan'] ?? 'free')['conversations'],
            ],
            'knowledge_bases' => [
                'used' => $tenant->knowledgeBases()->count(),
                'limit' => $this->getPlanFeatures($tenant->settings['billing']['plan'] ?? 'free')['knowledge_bases'],
            ],
            'team_members' => [
                'used' => $tenant->users()->count(),
                'limit' => $this->getPlanFeatures($tenant->settings['billing']['plan'] ?? 'free')['team_members'],
            ],
            'storage' => [
                'used_gb' => 0.15, // In production, calculate actual storage
                'limit_gb' => $this->getPlanFeatures($tenant->settings['billing']['plan'] ?? 'free')['storage_gb'],
            ],
        ];
    }
}
