import { useState, useEffect } from 'react';
import { useReminders, useCreateReminder, useDeleteReminder } from '../hooks/useReminders';
import { useTasks } from '../hooks/useTasks';
import { useVendors } from '../hooks/useVendors';
import { useDueReminders } from '../hooks/useDueReminders';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { reminderApi } from '../services/api';
import type { Reminder, ReminderType, ReminderStatus, Recurrence } from '../types/reminder';

export default function RemindersPage() {
  const { data: reminders, isLoading, error } = useReminders();
  const { data: dueReminders } = useDueReminders();
  const { data: tasks } = useTasks();
  const { data: vendors } = useVendors();
  const { mutate: createReminder } = useCreateReminder();
  const { mutate: deleteReminder } = useDeleteReminder();
  const { isSupported: pushSupported, permission, requestPermission, showNotification } = usePushNotifications();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    reminder_type: 'follow_up' as ReminderType,
    remind_at: '',
    recurrence: 'none' as Recurrence,
    notification_channels: ['browser'] as string[],
    task_id: '',
    vendor_id: '',
  });

  // Check for due reminders and show push notifications
  useEffect(() => {
    if (dueReminders && dueReminders.length > 0 && permission === 'granted') {
      dueReminders.forEach((reminder) => {
        if (reminder.status === 'pending') {
          showNotification(reminder.title, {
            body: reminder.message || 'Reminder due now',
            tag: reminder.id, // Prevent duplicate notifications
          });
          
          // Auto-process the reminder (mark as sent)
          reminderApi.process(reminder.id, userEmail || undefined).catch(console.error);
        }
      });
    }
  }, [dueReminders, permission, showNotification, userEmail]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading reminders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          Error loading reminders: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    if (!formData.task_id && !formData.vendor_id) {
      setValidationError('Please select either a task or vendor');
      return;
    }

    // Convert datetime-local string to ISO format
    // datetime-local gives us "YYYY-MM-DDTHH:mm" (no timezone)
    // We need to convert it to ISO format "YYYY-MM-DDTHH:mm:ssZ"
    let remindAtISO: string;
    if (formData.remind_at) {
      // datetime-local format: "2025-01-27T14:30"
      // Convert to Date object (treats as local time) then to ISO string
      const date = new Date(formData.remind_at);
      remindAtISO = date.toISOString();
    } else {
      setValidationError('Remind at date/time is required');
      return;
    }

    createReminder(
      {
        title: formData.title,
        message: formData.message?.trim() || undefined,
        reminder_type: formData.reminder_type,
        remind_at: remindAtISO,
        recurrence: formData.recurrence || undefined,
        notification_channels: formData.notification_channels,
        task_id: formData.task_id || undefined,
        vendor_id: formData.vendor_id || undefined,
      },
      {
        onSuccess: () => {
          setShowCreateForm(false);
          setValidationError('');
          setFormData({
            title: '',
            message: '',
            reminder_type: 'follow_up',
            remind_at: '',
            recurrence: 'none',
            notification_channels: ['browser'],
            task_id: '',
            vendor_id: '',
          });
        },
      }
    );
  };

  const getStatusColor = (status: ReminderStatus) => {
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

  const getTypeColor = (type: ReminderType) => {
    switch (type) {
      case 'payment_due':
        return 'bg-red-100 text-red-800';
      case 'deadline':
        return 'bg-orange-100 text-orange-800';
      case 'meeting':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const upcomingReminders = reminders?.filter(
    (r) => r.status === 'pending' && new Date(r.remind_at) > new Date()
  );
  const pastReminders = reminders?.filter(
    (r) => r.status === 'pending' && new Date(r.remind_at) <= new Date()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reminders</h1>
          <p className="text-gray-600">Manage your wedding planning reminders</p>
        </div>
        <div className="flex gap-2">
          {pushSupported && permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Enable Notifications
            </button>
          )}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Cancel' : '+ New Reminder'}
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      {pushSupported && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Push Notifications</h3>
              <p className="text-sm text-blue-700">
                {permission === 'granted'
                  ? '✓ Browser notifications enabled'
                  : permission === 'denied'
                  ? '✗ Notifications blocked. Please enable in browser settings.'
                  : 'Click "Enable Notifications" to receive reminder alerts'}
              </p>
            </div>
            {permission !== 'granted' && (
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enable
              </button>
            )}
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Email for email notifications (optional)
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full max-w-md px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="mb-8 bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Reminder</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Type *
                </label>
                <select
                  required
                  value={formData.reminder_type}
                  onChange={(e) =>
                    setFormData({ ...formData, reminder_type: e.target.value as ReminderType })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="follow_up">Follow Up</option>
                  <option value="payment_due">Payment Due</option>
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remind At *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.remind_at}
                  onChange={(e) => setFormData({ ...formData, remind_at: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recurrence
                </label>
                <select
                  value={formData.recurrence}
                  onChange={(e) =>
                    setFormData({ ...formData, recurrence: e.target.value as Recurrence })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None (one-time reminder)</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                {formData.recurrence !== 'none' && (
                  <p className="text-xs text-gray-500 mt-1">
                    This reminder will automatically repeat {formData.recurrence} after each occurrence.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Channels *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notification_channels.includes('browser')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            notification_channels: [...formData.notification_channels, 'browser'],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            notification_channels: formData.notification_channels.filter(
                              (ch) => ch !== 'browser'
                            ),
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    Browser
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notification_channels.includes('email')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            notification_channels: [...formData.notification_channels, 'email'],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            notification_channels: formData.notification_channels.filter(
                              (ch) => ch !== 'email'
                            ),
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    Email
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Associate with *
              </label>
              <select
                value={
                  formData.task_id
                    ? `task:${formData.task_id}`
                    : formData.vendor_id
                    ? `vendor:${formData.vendor_id}`
                    : ''
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setFormData({ ...formData, task_id: '', vendor_id: '' });
                  } else if (value.startsWith('task:')) {
                    setFormData({ ...formData, task_id: value.replace('task:', ''), vendor_id: '' });
                  } else if (value.startsWith('vendor:')) {
                    setFormData({ ...formData, vendor_id: value.replace('vendor:', ''), task_id: '' });
                  }
                  setValidationError('');
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a task or vendor...</option>
                {tasks && tasks.length > 0 && (
                  <optgroup label="📋 Tasks">
                    {tasks.map((task) => (
                      <option key={task.id} value={`task:${task.id}`}>
                        {task.title} {task.timeline_phase ? `(${task.timeline_phase})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {vendors && vendors.length > 0 && (
                  <optgroup label="🏢 Vendors">
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={`vendor:${vendor.id}`}>
                        {vendor.name} ({vendor.category})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {validationError && (
                <div className="text-red-600 text-sm mt-2">{validationError}</div>
              )}
              <div className="text-sm text-gray-500 mt-2">
                Select a task or vendor to associate this reminder with.
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Reminder
            </button>
          </form>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders && upcomingReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
          <div className="space-y-4">
            {upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{reminder.title}</h3>
                    {reminder.message && (
                      <p className="text-gray-600 text-sm mt-1">{reminder.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        reminder.reminder_type
                      )}`}
                    >
                      {reminder.reminder_type.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        reminder.status
                      )}`}
                    >
                      {reminder.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
                  <span>⏰ {new Date(reminder.remind_at).toLocaleString()}</span>
                  {reminder.recurrence !== 'none' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                      🔄 Recurring: {reminder.recurrence}
                    </span>
                  )}
                  {reminder.task_id && (
                    <span>
                      📋 Task:{' '}
                      {tasks?.find((t) => t.id === reminder.task_id)?.title ||
                        reminder.task_id.slice(0, 8) + '...'}
                    </span>
                  )}
                  {reminder.vendor_id && (
                    <span>
                      🏢 Vendor:{' '}
                      {vendors?.find((v) => v.id === reminder.vendor_id)?.name ||
                        reminder.vendor_id.slice(0, 8) + '...'}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past/Due Reminders */}
      {pastReminders && pastReminders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Due / Past</h2>
          <div className="space-y-4">
            {pastReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow opacity-75"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{reminder.title}</h3>
                    {reminder.message && (
                      <p className="text-gray-600 text-sm mt-1">{reminder.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        reminder.reminder_type
                      )}`}
                    >
                      {reminder.reminder_type.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        reminder.status
                      )}`}
                    >
                      {reminder.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
                  <span>⏰ {new Date(reminder.remind_at).toLocaleString()}</span>
                  {reminder.recurrence !== 'none' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                      🔄 Recurring: {reminder.recurrence}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reminders && reminders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No reminders yet</p>
          <p className="text-gray-400">Create your first reminder to get started!</p>
        </div>
      )}
    </div>
  );
}

