import { apiRequest } from './client';

// Types
export interface TeamMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'admin' | 'agent' | 'member';
  timezone?: string;
  language?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamStats {
  total: number;
  by_role: {
    owner: number;
    admin: number;
    agent: number;
    member: number;
  };
  recent: TeamMember[];
}

export interface InviteMemberData {
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'agent' | 'member';
}

export interface UpdateMemberData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'admin' | 'agent' | 'member';
  timezone?: string;
  language?: string;
}

export interface TeamListParams {
  search?: string;
  role?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Team API Service
export const teamService = {
  // Get all team members
  async getMembers(params?: TeamListParams): Promise<PaginatedResponse<TeamMember>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_dir) queryParams.append('sort_dir', params.sort_dir);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const query = queryParams.toString();
    return apiRequest(`/team${query ? `?${query}` : ''}`);
  },

  // Get team statistics
  async getStats(): Promise<TeamStats> {
    const response = await apiRequest<{ data: TeamStats }>('/team/stats');
    return response.data;
  },

  // Get a single team member
  async getMember(id: number): Promise<TeamMember> {
    const response = await apiRequest<{ data: TeamMember }>(`/team/${id}`);
    return response.data;
  },

  // Invite a new team member
  async inviteMember(data: InviteMemberData): Promise<TeamMember> {
    const response = await apiRequest<{ data: TeamMember }>('/team/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update a team member
  async updateMember(id: number, data: UpdateMemberData): Promise<TeamMember> {
    const response = await apiRequest<{ data: TeamMember }>(`/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Remove a team member
  async removeMember(id: number): Promise<void> {
    await apiRequest(`/team/${id}`, {
      method: 'DELETE',
    });
  },

  // Resend invitation
  async resendInvite(id: number): Promise<void> {
    await apiRequest(`/team/${id}/resend-invite`, {
      method: 'POST',
    });
  },
};
