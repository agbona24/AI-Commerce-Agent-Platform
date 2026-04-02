import apiClient from './client';
import { ApiResponse, PaginatedResponse, Agent } from './types';

export interface AgentFilters {
  status?: string;
  type?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateAgentData {
  name: string;
  type: 'sales' | 'support' | 'booking' | 'custom';
  description?: string;
  system_prompt?: string;
  greeting_message?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  channels?: string[];
  working_hours?: {
    enabled: boolean;
    schedule: Record<string, { start: string; end: string; enabled: boolean }>;
  };
}

export interface UpdateAgentData extends Partial<CreateAgentData> {
  status?: 'active' | 'inactive' | 'training';
}

export interface TestAgentMessage {
  message: string;
  conversation_history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface TestAgentResponse {
  message: string;
  confidence: number;
  sources?: Array<{ title: string; id: string }>;
}

export const agentService = {
  /**
   * Get paginated list of agents
   */
  async getAgents(filters: AgentFilters = {}): Promise<PaginatedResponse<Agent>> {
    const response = await apiClient.get<PaginatedResponse<Agent>>('/agents', {
      params: filters
    });
    return response.data;
  },

  /**
   * Get a single agent by ID
   */
  async getAgent(id: string): Promise<Agent> {
    const response = await apiClient.get<ApiResponse<Agent>>(`/agents/${id}`);
    return response.data.data;
  },

  /**
   * Create a new agent
   */
  async createAgent(data: CreateAgentData): Promise<Agent> {
    const response = await apiClient.post<ApiResponse<Agent>>('/agents', data);
    return response.data.data;
  },

  /**
   * Update an agent
   */
  async updateAgent(id: string, data: UpdateAgentData): Promise<Agent> {
    const response = await apiClient.put<ApiResponse<Agent>>(`/agents/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete an agent
   */
  async deleteAgent(id: string): Promise<void> {
    await apiClient.delete(`/agents/${id}`);
  },

  /**
   * Get agent analytics
   */
  async getAnalytics(id: string, period: string = '7d'): Promise<{
    total_conversations: number;
    success_rate: number;
    avg_response_time: number;
    satisfaction_score: number;
    daily_stats: Array<{ date: string; conversations: number; success_rate: number }>;
  }> {
    const response = await apiClient.get<ApiResponse<{
      total_conversations: number;
      success_rate: number;
      avg_response_time: number;
      satisfaction_score: number;
      daily_stats: Array<{ date: string; conversations: number; success_rate: number }>;
    }>>(`/agents/${id}/analytics`, {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Test agent with a message
   */
  async testAgent(id: string, data: TestAgentMessage): Promise<TestAgentResponse> {
    const response = await apiClient.post<ApiResponse<TestAgentResponse>>(`/agents/${id}/test`, data);
    return response.data.data;
  },

  /**
   * Duplicate an agent
   */
  async duplicateAgent(id: string, name?: string): Promise<Agent> {
    const response = await apiClient.post<ApiResponse<Agent>>(`/agents/${id}/duplicate`, {
      name
    });
    return response.data.data;
  },

  /**
   * Update agent status
   */
  async updateStatus(id: string, status: 'active' | 'inactive' | 'training'): Promise<Agent> {
    return this.updateAgent(id, { status });
  },

  /**
   * Activate agent
   */
  async activate(id: string): Promise<Agent> {
    return this.updateStatus(id, 'active');
  },

  /**
   * Deactivate agent
   */
  async deactivate(id: string): Promise<Agent> {
    return this.updateStatus(id, 'inactive');
  },
};

export default agentService;
