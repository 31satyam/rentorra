import { API_URL, STORAGE_KEYS } from '@constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      console.log('🔑 API Request - Token found:', !!token);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request:', config.url);
      } else {
        console.log('⚠️ No token found for request:', config.url);
      }
      return config;
    } catch (error) {
      console.error('Error adding token to request:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - Token might be expired');
      // Clear stored data on 401
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.ROLE);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    }
    
    return Promise.reject(error);
  }
);

export default api;