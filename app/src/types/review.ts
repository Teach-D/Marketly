export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: { email: string };
}

export interface ReviewListResult {
  items: Review[];
  total: number;
  page: number;
  limit: number;
}
