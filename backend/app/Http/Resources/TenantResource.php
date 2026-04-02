<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'logo_url' => $this->logo_url,
            'primary_color' => $this->primary_color,
            'business_email' => $this->business_email,
            'business_phone' => $this->business_phone,
            'website' => $this->website,
            'industry' => $this->industry,
            'company_size' => $this->company_size,
            'timezone' => $this->timezone,
            'subscription_plan' => $this->subscription_plan,
            'subscription_status' => $this->subscription_status,
            'trial_ends_at' => $this->trial_ends_at,
            'is_on_trial' => $this->isOnTrial(),
            'has_active_subscription' => $this->hasActiveSubscription(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
