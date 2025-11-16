import { useQuery } from '@tanstack/react-query';
import { reminderApi } from '../services/api';
import type { Reminder } from '../types/reminder';

export function useDueReminders() {
  return useQuery({
    queryKey: ['reminders', 'due'],
    queryFn: async (): Promise<Reminder[]> => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/reminders/due`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch due reminders');
      }
      return response.json();
    },
    refetchInterval: 60000, // Check every minute
  });
}

