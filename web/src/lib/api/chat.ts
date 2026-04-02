import apiClient from './client';

// Types
export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  content_type: 'text' | 'image' | 'audio' | 'document';
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Attachment {
  type: string;
  url: string;
  name?: string;
  size?: number;
}

export interface ChatConversation {
  id: string;
  session_id: string;
  agent_id: string;
  agent?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  status: 'active' | 'waiting' | 'escalated' | 'resolved' | 'closed';
  channel: string;
  message_count: number;
  messages?: ChatMessage[];
  started_at: string;
  last_message_at: string;
  metadata?: Record<string, unknown>;
}

export interface StartChatData {
  agent_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  channel?: string;
  metadata?: Record<string, unknown>;
}

export interface WidgetStartChatData {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  initial_message?: string;
}

export interface SendMessageResponse {
  user_message: ChatMessage;
  assistant_message: ChatMessage | null;
  status: 'active' | 'escalated' | 'error';
}

// Chat Service (authenticated - dashboard)
export const chatService = {
  /**
   * Start a new conversation
   */
  async startConversation(data: StartChatData): Promise<{ conversation: ChatConversation; session_id: string }> {
    const response = await apiClient.post('/chat/start', data);
    return response.data.data;
  },

  /**
   * Send message and get AI response
   */
  async sendMessage(conversationId: string, content: string, contentType = 'text'): Promise<SendMessageResponse> {
    const response = await apiClient.post(`/chat/${conversationId}/send`, {
      content,
      content_type: contentType,
    });
    return response.data.data;
  },

  /**
   * Request handover to human agent
   */
  async requestHandover(conversationId: string, reason?: string): Promise<{ message: ChatMessage; status: string }> {
    const response = await apiClient.post(`/chat/${conversationId}/handover`, { reason });
    return response.data.data;
  },

  /**
   * End conversation
   */
  async endConversation(
    conversationId: string,
    rating?: number,
    feedback?: string
  ): Promise<{ message: ChatMessage; status: string }> {
    const response = await apiClient.post(`/chat/${conversationId}/end`, { rating, feedback });
    return response.data.data;
  },
};

// Widget Chat Service (public - no auth)
export const widgetChatService = {
  /**
   * Start chat via widget (public)
   */
  async startChat(widgetId: string, data: WidgetStartChatData): Promise<{ conversation: ChatConversation; session_id: string }> {
    const response = await apiClient.post(`/chat/widget/${widgetId}/start`, data);
    return response.data.data;
  },

  /**
   * Send message via widget (public)
   */
  async sendMessage(sessionId: string, content: string): Promise<SendMessageResponse> {
    const response = await apiClient.post(`/chat/session/${sessionId}/message`, {
      content,
      content_type: 'text',
    });
    return response.data.data;
  },

  /**
   * Get conversation by session ID
   */
  async getConversation(sessionId: string): Promise<ChatConversation> {
    const response = await apiClient.get(`/chat/session/${sessionId}`);
    return response.data.data;
  },
};
