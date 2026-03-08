import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMyOrders } from '../api/order.api';
import type { Order } from '../types/order';
import type { MyStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MyStackParamList, 'MyOrders'>;

const STATUS_MAP = {
  PAID: { label: '결제 완료', color: 'text-blue-600', bg: 'bg-blue-50' },
  SHIPPING: { label: '배송 중', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  DELIVERED: { label: '배송 완료', color: 'text-green-600', bg: 'bg-green-50' },
  CANCELLED: { label: '취소됨', color: 'text-gray-400', bg: 'bg-gray-50' },
};

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const status = STATUS_MAP[order.status];
  const date = new Date(order.createdAt).toLocaleDateString('ko-KR');
  const firstItem = order.items[0];

  return (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-xl p-4 mb-3"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-xs text-gray-400">{date}</Text>
        <View className={`px-2 py-1 rounded-full ${status.bg}`}>
          <Text className={`text-xs font-medium ${status.color}`}>{status.label}</Text>
        </View>
      </View>
      <Text className="text-gray-900 font-medium" numberOfLines={1}>
        {firstItem?.product.name}
        {order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ''}
      </Text>
      <Text className="text-blue-600 font-bold mt-1">{order.totalPrice.toLocaleString()}원</Text>
    </TouchableOpacity>
  );
}

export default function MyOrdersScreen() {
  const navigation = useNavigation<Nav>();
  const { data: orders, isLoading } = useMyOrders();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!orders?.length) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-4xl mb-4">📦</Text>
        <Text className="text-gray-400 text-base">주문 내역이 없습니다.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <OrderCard
          order={item}
          onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
        />
      )}
      contentContainerClassName="px-4 pt-4"
      className="bg-gray-50"
    />
  );
}
