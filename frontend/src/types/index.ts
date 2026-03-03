export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  product: { name: string; price: number } | null;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  status: 'PAID' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  totalPrice: number;
  items: OrderItem[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user: { email: string };
  rating: number;
  content: string;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

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
}

export interface CouponEvent extends Coupon {
  status: 'upcoming' | 'open' | 'sold_out';
}

export interface UserCoupon {
  id: string;
  userId: string;
  couponId: string;
  coupon: Coupon;
  usedAt: string | null;
  createdAt: string;
}
