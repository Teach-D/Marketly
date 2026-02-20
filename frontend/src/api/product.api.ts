import { useQuery } from '@tanstack/react-query';
import apiClient from './axios';
import type { ApiResponse, Paginated, Product } from '../types';

interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const useProducts = (query: ProductQuery = {}) =>
  useQuery({
    queryKey: ['products', query],
    queryFn: () =>
      apiClient
        .get<ApiResponse<Paginated<Product>>>('/products', { params: query })
        .then((r) => r.data.data),
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ['products', id],
    queryFn: () =>
      apiClient.get<ApiResponse<Product>>(`/products/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
