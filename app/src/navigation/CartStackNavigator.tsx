import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '../screens/CartScreen';
import OrderCheckoutScreen from '../screens/OrderCheckoutScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import type { CartStackParamList } from './types';

const Stack = createNativeStackNavigator<CartStackParamList>();

export default function CartStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CartMain" component={CartScreen} options={{ title: '장바구니' }} />
      <Stack.Screen name="OrderCheckout" component={OrderCheckoutScreen} options={{ title: '주문 확인' }} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: '주문 내역' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: '주문 상세' }} />
    </Stack.Navigator>
  );
}
