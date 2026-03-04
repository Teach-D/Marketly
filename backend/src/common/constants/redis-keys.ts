export const STATS_DAILY_TTL = 60 * 60 * 24 * 90;
export const STATS_MONTHLY_TTL = 60 * 60 * 24 * 730;

export const REDIS_KEYS = {
  SALES_RANKING: 'ranking:products:sales',
  couponMax: (couponId: string) => `coupon:max:${couponId}`,
  couponIssued: (couponId: string) => `coupon:issued:${couponId}`,
  couponOpenAt: (couponId: string) => `coupon:open_at:${couponId}`,
  cart: (userId: string) => `cart:${userId}`,
  statsRevenueDaily: (date: string) => `stats:revenue:daily:${date}`,
  statsRevenueMonthly: (month: string) => `stats:revenue:monthly:${month}`,
  statsOrdersDaily: (date: string) => `stats:orders:daily:${date}`,
  statsOrdersMonthly: (month: string) => `stats:orders:monthly:${month}`,
  statsUsersDaily: (date: string) => `stats:users:daily:${date}`,
  statsUsersMonthly: (month: string) => `stats:users:monthly:${month}`,
};
