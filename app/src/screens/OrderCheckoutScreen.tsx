import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useCart } from '../api/cart.api';
import { useMyCoupons } from '../api/coupon.api';
import { useCreateOrder } from '../api/order.api';
import type { CartStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CartStackParamList, 'OrderCheckout'>;

export default function OrderCheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedCouponId, setSelectedCouponId] = useState<string | undefined>();
  const { data: cartItems } = useCart();
  const { data: coupons } = useMyCoupons();
  const { mutate: createOrder, isPending } = useCreateOrder();

  const subtotal = cartItems?.reduce((sum, i) => sum + i.product.price * i.quantity, 0) ?? 0;

  const selectedCoupon = coupons?.find((c) => c.couponId === selectedCouponId);
  const discount = selectedCoupon
    ? Math.floor(subtotal * (selectedCoupon.coupon.discountRate / 100))
    : 0;
  const total = subtotal - discount;

  const handleOrder = () => {
    createOrder(selectedCouponId, {
      onSuccess: () => {
        Toast.show({ type: 'success', text1: '주문이 완료됐습니다!' });
        navigation.navigate('MyOrders');
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
            ?.error?.message ?? '주문에 실패했습니다.';
        Toast.show({ type: 'error', text1: msg });
      },
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerClassName="p-4">
        <Text className="text-base font-bold text-gray-900 mb-3">주문 상품</Text>
        {cartItems?.map((item) => (
          <View key={item.productId} className="flex-row justify-between py-2">
            <Text className="text-gray-700 flex-1 mr-2" numberOfLines={1}>
              {item.product.name} × {item.quantity}
            </Text>
            <Text className="text-gray-900 font-medium">
              {(item.product.price * item.quantity).toLocaleString()}원
            </Text>
          </View>
        ))}

        <View className="h-px bg-gray-200 my-4" />

        <Text className="text-base font-bold text-gray-900 mb-3">쿠폰 선택</Text>
        {!coupons?.length ? (
          <Text className="text-gray-400 text-sm">사용 가능한 쿠폰이 없습니다.</Text>
        ) : (
          <>
            <TouchableOpacity
              className={`border rounded-lg p-3 mb-2 ${
                !selectedCouponId ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
              onPress={() => setSelectedCouponId(undefined)}
            >
              <Text className="text-gray-700">쿠폰 사용 안 함</Text>
            </TouchableOpacity>
            {coupons.map((uc) => {
              const isSelected = selectedCouponId === uc.couponId;
              const applicable = subtotal >= uc.coupon.minOrderAmount;
              return (
                <TouchableOpacity
                  key={uc.id}
                  className={`border rounded-lg p-3 mb-2 ${
                    !applicable
                      ? 'border-gray-100 bg-gray-50 opacity-50'
                      : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => applicable && setSelectedCouponId(uc.couponId)}
                  disabled={!applicable}
                >
                  <Text className="text-gray-900 font-medium">{uc.coupon.name}</Text>
                  <Text className="text-blue-600 text-sm mt-0.5">
                    {uc.coupon.discountRate}% 할인
                  </Text>
                  {!applicable && (
                    <Text className="text-xs text-gray-400 mt-0.5">
                      최소 주문금액 {uc.coupon.minOrderAmount.toLocaleString()}원 이상
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      <View className="bg-white border-t border-gray-100 p-4">
        <View className="gap-1 mb-3">
          <View className="flex-row justify-between">
            <Text className="text-gray-500">상품 합계</Text>
            <Text className="text-gray-900">{subtotal.toLocaleString()}원</Text>
          </View>
          {discount > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-blue-600">쿠폰 할인</Text>
              <Text className="text-blue-600">-{discount.toLocaleString()}원</Text>
            </View>
          )}
          <View className="flex-row justify-between mt-1">
            <Text className="font-bold text-gray-900">최종 결제금액</Text>
            <Text className="font-bold text-xl text-gray-900">{total.toLocaleString()}원</Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-4 items-center"
          onPress={handleOrder}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">결제하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
