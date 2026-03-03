import { useQuery } from '@tanstack/react-query';
import apiClient from './axios';
import type { ApiResponse } from '../types';

export interface StatsSummary {
  today: { revenue: number; orders: number; newUsers: number };
  thisMonth: { revenue: number; orders: number; newUsers: number };
}

export interface DailyStat {
  date: string;
  revenue: number;
  orders: number;
}

export interface MonthlyStat {
  month: string;
  revenue: number;
  orders: number;
}

export const useStatsSummary = () =>
  useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: () =>
      apiClient.get<ApiResponse<StatsSummary>>('/admin/stats/summary').then((r) => r.data.data),
    refetchInterval: 60_000,
  });

export const useDailyStats = (days = 30) =>
  useQuery({
    queryKey: ['stats', 'daily', days],
    queryFn: () =>
      apiClient
        .get<ApiResponse<DailyStat[]>>('/admin/stats/daily', { params: { days } })
        .then((r) => r.data.data),
  });

export const useMonthlyStats = (months = 12) =>
  useQuery({
    queryKey: ['stats', 'monthly', months],
    queryFn: () =>
      apiClient
        .get<ApiResponse<MonthlyStat[]>>('/admin/stats/monthly', { params: { months } })
        .then((r) => r.data.data),
  });
