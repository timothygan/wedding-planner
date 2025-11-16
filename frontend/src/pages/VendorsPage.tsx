import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '../services/api';
import VendorCard from '../components/vendors/VendorCard';

export default function VendorsPage() {
  const {
    data: vendors,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorApi.getAll,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wedding Vendors</h1>
        <p className="text-gray-600">
          Manage your wedding vendor contacts and track their status
        </p>
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
