import { useQuery } from '@tanstack/react-query';
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
