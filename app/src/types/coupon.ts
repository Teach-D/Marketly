export interface Coupon {
  id: string;
  name: string;
  discountRate: number;
  minOrderAmount: number;
  maxIssueCount: number;
  issuedCount: number;
  openAt: string;
  validFrom: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponEvent extends Coupon {
  status: 'upcoming' | 'open' | 'sold_out';
}

export interface UserCoupon {
  id: string;
  userId: string;
  couponId: string;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
  coupon: Coupon;
}
