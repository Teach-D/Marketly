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
