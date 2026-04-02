import { apiRequest } from './client';

// Types
export interface Integration {
  id: number;
  type: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  credentials?: Record<string, unknown>;
  settings?: IntegrationSettings;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationSettings {
  // WhatsApp specific
  phone_number?: string;
  business_name?: string;
  webhook_url?: string;
  
  // Voice specific
  voice_id?: string;
  language?: string;
  speed?: number;
  
  // Widget specific
  primary_color?: string;
  position?: 'bottom-right' | 'bottom-left';
  welcome_message?: string;
  offline_message?: string;
  
  // Generic
  enabled?: boolean;
  auto_sync?: boolean;
  sync_interval?: number;
  [key: string]: unknown;
}

export interface AvailableIntegration {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  installed: boolean;
}

export interface ConnectIntegrationData {
  type: string;
  credentials: Record<string, string>;
  settings?: IntegrationSettings;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  status: 'approved' | 'pending' | 'rejected';
  category: string;
  language: string;
  preview: string;
}

// Integrations API Service
export const integrationService = {
  // Get all connected integrations
  async getIntegrations(type?: string): Promise<Integration[]> {
    const query = type ? `?type=${type}` : '';
    const response = await apiRequest<{ data: Integration[] }>(`/integrations${query}`);
    return response.data;
  },

  // Get available integrations
  async getAvailableIntegrations(): Promise<AvailableIntegration[]> {
    const response = await apiRequest<{ data: AvailableIntegration[] }>('/integrations/available');
    return response.data;
  },

  // Get single integration
  async getIntegration(id: number): Promise<Integration> {
    const response = await apiRequest<{ data: Integration }>(`/integrations/${id}`);
    return response.data;
  },

  // Get integration by type (helper)
  async getIntegrationByType(type: string): Promise<Integration | null> {
    const integrations = await this.getIntegrations(type);
    return integrations.length > 0 ? integrations[0] : null;
  },

  // Connect an integration
  async connect(data: ConnectIntegrationData): Promise<Integration> {
    const response = await apiRequest<{ data: Integration }>('/integrations/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update integration
  async update(id: number, data: { settings?: IntegrationSettings; credentials?: Record<string, string> }): Promise<Integration> {
    const response = await apiRequest<{ data: Integration }>(`/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Disconnect integration
  async disconnect(id: number): Promise<void> {
    await apiRequest(`/integrations/${id}/disconnect`, {
      method: 'POST',
    });
  },

  // Delete integration
  async delete(id: number): Promise<void> {
    await apiRequest(`/integrations/${id}`, {
      method: 'DELETE',
    });
  },

  // Sync integration
  async sync(id: number): Promise<void> {
    await apiRequest(`/integrations/${id}/sync`, {
      method: 'POST',
    });
  },

  // Test integration connection
  async test(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await apiRequest<{ data: { success: boolean; message?: string } }>(`/integrations/${id}/test`);
    return response.data;
  },

  // WhatsApp specific methods
  whatsapp: {
    async getStatus(): Promise<{ connected: boolean; phone_number?: string; business_name?: string; quality_rating?: string }> {
      const response = await apiRequest<{ data: { connected: boolean; phone_number?: string; business_name?: string; quality_rating?: string } }>('/whatsapp/status');
      return response.data;
    },

    async getTemplates(): Promise<WhatsAppTemplate[]> {
      const response = await apiRequest<{ data: WhatsAppTemplate[] }>('/whatsapp/templates');
      return response.data;
    },

    async sendMessage(to: string, message: string): Promise<void> {
      await apiRequest('/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify({ to, message }),
      });
    },
  },

  // Voice specific methods
  voice: {
    async getVoices(): Promise<{ id: string; name: string; language: string; preview_url?: string }[]> {
      const response = await apiRequest<{ data: { id: string; name: string; language: string; preview_url?: string }[] }>('/voice/voices');
      return response.data;
    },

    async textToSpeech(text: string, voiceId?: string): Promise<{ audio_url: string }> {
      const response = await apiRequest<{ data: { audio_url: string } }>('/voice/text-to-speech', {
        method: 'POST',
        body: JSON.stringify({ text, voice_id: voiceId }),
      });
      return response.data;
    },
  },
};
