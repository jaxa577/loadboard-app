import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  rating?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data;

    // Validate token exists
    if (!accessToken) {
      throw new Error('No access token received from server');
    }

    // Store token and user data
    await AsyncStorage.setItem('token', accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
    await AsyncStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
  },

  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  },
};
