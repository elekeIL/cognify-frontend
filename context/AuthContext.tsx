"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, tokenStorage, User, LoginCredentials, RegisterData, TokenResponse } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signup',
];

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname?.startsWith('/auth/')
  );

  // Fetch current user
  const refreshUser = useCallback(async () => {
    if (!tokenStorage.hasTokens()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      tokenStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial auth check
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Handle route protection
  useEffect(() => {
    if (isLoading) return;

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/auth/signin');
      return;
    }

    // If authenticated and trying to access auth routes, redirect to dashboard
    if (isAuthenticated && AUTH_ROUTES.includes(pathname || '')) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, isLoading, isPublicRoute, pathname, router]);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    const response: TokenResponse = await authApi.login(credentials);
    tokenStorage.setTokens(response.access_token, response.refresh_token);

    // Fetch user data
    const userData = await authApi.getMe();
    setUser(userData);

    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    const response: TokenResponse = await authApi.register(data);
    tokenStorage.setTokens(response.access_token, response.refresh_token);

    // Fetch user data
    const userData = await authApi.getMe();
    setUser(userData);

    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  // Logout function
  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setUser(null);
    router.push('/auth/signin');
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
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
