import type { Vendor } from '../../types/vendor';

interface VendorCardProps {
  vendor: Vendor;
  onClick?: () => void;
}

export default function VendorCard({ vendor, onClick }: VendorCardProps) {
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

  const formatPrice = (price?: number) => {
    if (!price) return 'Price not listed';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCategoryEmoji(vendor.category)}</span>
          <h3 className="font-semibold text-lg">{vendor.name}</h3>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            vendor.status
          )}`}
        >
          {vendor.status}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p className="capitalize">{vendor.category}</p>

        {(vendor.city || vendor.state) && (
          <p>
            📍 {vendor.city}
            {vendor.city && vendor.state && ', '}
            {vendor.state}
          </p>
        )}

        {vendor.starting_price && (
          <p className="font-medium text-gray-900">
            {formatPrice(vendor.starting_price)}
          </p>
        )}

        {vendor.email && (
          <p className="truncate">✉️ {vendor.email}</p>
        )}

        {vendor.phone && (
          <p>📞 {vendor.phone}</p>
        )}

        {vendor.notes && (
          <p className="text-gray-500 italic line-clamp-2 mt-2">
            {vendor.notes}
          </p>
        )}
      </div>
    </div>
  );
}
