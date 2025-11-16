import { useState } from 'react';
import { useVendors, useCreateVendor } from '../hooks/useVendors';
import VendorCard from '../components/vendors/VendorCard';
import VendorComparison from '../components/vendors/VendorComparison';
import type { VendorCategory, VendorStatus, Vendor } from '../types/vendor';

export default function VendorsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { mutate: createVendor } = useCreateVendor();
  const [formData, setFormData] = useState({
    name: '',
    category: '' as VendorCategory | '',
    email: '',
    phone: '',
    website: '',
    city: '',
    state: '',
    starting_price: '',
    status: 'considering' as VendorStatus,
    notes: '',
  });

  const {
    data: vendors,
    isLoading,
    error,
  } = useVendors(
    categoryFilter || undefined,
    statusFilter || undefined,
    searchQuery || undefined
  );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category) {
      return;
    }

    createVendor(
      {
        name: formData.name.trim(),
        category: formData.category,
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        website: formData.website?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        state: formData.state?.trim() || undefined,
        starting_price: formData.starting_price
          ? Math.round(parseFloat(formData.starting_price) * 100)
          : undefined,
        status: formData.status,
        notes: formData.notes?.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowCreateForm(false);
          setFormData({
            name: '',
            category: '' as VendorCategory | '',
            email: '',
            phone: '',
            website: '',
            city: '',
            state: '',
            starting_price: '',
            status: 'considering',
            notes: '',
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Wedding Vendors</h1>
          <p className="text-gray-600">
            Manage your wedding vendor contacts and track their status
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Cancel' : '+ New Vendor'}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8 bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Vendor</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Vendor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as VendorCategory })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="vendor@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.starting_price}
                  onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as VendorStatus })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Additional notes about this vendor..."
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Vendor
            </button>
          </form>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
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

        {selectedVendors.size > 0 && (
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {selectedVendors.size} vendor{selectedVendors.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setShowComparison(true)}
              disabled={selectedVendors.size < 2}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Compare Selected
            </button>
            <button
              onClick={() => setSelectedVendors(new Set())}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
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
            <div key={vendor.id} className="relative">
              <input
                type="checkbox"
                checked={selectedVendors.has(vendor.id)}
                onChange={(e) => {
                  const newSelected = new Set(selectedVendors);
                  if (e.target.checked) {
                    newSelected.add(vendor.id);
                  } else {
                    newSelected.delete(vendor.id);
                  }
                  setSelectedVendors(newSelected);
                }}
                className="absolute top-2 right-2 z-10 w-5 h-5 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
              <VendorCard
                vendor={vendor}
                onClick={() => {
                  const newSelected = new Set(selectedVendors);
                  if (newSelected.has(vendor.id)) {
                    newSelected.delete(vendor.id);
                  } else {
                    newSelected.add(vendor.id);
                  }
                  setSelectedVendors(newSelected);
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        Total vendors: {vendors?.length || 0}
      </div>

      {showComparison && vendors && (
        <VendorComparison
          vendors={vendors.filter((v) => selectedVendors.has(v.id))}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
