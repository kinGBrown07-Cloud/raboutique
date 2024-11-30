import { create } from 'zustand';
import { authService } from '../services/authService';
import type { User, LoginCredentials, RegisterData } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const { user, token } = await authService.login(credentials);
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during login',
        isLoading: false 
      });
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const { user, token } = await authService.register(data);
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred during registration',
        isLoading: false 
      });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  clearError: () => set({ error: null })
}));