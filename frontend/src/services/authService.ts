import { STORAGE_KEYS } from '@constants/config';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types/index';
import * as SecureStore from 'expo-secure-store';
import api from './api';

class AuthService {
  async register(data: RegisterData): Promise<User> {
    try {
      const response = await api.post<User>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // Store token and role
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, response.data.access_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.ROLE, response.data.role);
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me');
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ROLE);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
  }

  async getStoredRole(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ROLE);
  }

  async getStoredToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
  }

  private handleError(error: any): Error {
    if (error.response?.data?.detail) {
      return new Error(error.response.data.detail);
    }
    return new Error('An unexpected error occurred');
  }
}

export default new AuthService();