import { useState, useEffect, useRef } from 'react';
import { useVendors, useCreateVendor, useUpdateVendor } from '../hooks/useVendors';
import { useTasks } from '../hooks/useTasks';
import { useReminders } from '../hooks/useReminders';
import VendorCard from '../components/vendors/VendorCard';
import VendorComparison from '../components/vendors/VendorComparison';
import type { VendorCategory, VendorStatus, Vendor } from '../types/vendor';

export default function VendorsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const { mutate: createVendor } = useCreateVendor();
  const { mutate: updateVendor } = useUpdateVendor();
  const { data: tasks } = useTasks();
  const { data: reminders } = useReminders();
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

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const {
    data: vendors,
    isLoading,
    error,
  } = useVendors(
    categoryFilter || undefined,
    statusFilter || undefined,
    debouncedSearchQuery || undefined
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

  const resetForm = () => {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category) {
      return;
    }

    const vendorData = {
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
    };

    if (editingVendor) {
      updateVendor(
        {
          id: editingVendor.id,
          data: vendorData,
        },
        {
          onSuccess: () => {
            setEditingVendor(null);
            resetForm();
          },
        }
      );
    } else {
      createVendor(vendorData, {
        onSuccess: () => {
          setShowCreateForm(false);
          resetForm();
        },
      });
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowCreateForm(false);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      email: vendor.email || '',
      phone: vendor.phone || '',
      website: vendor.website || '',
      city: vendor.city || '',
      state: vendor.state || '',
      starting_price: vendor.starting_price ? (vendor.starting_price / 100).toString() : '',
      status: vendor.status,
      notes: vendor.notes || '',
    });
  };

  const handleCancel = () => {
    setEditingVendor(null);
    setShowCreateForm(false);
    resetForm();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-graphite">Wedding Vendors</h1>
          <p className="text-graphite">
            Manage your wedding vendor contacts and track their status
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-cinnabar text-ivory rounded-lg hover:opacity-90 transition-all duration-300 shadow-md"
        >
          {showCreateForm ? 'Cancel' : '+ New Vendor'}
        </button>
      </div>

      <div className={`mb-8 overflow-hidden transition-all duration-500 ease-in-out ${
        showCreateForm || editingVendor 
          ? 'max-h-[3000px] opacity-100' 
          : 'max-h-0 opacity-0 mb-0'
      }`}>
        <div className={`bg-ivory border border-old-gold rounded-lg p-6 transform transition-all duration-500 ease-in-out shadow-lg ${
          showCreateForm || editingVendor
            ? 'translate-y-0 opacity-100'
            : '-translate-y-4 opacity-0'
        }`}>
          <h2 className="text-xl font-semibold mb-4 text-graphite">
            {editingVendor ? 'Edit Vendor' : 'Create New Vendor'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-ivory border border-old-gold rounded-lg text-graphite placeholder-forest-moss focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
                  placeholder="Vendor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as VendorCategory })
                  }
                  className="w-full px-3 py-2 bg-ivory border border-old-gold rounded-lg text-graphite focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
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
                className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
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
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
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
                className="w-full px-3 py-2 bg-white border border-rose-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all resize-none"
                rows={3}
                placeholder="Additional notes about this vendor..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-cinnabar text-ivory rounded-lg hover:opacity-90 transition-all duration-300 shadow-md"
              >
                {editingVendor ? 'Update Vendor' : 'Create Vendor'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-old-gold bg-opacity-20 text-graphite rounded-lg hover:bg-opacity-30 transition-all duration-300 border border-old-gold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by name, city, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 bg-ivory border border-old-gold rounded-lg text-graphite placeholder-forest-moss focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-ivory border border-old-gold rounded-lg text-graphite focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
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
            className="px-4 py-2 bg-ivory border border-old-gold rounded-lg text-graphite focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
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
          <div className="flex items-center gap-4 p-3 bg-old-gold bg-opacity-10 border border-old-gold rounded-lg">
            <span className="text-sm font-medium text-graphite">
              {selectedVendors.size} vendor{selectedVendors.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setShowComparison(true)}
              disabled={selectedVendors.size < 2}
              className="px-4 py-2 bg-cinnabar text-ivory rounded-lg hover:opacity-90 transition-all duration-300 shadow-md disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Compare Selected
            </button>
            <button
              onClick={() => setSelectedVendors(new Set())}
              className="px-4 py-2 bg-old-gold bg-opacity-20 text-graphite rounded-lg hover:bg-opacity-30 transition-all duration-300 border border-old-gold"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {vendors && vendors.length === 0 ? (
        <div className="text-center py-12 bg-ivory border border-old-gold rounded-lg">
          <p className="text-graphite text-lg mb-4">No vendors yet</p>
          <p className="text-forest-moss">
            Add your first vendor to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors?.map((vendor) => {
            const associatedTasks = tasks?.filter((task) => task.vendor_id === vendor.id) || [];
            const associatedReminders = reminders?.filter((reminder) => reminder.vendor_id === vendor.id) || [];
            
            return (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                isSelected={selectedVendors.has(vendor.id)}
                isExpanded={expandedVendor === vendor.id}
                associatedTasks={associatedTasks}
                associatedReminders={associatedReminders}
                onSelectChange={(selected) => {
                  const newSelected = new Set(selectedVendors);
                  if (selected) {
                    newSelected.add(vendor.id);
                  } else {
                    newSelected.delete(vendor.id);
                  }
                  setSelectedVendors(newSelected);
                }}
                onEdit={handleEdit}
                onExpand={() => {
                  setExpandedVendor(expandedVendor === vendor.id ? null : vendor.id);
                }}
              />
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-graphite">
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
