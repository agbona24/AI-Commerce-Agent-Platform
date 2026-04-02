import apiClient from './client';

// Types
export interface WidgetConfig {
  enabled: boolean;
  primary_color: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  greeting: string;
  placeholder: string;
  header_title: string;
  header_subtitle: string;
  show_avatar: boolean;
  show_branding: boolean;
  auto_open: boolean;
  auto_open_delay: number;
  sound_enabled: boolean;
  show_typing_indicator: boolean;
  collect_email: boolean;
  require_email_first: boolean;
  offline_message: string;
  business_hours: BusinessHours;
}

export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: Record<string, DaySchedule>;
}

export interface DaySchedule {
  start: string;
  end: string;
  enabled: boolean;
}

export interface WidgetResponse {
  config: WidgetConfig;
  widget_id: string;
  embed_url: string;
}

export interface EmbedCodeResponse {
  code: string;
  widget_id: string;
  embed_url: string;
}

export type UpdateWidgetData = Partial<WidgetConfig>;

// Widget Service
export const widgetService = {
  /**
   * Get widget configuration
   */
  async getConfig(): Promise<WidgetResponse> {
    const response = await apiClient.get('/widget');
    return response.data.data;
  },

  /**
   * Update widget configuration
   */
  async updateConfig(data: UpdateWidgetData): Promise<WidgetResponse> {
    const response = await apiClient.put('/widget', data);
    return response.data.data;
  },

  /**
   * Get embed code
   */
  async getEmbedCode(): Promise<EmbedCodeResponse> {
    const response = await apiClient.get('/widget/embed-code');
    return response.data.data;
  },
};
