// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'tenant' | 'landlord';
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'tenant' | 'landlord';
}

// Property Types
export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
}

export interface Property {
  id: number;
  title: string;
  description?: string;
  rent_amount: number;
  deposit_amount?: number;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  property_type?: string;
  owner_id: number;
  created_at: string;
  images: PropertyImage[];
}

export interface PropertyCreateData {
  title: string;
  description?: string;
  rent_amount: number;
  deposit_amount?: number;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  property_type?: string;
}

// Inquiry Types
export interface Inquiry {
  id: number;
  property_id: number;
  tenant_id: number;
  message: string;
  reply?: string;   
  created_at: string;
}

export interface InquiryCreateData {
  property_id: number;
  message?: string;
}

// Wishlist Types
export interface WishlistItem {
  id: number;
  tenant_id: number;
  property_id: number;
  property: Property;
}

// API Response Types
export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}