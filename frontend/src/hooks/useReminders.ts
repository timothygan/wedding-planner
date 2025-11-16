import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderApi } from '../services/api';
import type { Reminder, CreateReminderRequest, UpdateReminderRequest } from '../types/reminder';

export function useReminders() {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: reminderApi.getAll,
  });
}

export function useReminder(id: string) {
  return useQuery({
    queryKey: ['reminders', id],
    queryFn: () => reminderApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reminderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderRequest }) =>
      reminderApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['reminders', updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reminderApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

