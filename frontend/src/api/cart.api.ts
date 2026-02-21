import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';
import { useAuthStore } from '../store/auth.store';
import type { ApiResponse, CartItem } from '../types';

interface AddCartItemDto {
  productId: string;
  quantity: number;
}

export const useCart = () => {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['cart'],
    enabled: !!accessToken,
    queryFn: () =>
      apiClient.get<ApiResponse<CartItem[]>>('/carts').then((r) => r.data.data),
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddCartItemDto) => apiClient.post('/carts', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiClient.patch(`/carts/${itemId}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => apiClient.delete(`/carts/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete('/carts'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};
