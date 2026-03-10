import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductReviewsScreen from '../screens/ProductReviewsScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import type { ProductsStackParamList } from './types';

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export default function ProductsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductList" component={ProductsScreen} options={{ title: '상품' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '상품 상세' }} />
      <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} options={{ title: '리뷰' }} />
      <Stack.Screen
        name="WriteReview"
        component={WriteReviewScreen}
        options={({ route }) => ({ title: route.params.reviewId ? '리뷰 수정' : '리뷰 작성' })}
      />
    </Stack.Navigator>
  );
}
