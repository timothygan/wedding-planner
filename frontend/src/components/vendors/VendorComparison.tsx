import type { Vendor } from '../../types/vendor';
import { useUpdateVendor } from '../../hooks/useVendors';

interface VendorComparisonProps {
  vendors: Vendor[];
  onClose: () => void;
}

export default function VendorComparison({ vendors, onClose }: VendorComparisonProps) {
  const { mutate: updateVendor } = useUpdateVendor();

  const formatPrice = (price?: number) => {
    if (!price) return 'Not listed';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-green-100 text-green-800';
      case 'considering':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      photographer: '📷',
      venue: '🏛️',
      caterer: '🍽️',
      florist: '💐',
      dj: '🎵',
      videographer: '🎥',
      planner: '📋',
      baker: '🎂',
      designer: '✨',
      rentals: '🏪',
    };
    return emojiMap[category] || '🔖';
  };

  if (vendors.length === 0) {
    return null;
  }

  // Get all unique fields to compare
  const fields = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'starting_price', label: 'Starting Price', type: 'currency' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'website', label: 'Website', type: 'link' },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'state', label: 'State', type: 'text' },
    { key: 'notes', label: 'Notes', type: 'text' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Compare Vendors</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3 font-semibold sticky left-0 bg-white z-10 min-w-[200px]">
                    Field
                  </th>
                  {vendors.map((vendor) => (
                    <th
                      key={vendor.id}
                      className="text-center p-3 font-semibold border-l border-gray-200 min-w-[250px]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">{getCategoryEmoji(vendor.category)}</span>
                        <span className="font-bold">{vendor.name}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            vendor.status
                          )}`}
                        >
                          {vendor.status}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.key} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-medium sticky left-0 bg-white z-10">
                      {field.label}
                    </td>
                    {vendors.map((vendor) => {
                      const value = vendor[field.key as keyof Vendor];
                      let displayValue: React.ReactNode = '-';

                      if (value) {
                        if (field.type === 'currency' && typeof value === 'number') {
                          displayValue = formatPrice(value);
                        } else if (field.type === 'link' && typeof value === 'string') {
                          displayValue = (
                            <a
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {value}
                            </a>
                          );
                        } else if (field.type === 'status') {
                          displayValue = (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                value as string
                              )}`}
                            >
                              {value as string}
                            </span>
                          );
                        } else if (field.key === 'notes' && typeof value === 'string') {
                          displayValue = (
                            <div className="text-sm text-gray-600 max-w-xs truncate" title={value}>
                              {value}
                            </div>
                          );
                        } else {
                          displayValue = String(value);
                        }
                      }

                      return (
                        <td key={vendor.id} className="p-3 text-center border-l border-gray-200">
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

