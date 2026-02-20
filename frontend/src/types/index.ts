export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface OrderItem {
  id: string;
  productId: string;
  product: { name: string; price: number };
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
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
