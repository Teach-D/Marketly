import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { ApiResponse } from '../types/api';
import type { Product, ProductListResult, ProductQuery, RankingItem } from '../types/product';

const fetchProducts = (query: ProductQuery) =>
  apiClient
    .get<ApiResponse<ProductListResult>>('/products', { params: query })
    .then((r) => r.data.data);

const fetchProduct = (id: string) =>
  apiClient.get<ApiResponse<Product>>(`/products/${id}`).then((r) => r.data.data);

const fetchRanking = (limit = 10) =>
  apiClient
    .get<ApiResponse<RankingItem[]>>('/products/ranking', { params: { limit } })
    .then((r) => r.data.data);

export const useProducts = (query: ProductQuery) =>
  useQuery({
    queryKey: ['products', query],
    queryFn: () => fetchProducts(query),
  });

export const useInfiniteProducts = (query: Omit<ProductQuery, 'page'>) =>
  useInfiniteQuery({
    queryKey: ['products', 'infinite', query],
    queryFn: ({ pageParam = 1 }) => fetchProducts({ ...query, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const totalPages = Math.ceil(last.total / last.limit);
      return last.page < totalPages ? last.page + 1 : undefined;
    },
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });

export const useRanking = (limit = 10) =>
  useQuery({
    queryKey: ['products', 'ranking', limit],
    queryFn: () => fetchRanking(limit),
  });
