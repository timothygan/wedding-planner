import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { vendorApi } from '../services/api';
import type { Vendor, CreateVendorRequest, UpdateVendorRequest } from '../types/vendor';

export function useVendors(category?: string, status?: string, search?: string) {
  return useQuery({
    queryKey: ['vendors', category, status, search],
    queryFn: () => vendorApi.getAll(category, status, search),
    placeholderData: keepPreviousData,
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: () => vendorApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorRequest }) =>
      vendorApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['vendors', updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

