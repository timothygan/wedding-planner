import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../services/api';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: taskApi.getAll,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      taskApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['tasks', updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

