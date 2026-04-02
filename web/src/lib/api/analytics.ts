import apiClient from './client';
import { ApiResponse, PaginatedResponse, AnalyticsOverview } from './types';

export interface ConversationStats {
  total: number;
  change: string;
  trend: 'up' | 'down';
}

export interface DashboardStats {
  total_conversations: number;
  total_conversations_change: number;
  calls_handled: number;
  calls_handled_change: number;
  response_rate: number;
  response_rate_change: number;
  active_customers: number;
  active_customers_change: number;
}

export interface ConversationAnalytics {
  daily_conversations: Array<{ date: string; count: number }>;
  by_channel: Array<{ channel: string; count: number }>;
  by_status: Array<{ status: string; count: number }>;
  avg_response_time: number;
  avg_resolution_time: number;
}

export interface AgentAnalytics {
  total_agents: number;
  active_agents: number;
  total_conversations: number;
  success_rate: number;
  by_agent: Array<{
    id: string;
    name: string;
    conversations: number;
    success_rate: number;
    status: string;
  }>;
}

export interface RealtimeAnalytics {
  active_conversations: number;
  agents_online: number;
  queue_size: number;
  avg_wait_time: number;
  recent_events: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export const analyticsService = {
  /**
   * Get dashboard overview analytics
   */
  async getOverview(period: string = '7d'): Promise<AnalyticsOverview> {
    const response = await apiClient.get<ApiResponse<AnalyticsOverview>>('/analytics/overview', {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Get conversation analytics
   */
  async getConversationAnalytics(period: string = '7d'): Promise<ConversationAnalytics> {
    const response = await apiClient.get<ApiResponse<ConversationAnalytics>>('/analytics/conversations', {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Get agent analytics
   */
  async getAgentAnalytics(period: string = '7d'): Promise<AgentAnalytics> {
    const response = await apiClient.get<ApiResponse<AgentAnalytics>>('/analytics/agents', {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Get realtime analytics
   */
  async getRealtimeAnalytics(): Promise<RealtimeAnalytics> {
    const response = await apiClient.get<ApiResponse<RealtimeAnalytics>>('/analytics/realtime');
    return response.data.data;
  },

  /**
   * Export analytics report
   */
  async exportReport(period: string, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await apiClient.post('/analytics/export', {
      period,
      format
    }, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export default analyticsService;
