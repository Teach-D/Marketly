import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { ApiResponse } from '../types/api';
import type { CartItem } from '../types/cart';

const CART_KEY = ['cart'];

const fetchCart = () =>
  apiClient.get<ApiResponse<CartItem[]>>('/carts').then((r) => r.data.data);

const addItem = (dto: { productId: string; quantity: number }) =>
  apiClient.post<ApiResponse<null>>('/carts', dto).then((r) => r.data);

const updateQuantity = (productId: string, quantity: number) =>
  apiClient.patch<ApiResponse<null>>(`/carts/${productId}`, { quantity }).then((r) => r.data);

const removeItem = (productId: string) =>
  apiClient.delete<ApiResponse<null>>(`/carts/${productId}`).then((r) => r.data);

const clearCart = () =>
  apiClient.delete<ApiResponse<null>>('/carts').then((r) => r.data);

export const useCart = () =>
  useQuery({ queryKey: CART_KEY, queryFn: fetchCart });

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
};

export const useUpdateCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      updateQuantity(productId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
};

export const useRemoveCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
};

export const useClearCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
};
