export const REDIS_KEYS = {
  SALES_RANKING: 'ranking:products:sales',
  couponMax: (couponId: string) => `coupon:max:${couponId}`,
  couponIssued: (couponId: string) => `coupon:issued:${couponId}`,
};
