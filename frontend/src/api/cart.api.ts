import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';

interface AddCartItemDto {
  productId: string;
  quantity: number;
}

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddCartItemDto) => apiClient.post('/carts', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};
