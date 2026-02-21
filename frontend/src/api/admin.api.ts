import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';
import type { ApiResponse, Order, Paginated, Product, User } from '../types';

interface ProductFormDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ProductFormDto) =>
      apiClient.post<ApiResponse<Product>>('/products', dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<ProductFormDto> }) =>
      apiClient.patch<ApiResponse<Product>>(`/products/${id}`, dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useAdjustStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, delta }: { id: string; delta: number }) =>
      apiClient.patch<ApiResponse<Product>>(`/products/${id}/stock`, { delta }).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useAdminOrders = () =>
  useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: () =>
      apiClient.get<ApiResponse<Order[]>>('/orders/admin').then((r) => r.data.data),
  });

export const useShipOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch<ApiResponse<Order>>(`/orders/${id}/ship`).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
};

export const useDeliverOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch<ApiResponse<Order>>(`/orders/${id}/deliver`).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
};

export const useAdminUsers = (page = 1) =>
  useQuery({
    queryKey: ['users', 'admin', page],
    queryFn: () =>
      apiClient
        .get<ApiResponse<Paginated<User>>>('/users', { params: { page, limit: 20 } })
        .then((r) => r.data.data),
  });
