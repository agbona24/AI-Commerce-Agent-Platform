import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Original request config available if needed for retry logic
    const _originalRequest = error.config;
    
    // Handle 401 - unauthorized
    if (error.response?.status === 401) {
      // Clear auth data
      Cookies.remove('auth_token');
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper for extracting error messages
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
    
    // Check for validation errors
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      const firstError = Object.values(errors)[0];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    }
    
    // Check for message
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // Default HTTP error messages
    switch (axiosError.response?.status) {
      case 400: return 'Bad request. Please check your input.';
      case 401: return 'Invalid credentials. Please try again.';
      case 403: return 'You do not have permission to perform this action.';
      case 404: return 'Resource not found.';
      case 422: return 'Validation failed. Please check your input.';
      case 429: return 'Too many requests. Please try again later.';
      case 500: return 'Server error. Please try again later.';
      default: return axiosError.message || 'An unexpected error occurred.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
}

// Generic API request helper
export async function apiRequest<T = unknown>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: string;
    headers?: Record<string, string>;
  }
): Promise<T> {
  const method = options?.method || 'GET';
  
  let response;
  switch (method) {
    case 'POST':
      response = await apiClient.post<T>(url, options?.body ? JSON.parse(options.body) : undefined);
      break;
    case 'PUT':
      response = await apiClient.put<T>(url, options?.body ? JSON.parse(options.body) : undefined);
      break;
    case 'PATCH':
      response = await apiClient.patch<T>(url, options?.body ? JSON.parse(options.body) : undefined);
      break;
    case 'DELETE':
      response = await apiClient.delete<T>(url);
      break;
    default:
      response = await apiClient.get<T>(url);
  }
  
  return response.data;
}
