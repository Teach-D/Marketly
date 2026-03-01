import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './axios';
import type { ApiResponse, Coupon, UserCoupon } from '../types';
import { useToastStore } from '../store/toast.store';

interface CreateCouponDto {
  name: string;
  discountRate: number;
  minOrderAmount: number;
  maxIssueCount: number;
  validFrom: string;
  validUntil: string;
}

export const useAdminCoupons = () =>
  useQuery({
    queryKey: ['coupons', 'admin'],
    queryFn: () =>
      apiClient.get<ApiResponse<Coupon[]>>('/coupons').then((r) => r.data.data),
  });

export const useCreateCoupon = () => {
  const qc = useQueryClient();
  const toast = useToastStore();
  return useMutation({
    mutationFn: (dto: CreateCouponDto) =>
      apiClient.post<ApiResponse<Coupon>>('/coupons', dto).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      toast.push('쿠폰이 생성되었습니다.', 'success');
    },
    onError: () => toast.push('쿠폰 생성에 실패했습니다.', 'error'),
  });
};

export const useMyCoupons = () =>
  useQuery({
    queryKey: ['coupons', 'my'],
    queryFn: () =>
      apiClient.get<ApiResponse<UserCoupon[]>>('/coupons/my').then((r) => r.data.data),
  });

export const useIssueCoupon = () => {
  const qc = useQueryClient();
  const toast = useToastStore();
  return useMutation({
    mutationFn: (couponId: string) =>
      apiClient.post<ApiResponse<UserCoupon>>(`/coupons/${couponId}/issue`).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons', 'my'] });
      toast.push('쿠폰이 발급되었습니다.', 'success');
    },
    onError: (error: import('axios').AxiosError<ApiResponse<null>>) => {
      const code = error.response?.data?.error?.code;
      if (code === 'COUPON_ALREADY_ISSUED') toast.push('이미 발급받은 쿠폰입니다.', 'error');
      else if (code === 'COUPON_SOLD_OUT') toast.push('쿠폰이 모두 소진되었습니다.', 'error');
      else toast.push('쿠폰 발급에 실패했습니다.', 'error');
    },
  });
};
