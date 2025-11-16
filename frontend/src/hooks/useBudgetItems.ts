import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetItemApi } from '../services/api';
import type { BudgetItem, CreateBudgetItemRequest, UpdateBudgetItemRequest } from '../types/budget';

export function useBudgetItems() {
  return useQuery({
    queryKey: ['budget-items'],
    queryFn: budgetItemApi.getAll,
  });
}

export function useBudgetItem(id: string) {
  return useQuery({
    queryKey: ['budget-items', id],
    queryFn: () => budgetItemApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetItemApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
    },
  });
}

export function useUpdateBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetItemRequest }) =>
      budgetItemApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['budget-items', updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
    },
  });
}

export function useDeleteBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetItemApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
    },
  });
}

