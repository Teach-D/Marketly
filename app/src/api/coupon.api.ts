import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { ApiResponse } from '../types/api';
import type { CouponEvent, UserCoupon } from '../types/coupon';

const MY_COUPONS_KEY = ['coupons', 'my'];

const fetchCouponEvents = () =>
  apiClient.get<ApiResponse<CouponEvent[]>>('/coupons/events').then((r) => r.data.data);

const fetchMyCoupons = () =>
  apiClient.get<ApiResponse<UserCoupon[]>>('/coupons/my').then((r) => r.data.data);

const issueCoupon = (couponId: string) =>
  apiClient.post<ApiResponse<UserCoupon>>(`/coupons/${couponId}/issue`).then((r) => r.data.data);

export const useCouponEvents = () =>
  useQuery({ queryKey: ['coupons', 'events'], queryFn: fetchCouponEvents });

export const useMyCoupons = () =>
  useQuery({ queryKey: MY_COUPONS_KEY, queryFn: fetchMyCoupons });

export const useIssueCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: issueCoupon,
    onSuccess: () => qc.invalidateQueries({ queryKey: MY_COUPONS_KEY }),
  });
};
