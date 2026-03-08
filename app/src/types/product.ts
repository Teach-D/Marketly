export interface ProductStat {
  id: string;
  productId: string;
  avgRating: number;
  reviewCount: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
  stat: ProductStat | null;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export type ProductSortBy = 'createdAt' | 'salesCount';

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: ProductSortBy;
  minRating?: number;
}

export interface RankingItem {
  rank: number;
  salesCount: number;
  product: Product;
}
