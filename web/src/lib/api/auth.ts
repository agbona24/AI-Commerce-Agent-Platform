import apiClient, { getErrorMessage } from './client';
import { ApiResponse, AuthResponse, LoginCredentials, RegisterData, User, Tenant, OnboardingData } from './types';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_DAYS = 7;

export const authService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<{ user: User & { tenant: Tenant }; token: string; token_type: string }>>('/auth/login', credentials);
    
    const { user, token } = response.data.data;
    const tenant = user.tenant;
    
    // Store token in cookie
    Cookies.set(TOKEN_KEY, token, {
      expires: credentials.remember ? TOKEN_EXPIRY_DAYS : undefined, // Session cookie if not remembered
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return { user, tenant, token };
  },

  /**
   * Register a new user and tenant
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    
    const { user, tenant, token } = response.data.data;
    
    // Store token in cookie
    Cookies.set(TOKEN_KEY, token, {
      expires: TOKEN_EXPIRY_DAYS,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return { user, tenant, token };
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Always clear token, even if API call fails
      Cookies.remove(TOKEN_KEY);
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<{ user: User; tenant: Tenant }> {
    const response = await apiClient.get<ApiResponse<{ user: User; tenant: Tenant }>>('/auth/me');
    return response.data.data;
  },

  /**
   * Refresh auth token
   */
  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
    const { token } = response.data.data;
    
    Cookies.set(TOKEN_KEY, token, {
      expires: TOKEN_EXPIRY_DAYS,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return { token };
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!Cookies.get(TOKEN_KEY);
  },

  /**
   * Get stored auth token
   */
  getToken(): string | undefined {
    return Cookies.get(TOKEN_KEY);
  },

  /**
   * Complete onboarding - update tenant settings
   */
  async completeOnboarding(data: OnboardingData): Promise<Tenant> {
    const response = await apiClient.put<ApiResponse<Tenant>>('/settings/business', {
      business_name: data.business_name,
      website: data.website,
      industry: data.custom_industry || data.industry,
      company_size: data.team_size,
      settings: {
        ai: {
          tasks: data.ai_tasks,
          tone: data.ai_tone,
        },
        channels: data.channels,
        onboarding_completed: true,
      },
    });
    
    return response.data.data;
  },
};

export { getErrorMessage };
