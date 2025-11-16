import { useState, useRef, useEffect } from 'react';
import type { Vendor, VendorStatus } from '../../types/vendor';
import { useUpdateVendor } from '../../hooks/useVendors';

interface VendorCardProps {
  vendor: Vendor;
  onClick?: () => void;
}

export default function VendorCard({ vendor, onClick }: VendorCardProps) {
  const { mutate: updateVendor, isPending } = useUpdateVendor();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(vendor.notes || '');
  const [localStatus, setLocalStatus] = useState(vendor.status);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Update local state when vendor changes
  useEffect(() => {
    setNotesValue(vendor.notes || '');
    setLocalStatus(vendor.status);
  }, [vendor.notes, vendor.status]);

  // Auto-save notes after 1 second of no typing
  useEffect(() => {
    if (isEditingNotes && notesValue !== (vendor.notes || '')) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        updateVendor(
          {
            id: vendor.id,
            data: { notes: notesValue || undefined },
          },
          {
            onSuccess: () => {
              setIsEditingNotes(false);
            },
          }
        );
      }, 1000);
    }
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [notesValue, vendor.notes, vendor.id, isEditingNotes, updateVendor]);

  const handleStatusChange = (newStatus: VendorStatus) => {
    setLocalStatus(newStatus);
    updateVendor({
      id: vendor.id,
      data: { status: newStatus },
    });
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingNotes(true);
    setTimeout(() => {
      notesTextareaRef.current?.focus();
    }, 0);
  };

  const handleNotesBlur = () => {
    // Save immediately on blur if changed
    if (notesValue !== (vendor.notes || '')) {
      updateVendor({
        id: vendor.id,
        data: { notes: notesValue || undefined },
      });
    }
    setIsEditingNotes(false);
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
        <select
          value={localStatus}
          onChange={(e) => handleStatusChange(e.target.value as VendorStatus)}
          onClick={(e) => e.stopPropagation()}
          disabled={isPending}
          className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(
            localStatus
          )}`}
        >
          <option value="considering">Considering</option>
          <option value="booked">Booked</option>
          <option value="rejected">Rejected</option>
        </select>
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

        <div className="mt-2">
          {isEditingNotes ? (
            <textarea
              ref={notesTextareaRef}
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={handleNotesBlur}
              onClick={(e) => e.stopPropagation()}
              placeholder="Add notes..."
              className="w-full px-2 py-1 text-sm text-gray-600 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          ) : (
            <div
              onClick={handleNotesClick}
              className="text-gray-500 italic min-h-[3rem] cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
            >
              {vendor.notes || (
                <span className="text-gray-400">Click to add notes...</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
