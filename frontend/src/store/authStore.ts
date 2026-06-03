import { create } from 'zustand';
import { apiClient } from '@/api/client';

interface User {
  id: string;
  email: string;
  name: string;
  planTier: 'free' | 'premium' | 'institutional';
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, token, refreshToken } = response.data;
      localStorage.setItem('unios_token', token);
      localStorage.setItem('unios_refresh_token', refreshToken);
      set({ user, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/register', { email, password, name });
      const { user, token, refreshToken } = response.data;
      localStorage.setItem('unios_token', token);
      localStorage.setItem('unios_refresh_token', refreshToken);
      set({ user, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('unios_token');
    localStorage.removeItem('unios_refresh_token');
    set({ user: null, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('unios_token');
    if (!token) {
      set({ user: null, isLoading: false });
      return;
    }

    try {
      const response = await apiClient.get('/auth/me');
      set({ user: response.data, isLoading: false });
    } catch {
      localStorage.removeItem('unios_token');
      localStorage.removeItem('unios_refresh_token');
      set({ user: null, isLoading: false });
    }
  },
}));