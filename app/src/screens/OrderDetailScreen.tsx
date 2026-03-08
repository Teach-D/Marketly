import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useOrder, useCancelOrder } from '../api/order.api';
import type { MyStackParamList } from '../navigation/types';

type Route = RouteProp<MyStackParamList, 'OrderDetail'>;

const STATUS_MAP = {
  PAID: '결제 완료',
  SHIPPING: '배송 중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소됨',
};

export default function OrderDetailScreen() {
  const { params } = useRoute<Route>();
  const { data: order, isLoading } = useOrder(params.id);
  const { mutate: cancel, isPending } = useCancelOrder();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-400">주문을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const canCancel = order.status === 'PAID';
  const date = new Date(order.createdAt).toLocaleString('ko-KR');

  const handleCancel = () => {
    Alert.alert('주문 취소', '주문을 취소하시겠습니까?', [
      { text: '아니오', style: 'cancel' },
      {
        text: '취소하기',
        style: 'destructive',
        onPress: () =>
          cancel(order.id, {
            onSuccess: () => Toast.show({ type: 'success', text1: '주문이 취소됐습니다.' }),
            onError: () => Toast.show({ type: 'error', text1: '취소에 실패했습니다.' }),
          }),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-400 text-sm">{date}</Text>
          <Text className="font-semibold text-blue-600">{STATUS_MAP[order.status]}</Text>
        </View>

        <Text className="text-base font-bold text-gray-900 mb-3">주문 상품</Text>
        {order.items.map((item) => (
          <View key={item.id} className="flex-row justify-between py-2 border-b border-gray-50">
            <View className="flex-1 mr-2">
              <Text className="text-gray-900" numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text className="text-gray-500 text-sm">{item.quantity}개</Text>
            </View>
            <Text className="text-gray-900 font-medium">
              {(item.price * item.quantity).toLocaleString()}원
            </Text>
          </View>
        ))}

        <View className="mt-4 gap-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-500">상품 합계</Text>
            <Text className="text-gray-900">
              {(order.totalPrice + order.discountAmount).toLocaleString()}원
            </Text>
          </View>
          {order.discountAmount > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-blue-600">쿠폰 할인</Text>
              <Text className="text-blue-600">-{order.discountAmount.toLocaleString()}원</Text>
            </View>
          )}
          <View className="flex-row justify-between pt-2 border-t border-gray-100">
            <Text className="font-bold text-gray-900">결제 금액</Text>
            <Text className="font-bold text-xl text-gray-900">
              {order.totalPrice.toLocaleString()}원
            </Text>
          </View>
        </View>
      </ScrollView>

      {canCancel && (
        <View className="p-4 border-t border-gray-100">
          <TouchableOpacity
            className="border border-red-400 rounded-xl py-4 items-center"
            onPress={handleCancel}
            disabled={isPending}
          >
            <Text className="text-red-500 font-semibold">
              {isPending ? '취소 중...' : '주문 취소'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
