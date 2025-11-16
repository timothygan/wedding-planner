export interface Reminder {
  id: string;
  task_id?: string;
  vendor_id?: string;
  title: string;
  message?: string;
  reminder_type: ReminderType;
  remind_at: string;
  recurrence: Recurrence;
  notification_channels: string; // JSON string: ["browser", "email"]
  status: ReminderStatus;
  created_at: string;
  updated_at: string;
}

export type ReminderType = 'follow_up' | 'payment_due' | 'meeting' | 'deadline' | 'custom';
export type ReminderStatus = 'pending' | 'sent' | 'dismissed' | 'snoozed';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CreateReminderRequest {
  task_id?: string;
  vendor_id?: string;
  title: string;
  message?: string;
  reminder_type: ReminderType;
  remind_at: string;
  recurrence?: Recurrence;
  notification_channels: string[]; // Array that will be JSON stringified
  status?: ReminderStatus;
}

export interface UpdateReminderRequest {
  task_id?: string;
  vendor_id?: string;
  title?: string;
  message?: string;
  reminder_type?: ReminderType;
  remind_at?: string;
  recurrence?: Recurrence;
  notification_channels?: string[]; // Array that will be JSON stringified
  status?: ReminderStatus;
}

