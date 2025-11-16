import { useState, useRef, useEffect } from 'react';
import CustomDropdown from '../CustomDropdown';
import ConfirmDialog from '../ConfirmDialog';
import type { Vendor, VendorStatus } from '../../types/vendor';
import type { Task } from '../../types/task';
import type { Reminder } from '../../types/reminder';
import { useUpdateVendor } from '../../hooks/useVendors';

interface VendorCardProps {
  vendor: Vendor;
  isSelected?: boolean;
  isExpanded?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onEdit?: (vendor: Vendor) => void;
  onDelete?: (vendor: Vendor) => void;
  onExpand?: () => void;
  associatedTasks?: Task[];
  associatedReminders?: Reminder[];
}

export default function VendorCard({ 
  vendor, 
  isSelected = false, 
  isExpanded = false,
  onSelectChange, 
  onEdit,
  onDelete,
  onExpand,
  associatedTasks = [],
  associatedReminders = []
}: VendorCardProps) {
  const { mutate: updateVendor, isPending } = useUpdateVendor();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(vendor.notes || '');
  const [localStatus, setLocalStatus] = useState(vendor.status);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReminderStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      case 'snoozed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't expand if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('textarea') || target.closest('input')) {
      return;
    }
    if (onExpand) {
      onExpand();
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-forest-moss';
      case 'considering':
        return 'bg-old-gold';
      case 'rejected':
        return 'bg-cinnabar';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer bg-ivory border border-old-gold ${
        isSelected ? 'ring-4 ring-forest-moss transition-all duration-300' : 'ring-0'
      }`}
    >
      {/* Large colored header section */}
      <div className={`${getStatusBgColor(localStatus)} text-ivory p-6 relative transition-all duration-500 ease-in-out`}>
        {/* Selection indicator - hidden on hover when action buttons are shown */}
        <div className={`absolute top-4 right-4 w-7 h-7 bg-white rounded-full flex items-center justify-center z-10 shadow-lg transition-all duration-300 ease-in-out ${
          isSelected && !(onEdit || onSelectChange) 
            ? 'opacity-100 scale-100' 
            : isSelected 
            ? 'opacity-100 group-hover:opacity-0 group-hover:scale-0 scale-100' 
            : 'opacity-0 scale-0'
        }`}>
          <svg className="w-5 h-5 text-forest-moss transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Action buttons - appear on hover, same position as selection indicator */}
        <div className={`absolute top-4 right-4 flex gap-2 z-10 transition-all duration-300 ease-in-out ${
          onEdit || onSelectChange || onDelete
            ? 'opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100' 
            : 'opacity-0 scale-0'
        }`}>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(vendor);
              }}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"
              title="Edit vendor"
            >
              <svg className="w-5 h-5 text-ivory transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-cinnabar/30 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"
              title="Delete vendor"
            >
              <svg className="w-5 h-5 text-ivory transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          {onSelectChange && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectChange(!isSelected);
              }}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"
              title={isSelected ? 'Deselect' : 'Select'}
            >
              {isSelected ? (
                <svg className="w-5 h-5 text-ivory transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-ivory transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Header content */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-3">
            {getCategoryEmoji(vendor.category)}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-2xl mb-1 transition-all duration-300 text-ivory">{vendor.name}</h3>
            <p className="text-ivory opacity-90 capitalize text-sm transition-opacity duration-300">{vendor.category}</p>
          </div>
        </div>

        {/* Status selector */}
        <CustomDropdown
          options={[
            { value: 'considering', label: 'Considering' },
            { value: 'booked', label: 'Booked' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          value={localStatus}
          onChange={(value) => handleStatusChange(value as VendorStatus)}
          disabled={isPending}
          variant="transparent"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Card content section */}
      <div className="p-6 space-y-4 bg-ivory">
        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-3">
          {vendor.email && (
            <div className="flex items-center gap-2 text-sm text-graphite transition-all duration-300 ease-in-out hover:text-forest-moss hover:translate-x-1">
              <span className="text-lg transition-transform duration-300 hover:scale-110">✉️</span>
              <span className="truncate">{vendor.email}</span>
            </div>
          )}
          {vendor.phone && (
            <div className="flex items-center gap-2 text-sm text-graphite transition-all duration-300 ease-in-out hover:text-forest-moss hover:translate-x-1">
              <span className="text-lg transition-transform duration-300 hover:scale-110">📞</span>
              <span>{vendor.phone}</span>
            </div>
          )}
        </div>

        {(vendor.city || vendor.state) && (
          <div className="flex items-center gap-2 text-sm text-graphite transition-all duration-300 ease-in-out hover:text-forest-moss hover:translate-x-1">
            <span className="text-lg transition-transform duration-300 hover:scale-110">📍</span>
            <span>{vendor.city}{vendor.city && vendor.state && ', '}{vendor.state}</span>
          </div>
        )}

        {vendor.starting_price && (
          <div className="bg-old-gold bg-opacity-10 rounded-xl p-4 border border-old-gold transition-all duration-300 ease-in-out hover:shadow-md hover:scale-[1.02]">
            <div className="text-xs text-graphite mb-1 transition-opacity duration-300">Starting Price</div>
            <div className="text-2xl font-bold text-graphite transition-transform duration-300">{formatPrice(vendor.starting_price)}</div>
          </div>
        )}

        {/* Notes section */}
        <div className="bg-old-gold bg-opacity-10 rounded-xl p-4 border border-old-gold transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:border-forest-moss">
          <div className="text-xs font-semibold text-graphite mb-2 uppercase tracking-wide transition-opacity duration-300">Notes</div>
          {isEditingNotes ? (
            <textarea
              ref={notesTextareaRef}
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={handleNotesBlur}
              onClick={(e) => e.stopPropagation()}
              placeholder="Add notes..."
              className="w-full px-3 py-2 text-sm text-graphite border border-old-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-moss resize-none bg-ivory transition-all duration-300 ease-in-out placeholder-forest-moss"
              rows={3}
            />
          ) : (
            <div
              onClick={handleNotesClick}
              className="text-sm text-graphite min-h-[3rem] cursor-text hover:text-forest-moss transition-all duration-300 ease-in-out"
            >
              {vendor.notes || (
                <span className="text-graphite opacity-60 italic transition-opacity duration-300">Click to add notes...</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded content - Associated Tasks and Reminders */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-6 space-y-6">
          {/* Associated Tasks */}
          {associatedTasks.length > 0 && (
            <div className="opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-forest-moss bg-opacity-20 rounded-xl flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 hover:rotate-3 border border-forest-moss">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-graphite transition-all duration-300">Tasks</h4>
                  <p className="text-sm text-forest-moss transition-opacity duration-300">{associatedTasks.length} task{associatedTasks.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {associatedTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="bg-ivory rounded-xl p-4 border border-old-gold hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-sm text-graphite flex-1 transition-colors duration-300">{task.title}</h5>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getTaskStatusColor(task.status)} ml-2 transition-all duration-300`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-forest-moss mb-3 line-clamp-2 transition-opacity duration-300">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-forest-moss bg-old-gold bg-opacity-10 px-2 py-1 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:scale-105 border border-old-gold">
                          <span>⏰</span>
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {task.timeline_phase && (
                        <div className="flex items-center gap-1 text-xs text-forest-moss bg-old-gold bg-opacity-10 px-2 py-1 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:scale-105 border border-old-gold">
                          <span>📅</span>
                          <span>{task.timeline_phase}</span>
                        </div>
                      )}
                      {task.priority && (
                        <div className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300 ease-in-out hover:scale-105 ${
                          task.priority === 'urgent' ? 'bg-cinnabar bg-opacity-20 text-cinnabar hover:bg-opacity-30 border border-cinnabar' :
                          task.priority === 'high' ? 'bg-old-gold bg-opacity-30 text-graphite hover:bg-opacity-40 border border-old-gold' :
                          task.priority === 'medium' ? 'bg-old-gold bg-opacity-10 text-forest-moss hover:bg-opacity-20 border border-old-gold' :
                          'bg-old-gold bg-opacity-10 text-forest-moss hover:bg-opacity-20 border border-old-gold'
                        }`}>
                          {task.priority}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Associated Reminders */}
          {associatedReminders.length > 0 && (
            <div className="opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.15s_forwards]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-old-gold bg-opacity-20 rounded-xl flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 hover:rotate-3 border border-old-gold">
                  <span className="text-xl">🔔</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-graphite transition-all duration-300">Reminders</h4>
                  <p className="text-sm text-forest-moss transition-opacity duration-300">{associatedReminders.length} reminder{associatedReminders.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {associatedReminders.map((reminder, index) => (
                  <div
                    key={reminder.id}
                    className="bg-ivory rounded-xl p-4 border border-old-gold hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-sm text-graphite flex-1 transition-colors duration-300">{reminder.title}</h5>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getReminderStatusColor(reminder.status)} ml-2 transition-all duration-300`}>
                        {reminder.status}
                      </span>
                    </div>
                    {reminder.message && (
                      <p className="text-xs text-forest-moss mb-3 line-clamp-2 transition-opacity duration-300">{reminder.message}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-xs text-forest-moss bg-old-gold bg-opacity-10 px-2 py-1 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:scale-105 border border-old-gold">
                        <span>⏰</span>
                        <span>{new Date(reminder.remind_at).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-forest-moss bg-old-gold bg-opacity-10 px-2 py-1 rounded-lg capitalize transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:scale-105 border border-old-gold">
                        {reminder.reminder_type.replace('_', ' ')}
                      </div>
                      {reminder.recurrence !== 'none' && (
                        <div className="flex items-center gap-1 text-xs text-forest-moss bg-old-gold bg-opacity-10 px-2 py-1 rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-20 hover:scale-105 border border-old-gold">
                          <span>🔄</span>
                          <span>{reminder.recurrence}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {associatedTasks.length === 0 && associatedReminders.length === 0 && (
            <div className="text-center py-12 opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]">
              <div className="w-16 h-16 bg-old-gold bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 ease-in-out hover:scale-110 hover:rotate-6 border border-old-gold">
                <span className="text-3xl">📭</span>
              </div>
              <p className="text-graphite font-medium transition-opacity duration-300">No associated tasks or reminders</p>
              <p className="text-sm text-forest-moss mt-1 transition-opacity duration-300">Create tasks or reminders to see them here</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Vendor"
        message={`Are you sure you want to delete "${vendor.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (onDelete) {
            onDelete(vendor);
          }
          setShowDeleteDialog(false);
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
