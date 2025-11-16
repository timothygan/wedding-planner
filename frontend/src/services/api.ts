import axios from 'axios';
import type { Vendor, CreateVendorRequest, UpdateVendorRequest } from '../types/vendor';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Vendor API endpoints
export const vendorApi = {
  // Get all vendors
  getAll: async (): Promise<Vendor[]> => {
    const response = await api.get<Vendor[]>('/vendors');
    return response.data;
  },

  // Get vendor by ID
  getById: async (id: string): Promise<Vendor> => {
    const response = await api.get<Vendor>(`/vendors/${id}`);
    return response.data;
  },

  // Create new vendor
  create: async (data: CreateVendorRequest): Promise<Vendor> => {
    const response = await api.post<Vendor>('/vendors', data);
    return response.data;
  },

  // Update existing vendor
  update: async (id: string, data: UpdateVendorRequest): Promise<Vendor> => {
    const response = await api.put<Vendor>(`/vendors/${id}`, data);
    return response.data;
  },

  // Delete vendor
  delete: async (id: string): Promise<void> => {
    await api.delete(`/vendors/${id}`);
  },
};

export default api;
