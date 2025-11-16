import axios from 'axios';
import type { Vendor, CreateVendorRequest, UpdateVendorRequest } from '../types/vendor';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import type { Reminder, CreateReminderRequest, UpdateReminderRequest } from '../types/reminder';
import type { BudgetItem, CreateBudgetItemRequest, UpdateBudgetItemRequest } from '../types/budget';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Vendor API endpoints
export const vendorApi = {
  // Get all vendors with optional filters
  getAll: async (category?: string, status?: string, search?: string): Promise<Vendor[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const queryString = params.toString();
    const url = queryString ? `/vendors?${queryString}` : '/vendors';
    const response = await api.get<Vendor[]>(url);
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

// Task API endpoints
export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  },
  getById: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },
  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },
  update: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// Reminder API endpoints
export const reminderApi = {
  getAll: async (): Promise<Reminder[]> => {
    const response = await api.get<Reminder[]>('/reminders');
    return response.data;
  },
  getById: async (id: string): Promise<Reminder> => {
    const response = await api.get<Reminder>(`/reminders/${id}`);
    return response.data;
  },
  create: async (data: CreateReminderRequest): Promise<Reminder> => {
    const response = await api.post<Reminder>('/reminders', data);
    return response.data;
  },
  update: async (id: string, data: UpdateReminderRequest): Promise<Reminder> => {
    const response = await api.put<Reminder>(`/reminders/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/reminders/${id}`);
  },
  // Get due reminders
  getDue: async (): Promise<Reminder[]> => {
    const response = await api.get<Reminder[]>('/reminders/due');
    return response.data;
  },
  // Process reminder (send notifications)
  process: async (id: string, email?: string): Promise<void> => {
    const url = email ? `/reminders/${id}/process?email=${encodeURIComponent(email)}` : `/reminders/${id}/process`;
    await api.post(url);
  },
};

// Budget item API endpoints
export const budgetItemApi = {
  getAll: async (): Promise<BudgetItem[]> => {
    const response = await api.get<BudgetItem[]>('/budget-items');
    return response.data;
  },
  getById: async (id: string): Promise<BudgetItem> => {
    const response = await api.get<BudgetItem>(`/budget-items/${id}`);
    return response.data;
  },
  create: async (data: CreateBudgetItemRequest): Promise<BudgetItem> => {
    const response = await api.post<BudgetItem>('/budget-items', data);
    return response.data;
  },
  update: async (id: string, data: UpdateBudgetItemRequest): Promise<BudgetItem> => {
    const response = await api.put<BudgetItem>(`/budget-items/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/budget-items/${id}`);
  },
};

export default api;
