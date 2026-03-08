import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CouponEventsScreen from '../screens/CouponEventsScreen';
import MyCouponsScreen from '../screens/MyCouponsScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import type { MyStackParamList } from './types';

const Stack = createNativeStackNavigator<MyStackParamList>();

export default function MyStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CouponEvents" component={CouponEventsScreen} options={{ title: '쿠폰 이벤트' }} />
      <Stack.Screen name="MyCoupons" component={MyCouponsScreen} options={{ title: '내 쿠폰' }} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: '주문 내역' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: '주문 상세' }} />
    </Stack.Navigator>
  );
}
