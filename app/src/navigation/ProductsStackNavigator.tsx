import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import type { ProductsStackParamList } from './types';

const Stack = createNativeStackNavigator<ProductsStackParamList>();

export default function ProductsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductList" component={ProductsScreen} options={{ title: '상품' }} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: '상품 상세' }}
      />
    </Stack.Navigator>
  );
}
