import axios from 'axios';
import type { User, LoginCredentials, RegisterData } from '../types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }
};
