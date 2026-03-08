import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useMyCoupons } from '../api/coupon.api';
import type { UserCoupon } from '../types/coupon';

function MyCouponCard({ item }: { item: UserCoupon }) {
  const validUntil = new Date(item.coupon.validUntil).toLocaleDateString('ko-KR');
  const isExpired = new Date(item.coupon.validUntil) < new Date();

  return (
    <View
      className={`border rounded-xl p-4 mb-3 ${
        isExpired ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'
      }`}
    >
      <View className="flex-row justify-between items-start">
        <Text
          className={`text-base font-semibold flex-1 mr-2 ${
            isExpired ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          {item.coupon.name}
        </Text>
        {isExpired && (
          <View className="bg-gray-100 px-2 py-1 rounded-full">
            <Text className="text-xs text-gray-400">만료됨</Text>
          </View>
        )}
      </View>
      <Text className={`text-2xl font-bold mt-1 ${isExpired ? 'text-gray-400' : 'text-blue-600'}`}>
        {item.coupon.discountRate}% 할인
      </Text>
      <Text className="text-xs text-gray-500 mt-2">
        최소 {item.coupon.minOrderAmount.toLocaleString()}원 이상 주문 시
      </Text>
      <Text className="text-xs text-gray-400 mt-1">유효기간: ~{validUntil}</Text>
    </View>
  );
}

export default function MyCouponsScreen() {
  const { data: coupons, isLoading } = useMyCoupons();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!coupons?.length) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-4xl mb-4">🎟️</Text>
        <Text className="text-gray-400 text-base">보유한 쿠폰이 없습니다.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={coupons}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MyCouponCard item={item} />}
      contentContainerClassName="px-4 pt-4 bg-gray-50 flex-1"
      className="bg-gray-50"
    />
  );
}
