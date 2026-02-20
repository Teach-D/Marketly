import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';
import type { ApiResponse, Paginated, Review } from '../types';

export const useProductReviews = (productId: string, page = 1) =>
  useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: () =>
      apiClient
        .get<ApiResponse<Paginated<Review>>>('/reviews', { params: { productId, page } })
        .then((r) => r.data.data),
    enabled: !!productId,
  });

interface CreateReviewDto {
  productId: string;
  rating: number;
  content: string;
}

interface UpdateReviewDto {
  rating?: number;
  content?: string;
}

export const useCreateReview = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReviewDto) =>
      apiClient.post<ApiResponse<Review>>('/reviews', dto).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', productId] }),
  });
};

export const useUpdateReview = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateReviewDto }) =>
      apiClient.patch<ApiResponse<Review>>(`/reviews/${id}`, dto).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', productId] }),
  });
};

export const useDeleteReview = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/reviews/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', productId] }),
  });
};
