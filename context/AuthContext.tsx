import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  error: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  department?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await api.loadToken();
      if (token) {
        try {
          const user = await api.get<User>('/auth/me');
          setState({ user, token, isLoading: false, isAuthenticated: true });
        } catch {
          await api.setToken(null);
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      await api.setToken(data.token);
      setState({ user: data.user, token: data.token, isLoading: false, isAuthenticated: true });
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : (e.message || 'Network error. Please try again.');
      setError(message);
      throw e;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setError(null);
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/register', data);
      await api.setToken(response.token);
      setState({ user: response.user, token: response.token, isLoading: false, isAuthenticated: true });
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : (e.message || 'Network error. Please try again.');
      setError(message);
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    }
    await api.setToken(null);
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : (e.message || 'Network error. Please try again.');
      setError(message);
      throw e;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setError(null);
    try {
      const user = await api.put<User>('/auth/profile', data);
      setState(prev => ({ ...prev, user }));
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : (e.message || 'Network error. Please try again.');
      setError(message);
      throw e;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        forgotPassword,
        updateProfile,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
