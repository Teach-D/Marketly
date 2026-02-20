import { useQuery } from '@tanstack/react-query';
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
