import apiClient from './client';
import { ApiResponse, User, Tenant } from './types';

// Settings response types
export interface SettingsResponse {
  profile: User;
  business: Tenant;
  billing: {
    plan: string;
    status: string;
    trial_ends_at: string | null;
  };
}

export interface NotificationSettings {
  email_new_conversation: boolean;
  email_conversation_assigned: boolean;
  email_daily_summary: boolean;
  push_new_message: boolean;
  push_escalation: boolean;
}

export interface AISettings {
  default_model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3';
  temperature: number;
  max_tokens: number;
  auto_escalate: boolean;
  escalation_threshold: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  last_used_at: string | null;
  created_at: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
  timezone?: string;
  language?: string;
}

export interface UpdateBusinessData {
  name?: string;
  logo_url?: string;
  primary_color?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  business_email?: string;
  business_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  tax_id?: string;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  token: string;
}

export interface UpdatePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
  method: 'app' | 'sms' | 'email';
  phone_verified: boolean;
  backup_codes_count: number;
}

export interface TwoFactorSetup {
  method: string;
  secret: string;
  qr_url: string;
  backup_codes: string[];
}

export const settingsService = {
  /**
   * Get all settings (profile, business, billing)
   */
  async getSettings(): Promise<SettingsResponse> {
    const response = await apiClient.get<ApiResponse<SettingsResponse>>('/settings');
    return response.data.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/settings/profile', data);
    return response.data.data;
  },

  /**
   * Update password
   */
  async updatePassword(data: UpdatePasswordData): Promise<void> {
    await apiClient.put('/settings/password', data);
  },

  /**
   * Update business settings
   */
  async updateBusiness(data: UpdateBusinessData): Promise<Tenant> {
    const response = await apiClient.put<ApiResponse<Tenant>>('/settings/business', data);
    return response.data.data;
  },

  /**
   * Get notification settings
   */
  async getNotifications(): Promise<NotificationSettings> {
    const response = await apiClient.get<ApiResponse<NotificationSettings>>('/settings/notifications');
    return response.data.data;
  },

  /**
   * Update notification settings
   */
  async updateNotifications(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await apiClient.put<ApiResponse<NotificationSettings>>('/settings/notifications', data);
    return response.data.data;
  },

  /**
   * Get AI settings
   */
  async getAISettings(): Promise<AISettings> {
    const response = await apiClient.get<ApiResponse<AISettings>>('/settings/ai');
    return response.data.data;
  },

  /**
   * Update AI settings
   */
  async updateAISettings(data: Partial<AISettings>): Promise<AISettings> {
    const response = await apiClient.put<ApiResponse<AISettings>>('/settings/ai', data);
    return response.data.data;
  },

  /**
   * Get API keys
   */
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await apiClient.get<ApiResponse<ApiKey[]>>('/settings/api-keys');
    return response.data.data;
  },

  /**
   * Create new API key
   */
  async createApiKey(name: string): Promise<CreateApiKeyResponse> {
    const response = await apiClient.post<ApiResponse<CreateApiKeyResponse>>('/settings/api-keys', { name });
    return response.data.data;
  },

  /**
   * Revoke API key
   */
  async revokeApiKey(id: string): Promise<void> {
    await apiClient.delete(`/settings/api-keys/${id}`);
  },

  /**
   * Get 2FA status
   */
  async getTwoFactorStatus(): Promise<TwoFactorStatus> {
    const response = await apiClient.get<ApiResponse<TwoFactorStatus>>('/settings/two-factor');
    return response.data.data;
  },

  /**
   * Enable 2FA - Start setup process
   */
  async enableTwoFactor(method: 'app' | 'sms' | 'email'): Promise<TwoFactorSetup> {
    const response = await apiClient.post<ApiResponse<TwoFactorSetup>>('/settings/two-factor/enable', { method });
    return response.data.data;
  },

  /**
   * Verify 2FA code and complete setup
   */
  async verifyTwoFactor(code: string): Promise<{ enabled: boolean; method: string }> {
    const response = await apiClient.post<ApiResponse<{ enabled: boolean; method: string }>>('/settings/two-factor/verify', { code });
    return response.data.data;
  },

  /**
   * Disable 2FA
   */
  async disableTwoFactor(password: string): Promise<void> {
    await apiClient.post('/settings/two-factor/disable', { password });
  },

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(password: string): Promise<{ backup_codes: string[] }> {
    const response = await apiClient.post<ApiResponse<{ backup_codes: string[] }>>('/settings/two-factor/backup-codes', { password });
    return response.data.data;
  },
};

export default settingsService;
