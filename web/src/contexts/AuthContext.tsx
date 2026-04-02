'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Tenant, LoginCredentials, RegisterData } from '@/lib/api/types';
import { authService, getErrorMessage } from '@/lib/api/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

// Routes that authenticated users shouldn't access
const AUTH_ROUTES = ['/login', '/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });
  
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname?.startsWith('/api/')
  );

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!authService.isAuthenticated()) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const { user, tenant } = await authService.getCurrentUser();
        setState({
          user,
          tenant,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } catch (error) {
        // Token is invalid or expired
        setState({
          user: null,
          tenant: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    };

    initAuth();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (state.isLoading) return;

    // Redirect authenticated users away from auth routes
    if (state.isAuthenticated && AUTH_ROUTES.includes(pathname || '')) {
      router.replace('/dashboard');
      return;
    }

    // Redirect unauthenticated users away from protected routes
    if (!state.isAuthenticated && !isPublicRoute) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [state.isLoading, state.isAuthenticated, pathname, isPublicRoute, router]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, tenant } = await authService.login(credentials);
      
      setState({
        user,
        tenant,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      // Check if onboarding is completed
      const onboardingCompleted = tenant.settings?.onboarding_completed;
      
      // Get redirect URL from query params or default to dashboard
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || (onboardingCompleted ? '/dashboard' : '/onboarding');
      
      router.replace(redirect);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: getErrorMessage(error),
      }));
      throw error;
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, tenant } = await authService.register(data);
      
      setState({
        user,
        tenant,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      // New users always go to onboarding
      router.replace('/onboarding');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: getErrorMessage(error),
      }));
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
    } finally {
      setState({
        user: null,
        tenant: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      router.replace('/login');
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    
    try {
      const { user, tenant } = await authService.getCurrentUser();
      setState(prev => ({
        ...prev,
        user,
        tenant,
      }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to require authentication
export function useRequireAuth() {
  const { isAuthenticated, isLoading, user, tenant } = useAuth();
  
  return {
    isLoading,
    isAuthenticated,
    user: user!,
    tenant: tenant!,
  };
}
