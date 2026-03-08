export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type ProductsStackParamList = {
  ProductList: undefined;
  ProductDetail: { id: string };
};

export type MyStackParamList = {
  CouponEvents: undefined;
  MyCoupons: undefined;
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
