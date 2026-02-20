import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';
import type { ApiResponse, Order } from '../types';

export const useMyOrders = () =>
  useQuery({
    queryKey: ['orders', 'my'],
    queryFn: () =>
      apiClient
        .get<ApiResponse<Order[]>>('/orders')
        .then((r) => r.data.data),
  });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ['orders', id],
    queryFn: () =>
      apiClient
        .get<ApiResponse<Order>>(`/orders/${id}`)
        .then((r) => r.data.data),
    enabled: !!id,
  });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post<ApiResponse<Order>>('/orders').then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
