import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Types
type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'tenant' | 'landlord';
  is_verified: boolean;
  created_at: string;
};

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'tenant' | 'landlord';
};

type AuthContextType = {
  user: User | null;
  userRole: 'tenant' | 'landlord' | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string; data?: User }>;
  logout: () => Promise<void>;
};

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'userToken',
  ROLE: 'userRole',
  USER: 'userData',
} as const;

// API Base URL - CHANGE THIS TO YOUR IP
const API_URL = 'http://192.168.2.41:8001';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'tenant' | 'landlord' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored data on mount
  useEffect(() => {
    loadStoredData();
  }, []);

  // Log state changes
  useEffect(() => {
    console.log('Auth State:', { userRole, isLoading, hasUser: !!user });
  }, [userRole, isLoading, user]);

  // Load data from storage
  const loadStoredData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading stored data...');
      
      // Get stored data using AsyncStorage
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedRole = await AsyncStorage.getItem(STORAGE_KEYS.ROLE) as 'tenant' | 'landlord' | null;
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      console.log('Stored data:', { 
        hasToken: !!storedToken, 
        storedRole, 
        hasUser: !!storedUser 
      });

      if (storedToken && storedRole) {
        setUserRole(storedRole);
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login method
  const login = async (credentials: LoginCredentials) => {
    console.log('Login attempt for:', credentials.email);
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        return { 
          success: false, 
          error: data.detail || 'Login failed' 
        };
      }

      // Store token and role using AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.access_token);
      await AsyncStorage.setItem(STORAGE_KEYS.ROLE, data.role);
      
      // Update state
      setUserRole(data.role);
      console.log('User role set to:', data.role);

      // Fetch user data
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        console.log('User data stored:', userData.name);
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error. Please check your connection.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register method
  const register = async (data: RegisterData) => {
    console.log('Register attempt for:', data.email);
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Register response:', responseData);

      if (!response.ok) {
        return { 
          success: false, 
          error: responseData.detail || 'Registration failed' 
        };
      }

      return { success: true, data: responseData };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'Network error' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout method
  const logout = async () => {
    try {
      console.log('Logging out...');
      
      // Clear all stored data using AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.ROLE);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      
      // Clear state
      setUser(null);
      setUserRole(null);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};  