export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type ProductsStackParamList = {
  ProductList: undefined;
  ProductDetail: { id: string };
  ProductReviews: { productId: string };
  WriteReview: {
    productId: string;
    reviewId?: string;
    initialRating?: number;
    initialContent?: string;
  };
};

export type CartStackParamList = {
  CartMain: undefined;
  OrderCheckout: undefined;
  MyOrders: undefined;
  OrderDetail: { id: string };
};

export type MyStackParamList = {
  CouponEvents: undefined;
  MyCoupons: undefined;
  MyOrders: undefined;
  OrderDetail: { id: string };
};

export type MainTabParamList = {
  ProductsTab: undefined;
  RankingTab: undefined;
  CartTab: undefined;
  MyTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
