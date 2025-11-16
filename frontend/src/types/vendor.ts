// Vendor types matching the backend schema

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  starting_price?: number;
  status: VendorStatus;
  notes?: string;
  ai_discovery_source?: string;
  last_communication_at?: string;
  last_communication_type?: string;
  created_at: string;
  updated_at: string;
}

export type VendorCategory =
  | 'photographer'
  | 'venue'
  | 'caterer'
  | 'florist'
  | 'dj'
  | 'videographer'
  | 'planner'
  | 'baker'
  | 'designer'
  | 'rentals';

export type VendorStatus = 'considering' | 'booked' | 'rejected';

export interface CreateVendorRequest {
  name: string;
  category: VendorCategory;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  starting_price?: number;
  status?: VendorStatus;
  notes?: string;
  ai_discovery_source?: string;
}

export interface UpdateVendorRequest {
  name?: string;
  category?: VendorCategory;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  starting_price?: number;
  status?: VendorStatus;
  notes?: string;
  ai_discovery_source?: string;
}
