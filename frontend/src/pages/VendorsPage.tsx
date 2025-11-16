import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '../services/api';
import VendorCard from '../components/vendors/VendorCard';
import type { VendorCategory, VendorStatus } from '../types/vendor';

export default function VendorsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    data: vendors,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['vendors', categoryFilter, statusFilter, searchQuery],
    queryFn: () => vendorApi.getAll(categoryFilter || undefined, statusFilter || undefined, searchQuery || undefined),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading vendors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          Error loading vendors: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  const categories: VendorCategory[] = [
    'photographer', 'venue', 'caterer', 'florist', 'dj',
    'videographer', 'planner', 'baker', 'designer', 'rentals',
  ];
  const statuses: VendorStatus[] = ['considering', 'booked', 'rejected'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wedding Vendors</h1>
        <p className="text-gray-600">
          Manage your wedding vendor contacts and track their status
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by name, city, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {vendors && vendors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No vendors yet</p>
          <p className="text-gray-400">
            Add your first vendor to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors?.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onClick={() => console.log('Clicked vendor:', vendor.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        Total vendors: {vendors?.length || 0}
      </div>
    </div>
  );
}
