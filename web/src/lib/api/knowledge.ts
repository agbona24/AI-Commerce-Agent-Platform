import apiClient from './client';
import { ApiResponse, PaginatedResponse, KnowledgeBase } from './types';

export interface KnowledgeBaseFilters {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateKnowledgeBaseData {
  name: string;
  description?: string;
  type: 'text' | 'file' | 'url' | 'faq';
  content?: string;
  source_url?: string;
}

export interface UpdateKnowledgeBaseData {
  title?: string;
  content?: string;
  status?: 'active' | 'inactive' | 'processing';
  metadata?: Record<string, unknown>;
}

export interface KnowledgeBaseStats {
  total_documents: number;
  total_chunks: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  last_synced: string | null;
}

export const knowledgeBaseService = {
  /**
   * Get paginated list of knowledge base items
   */
  async getKnowledgeBases(filters: KnowledgeBaseFilters = {}): Promise<PaginatedResponse<KnowledgeBase>> {
    const response = await apiClient.get<PaginatedResponse<KnowledgeBase>>('/knowledge-bases', {
      params: filters
    });
    return response.data;
  },

  /**
   * Get a single knowledge base item
   */
  async getKnowledgeBase(id: string): Promise<KnowledgeBase> {
    const response = await apiClient.get<ApiResponse<KnowledgeBase>>(`/knowledge-bases/${id}`);
    return response.data.data;
  },

  /**
   * Create a new knowledge base item (text/url)
   */
  async createKnowledgeBase(data: CreateKnowledgeBaseData): Promise<KnowledgeBase> {
    const response = await apiClient.post<ApiResponse<KnowledgeBase>>('/knowledge-bases', {
      name: data.name,
      description: data.description,
      type: data.type,
      content: data.content,
      source_url: data.source_url,
    });
    return response.data.data;
  },

  /**
   * Upload a document to knowledge base
   */
  async uploadDocument(name: string, file: File, description?: string): Promise<KnowledgeBase> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    const response = await apiClient.post<ApiResponse<KnowledgeBase>>('/knowledge-bases/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  /**
   * Update a knowledge base item
   */
  async updateKnowledgeBase(id: string, data: UpdateKnowledgeBaseData): Promise<KnowledgeBase> {
    const response = await apiClient.put<ApiResponse<KnowledgeBase>>(`/knowledge-bases/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a knowledge base item
   */
  async deleteKnowledgeBase(id: string): Promise<void> {
    await apiClient.delete(`/knowledge-bases/${id}`);
  },

  /**
   * Sync/process a knowledge base item
   */
  async sync(id: string): Promise<KnowledgeBase> {
    const response = await apiClient.post<ApiResponse<KnowledgeBase>>(`/knowledge-bases/${id}/sync`);
    return response.data.data;
  },

  /**
   * Get knowledge base statistics
   */
  async getStats(): Promise<KnowledgeBaseStats> {
    const response = await apiClient.get<ApiResponse<KnowledgeBaseStats>>('/knowledge-bases/stats');
    return response.data.data;
  },

  /**
   * Search knowledge base content
   */
  async search(query: string, limit: number = 10): Promise<Array<{
    id: string;
    title: string;
    content: string;
    score: number;
    knowledge_base_id: string;
  }>> {
    const response = await apiClient.post<ApiResponse<Array<{
      id: string;
      title: string;
      content: string;
      score: number;
      knowledge_base_id: string;
    }>>>('/knowledge-bases/search', {
      query,
      limit
    });
    return response.data.data;
  },

  /**
   * Bulk delete knowledge base items
   */
  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    const response = await apiClient.post<ApiResponse<{ deleted: number }>>('/knowledge-bases/bulk-delete', {
      ids
    });
    return response.data.data;
  },

  /**
   * Add FAQ entries
   */
  async addFAQ(title: string, faqs: Array<{ question: string; answer: string }>): Promise<KnowledgeBase> {
    const response = await apiClient.post<ApiResponse<KnowledgeBase>>('/knowledge-bases', {
      title,
      type: 'faq',
      content: JSON.stringify(faqs),
      metadata: { faq_count: faqs.length }
    });
    return response.data.data;
  },
};

export default knowledgeBaseService;
