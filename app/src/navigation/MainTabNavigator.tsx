import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useCart } from '../api/cart.api';
import { useMyCoupons } from '../api/coupon.api';
import ProductsStackNavigator from './ProductsStackNavigator';
import RankingScreen from '../screens/RankingScreen';
import CartStackNavigator from './CartStackNavigator';
import MyStackNavigator from './MyStackNavigator';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function CartTabIcon({ color }: { color: string }) {
  const { data: items } = useCart();
  const count = items?.length ?? 0;
  return (
    <View>
      <Text style={{ color, fontSize: 20 }}>🛒</Text>
      {count > 0 && (
        <View className="absolute -top-1 -right-2 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
          <Text className="text-white text-xs font-bold">{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
}

function MyTabIcon({ color }: { color: string }) {
  const { data: coupons } = useMyCoupons();
  const count = coupons?.length ?? 0;
  return (
    <View>
      <Text style={{ color, fontSize: 20 }}>👤</Text>
      {count > 0 && (
        <View className="absolute -top-1 -right-2 bg-blue-500 rounded-full w-4 h-4 items-center justify-center">
          <Text className="text-white text-xs font-bold">{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="ProductsTab"
        component={ProductsStackNavigator}
        options={{
          tabBarLabel: '상품',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🛍️</Text>,
        }}
      />
      <Tab.Screen
        name="RankingTab"
        component={RankingScreen}
        options={{
          tabBarLabel: '랭킹',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏆</Text>,
          headerShown: true,
          title: '판매 랭킹',
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStackNavigator}
        options={{
          tabBarLabel: '장바구니',
          tabBarIcon: ({ color }) => <CartTabIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="MyTab"
        component={MyStackNavigator}
        options={{
          tabBarLabel: '마이',
          tabBarIcon: ({ color }) => <MyTabIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
