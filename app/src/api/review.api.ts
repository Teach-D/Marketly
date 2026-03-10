import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { ApiResponse } from '../types/api';
import type { Review, ReviewListResult } from '../types/review';

const reviewsKey = (productId: string) => ['reviews', productId];

const fetchReviews = (productId: string, page = 1) =>
  apiClient
    .get<ApiResponse<ReviewListResult>>('/reviews', { params: { productId, page, limit: 20 } })
    .then((r) => r.data.data);

const createReview = (dto: { productId: string; rating: number; content: string }) =>
  apiClient.post<ApiResponse<Review>>('/reviews', dto).then((r) => r.data.data);

const updateReview = (id: string, dto: { rating?: number; content?: string }) =>
  apiClient.patch<ApiResponse<Review>>(`/reviews/${id}`, dto).then((r) => r.data.data);

const deleteReview = (id: string) =>
  apiClient.delete<ApiResponse<null>>(`/reviews/${id}`).then((r) => r.data);

export const useReviews = (productId: string, page = 1) =>
  useQuery({
    queryKey: [...reviewsKey(productId), page],
    queryFn: () => fetchReviews(productId, page),
    enabled: !!productId,
  });

export const useCreateReview = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewsKey(productId) });
      qc.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
};

export const useUpdateReview = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; rating?: number; content?: string }) =>
      updateReview(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewsKey(productId) }),
  });
};

export const useDeleteReview = (productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewsKey(productId) });
      qc.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
};
