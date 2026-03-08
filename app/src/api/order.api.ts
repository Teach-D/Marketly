import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { ApiResponse } from '../types/api';
import type { Order } from '../types/order';

const MY_ORDERS_KEY = ['orders', 'my'];

const createOrder = (couponId?: string) =>
  apiClient
    .post<ApiResponse<Order>>('/orders', { couponId })
    .then((r) => r.data.data);

const fetchMyOrders = () =>
  apiClient.get<ApiResponse<Order[]>>('/orders').then((r) => r.data.data);

const fetchOrder = (id: string) =>
  apiClient.get<ApiResponse<Order>>(`/orders/${id}`).then((r) => r.data.data);

const cancelOrder = (id: string) =>
  apiClient.patch<ApiResponse<Order>>(`/orders/${id}/cancel`).then((r) => r.data.data);

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MY_ORDERS_KEY });
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useMyOrders = () =>
  useQuery({ queryKey: MY_ORDERS_KEY, queryFn: fetchMyOrders });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ['orders', id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: MY_ORDERS_KEY });
      qc.setQueryData(['orders', data.id], data);
    },
  });
};
