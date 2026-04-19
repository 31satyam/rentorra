import { Inquiry, InquiryCreateData, Property, PropertyCreateData } from '../types/index';
import api from './api';

class PropertyService {
  // ==================== PUBLIC ENDPOINTS (for everyone) ====================
  
  /**
   * Get all properties with optional filters
   */
  async getAllProperties(params?: {
    city?: string;
    min_rent?: number;
    max_rent?: number;
    skip?: number;
    limit?: number;
  }): Promise<Property[]> {
    try {
      const response = await api.get<Property[]>('/properties', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a single property by ID
   */
  async getPropertyById(id: number): Promise<Property> {
    try {
      const response = await api.get<Property>(`/properties/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== LANDLORD ENDPOINTS ====================

  /**
   * Create a new property (landlord only)
   */
  async createProperty(data: PropertyCreateData): Promise<Property> {
    try {
      const response = await api.post<Property>('/properties', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing property (landlord only)
   */
  async updateProperty(id: number, data: Partial<PropertyCreateData>): Promise<Property> {
    try {
      const response = await api.put<Property>(`/properties/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a property (landlord only)
   */
  async deleteProperty(id: number): Promise<void> {
    try {
      await api.delete(`/properties/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload images for a property (landlord only)
   */
  async uploadPropertyImages(propertyId: number, formData: FormData): Promise<{ urls: string[] }> {
    try {
      const response = await api.post(
        `/properties/${propertyId}/images`,
        formData,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all properties owned by the current landlord
   */
  async getMyProperties(): Promise<Property[]> {
    try {
      const response = await api.get<Property[]>('/landlord/my-properties');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all inquiries for landlord's properties
   */
  async getLandlordInquiries(): Promise<Inquiry[]> {
    try {
      const response = await api.get<Inquiry[]>('/landlord/my-inquiries');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== TENANT ENDPOINTS ====================

  /**
   * Create a new inquiry for a property (tenant only)
   */
  async createInquiry(data: InquiryCreateData): Promise<Inquiry> {
    try {
      const response = await api.post<Inquiry>('/tenant/inquiries', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async replyToInquiry(inquiryId: number, reply: string) {
    try {
      const response = await api.post(
        `/landlord/inquiries/${inquiryId}/reply`,
        { reply }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  /**
   * Get all inquiries made by the current tenant
   * Note: You may need to add this endpoint to your backend
   */
  async getMyInquiries(): Promise<Inquiry[]> {
    try {
      // You'll need to add this endpoint to your backend
      const response = await api.get<Inquiry[]>('/tenant/my-inquiries');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add a property to wishlist (tenant only)
   */
  async addToWishlist(propertyId: number): Promise<void> {
    try {
      await api.post('/tenant/wishlist', { property_id: propertyId });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all properties in tenant's wishlist
   */
  async getWishlist(): Promise<Property[]> {
    try {
      const response = await api.get<Property[]>('/tenant/wishlist');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove a property from wishlist (tenant only)
   */
  async removeFromWishlist(propertyId: number): Promise<void> {
    try {
      await api.delete(`/tenant/wishlist/${propertyId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Handle API errors consistently
   */
  private handleError(error: any): Error {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data?.detail || 
                     error.response.data?.message || 
                     `Error: ${error.response.status}`;
      return new Error(message);
    } else if (error.request) {
      // The request was made but no response was received
      return new Error('No response from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * Create form data for image upload
   */
  createImageFormData(images: { uri: string; type?: string; name?: string }[]): FormData {
    const formData = new FormData();
    
    images.forEach((image, index) => {
      formData.append("files", {
        uri: image,
        name: `image_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });
    
    return formData;
  }

  /**
   * Format property data for display
   */
  formatPropertyForDisplay(property: Property): any {
    return {
      ...property,
      formattedRent: `₹${property.rent_amount.toLocaleString()}/month`,
      formattedDeposit: property.deposit_amount ? 
        `₹${property.deposit_amount.toLocaleString()}` : 'No deposit',
      fullAddress: `${property.address}, ${property.city}`,
      mainImage: property.images && property.images.length > 0 ? 
        property.images[0].image_url : null,
      hasImages: property.images && property.images.length > 0,
    };
  }

  /**
   * Search properties by location (helper method)
   */
  async searchByLocation(city: string, maxDistance?: number): Promise<Property[]> {
    return this.getAllProperties({ city });
  }

  /**
   * Filter properties by price range
   */
  async filterByPrice(min: number, max: number): Promise<Property[]> {
    return this.getAllProperties({ min_rent: min, max_rent: max });
  }

  /**
   * Get properties by type
   */
  async getPropertiesByType(type: string): Promise<Property[]> {
    // You'll need to add this filter to your backend or handle it client-side
    const allProperties = await this.getAllProperties();
    return allProperties.filter(p => p.property_type?.toLowerCase() === type.toLowerCase());
  }

  /**
   * Get nearby properties (if you have latitude/longitude)
   */
  async getNearbyProperties(lat: number, lng: number, radius: number = 5): Promise<Property[]> {
    // This requires backend support with geolocation
    try {
      const response = await api.get<Property[]>('/properties/nearby', {
        params: { lat, lng, radius }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Create and export a single instance
const propertyService = new PropertyService();
export default propertyService;