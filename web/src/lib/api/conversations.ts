import apiClient from './client';
import { ApiResponse, PaginatedResponse, Conversation, Message } from './types';

export interface ConversationFilters {
  status?: string;
  channel?: string;
  agent_id?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

export interface SendMessageData {
  content: string;
  type?: 'text' | 'image' | 'file' | 'audio';
  metadata?: Record<string, unknown>;
}

export interface CreateConversationData {
  channel: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  agent_id?: string;
  metadata?: Record<string, unknown>;
}

export const conversationService = {
  /**
   * Get paginated list of conversations
   */
  async getConversations(filters: ConversationFilters = {}): Promise<PaginatedResponse<Conversation>> {
    const response = await apiClient.get<PaginatedResponse<Conversation>>('/conversations', {
      params: filters
    });
    return response.data;
  },

  /**
   * Get a single conversation by ID
   */
  async getConversation(id: string): Promise<Conversation> {
    const response = await apiClient.get<ApiResponse<Conversation>>(`/conversations/${id}`);
    return response.data.data;
  },

  /**
   * Create a new conversation
   */
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    const response = await apiClient.post<ApiResponse<Conversation>>('/conversations', data);
    return response.data.data;
  },

  /**
   * Update conversation status
   */
  async updateStatus(id: string, status: string): Promise<Conversation> {
    const response = await apiClient.patch<ApiResponse<Conversation>>(`/conversations/${id}/status`, {
      status
    });
    return response.data.data;
  },

  /**
   * Assign agent to conversation
   */
  async assignAgent(id: string, agentId: string): Promise<Conversation> {
    const response = await apiClient.post<ApiResponse<Conversation>>(`/conversations/${id}/assign`, {
      agent_id: agentId
    });
    return response.data.data;
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, page: number = 1): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.get<PaginatedResponse<Message>>(`/conversations/${conversationId}/messages`, {
      params: { page }
    });
    return response.data;
  },

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId: string, data: SendMessageData): Promise<Message> {
    const response = await apiClient.post<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, data);
    return response.data.data;
  },

  /**
   * Mark conversation as resolved
   */
  async resolve(id: string): Promise<Conversation> {
    return this.updateStatus(id, 'resolved');
  },

  /**
   * Update conversation details
   */
  async updateConversation(id: string, data: Partial<{
    status: string;
    assigned_to: string | null;
    metadata: Record<string, unknown>;
  }>): Promise<Conversation> {
    const response = await apiClient.patch<ApiResponse<Conversation>>(`/conversations/${id}`, data);
    return response.data.data;
  },

  /**
   * Escalate conversation to human agent
   */
  async escalate(id: string, assignTo?: string): Promise<Conversation> {
    const response = await apiClient.post<ApiResponse<Conversation>>(`/conversations/${id}/escalate`, {
      assign_to: assignTo
    });
    return response.data.data;
  },

  /**
   * Hand conversation back to AI
   */
  async handBackToAI(id: string): Promise<Conversation> {
    const response = await apiClient.post<ApiResponse<Conversation>>(`/conversations/${id}/hand-back`);
    return response.data.data;
  },

  /**
   * Get conversation analytics
   */
  async getAnalytics(period: string = '7d'): Promise<{
    total: number;
    by_channel: Record<string, number>;
    by_status: Record<string, number>;
    avg_duration: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      total: number;
      by_channel: Record<string, number>;
      by_status: Record<string, number>;
      avg_duration: number;
    }>>('/conversations/analytics', {
      params: { period }
    });
    return response.data.data;
  },

  /**
   * Search conversations
   */
  async search(query: string, filters: ConversationFilters = {}): Promise<PaginatedResponse<Conversation>> {
    return this.getConversations({ ...filters, search: query });
  },
};

export default conversationService;
