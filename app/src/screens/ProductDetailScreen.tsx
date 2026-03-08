import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import type { ProductsStackParamList } from '../navigation/types';
import { useProduct } from '../api/product.api';
import { useAddToCart } from '../api/cart.api';

type Route = RouteProp<ProductsStackParamList, 'ProductDetail'>;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-3 border-b border-gray-100">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-gray-900 text-sm font-medium">{value}</Text>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { params } = useRoute<Route>();
  const { data: product, isLoading } = useProduct(params.id);
  const { mutate: addToCart, isPending } = useAddToCart();
  const [qty] = useState(1);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-400">상품을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(
      { productId: product.id, quantity: qty },
      {
        onSuccess: () =>
          Toast.show({ type: 'success', text1: '장바구니에 담았습니다.' }),
        onError: () =>
          Toast.show({ type: 'error', text1: '장바구니 담기에 실패했습니다.' }),
      },
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="p-4">
        <Text className="text-2xl font-bold text-gray-900">{product.name}</Text>

        {product.description && (
          <Text className="text-gray-600 mt-2 leading-6">{product.description}</Text>
        )}

        <View className="mt-4 bg-blue-50 rounded-xl p-4">
          <Text className="text-3xl font-bold text-blue-600">
            {product.price.toLocaleString()}원
          </Text>
        </View>

        <View className="mt-4">
          <InfoRow label="재고" value={`${product.stock}개`} />
          <InfoRow label="판매량" value={`${product.salesCount}개`} />
          {product.stat && (
            <InfoRow
              label="평균 평점"
              value={`★ ${product.stat.avgRating.toFixed(1)} (${product.stat.reviewCount}개)`}
            />
          )}
        </View>
      </ScrollView>

      <View className="p-4 border-t border-gray-100">
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-4 items-center"
          onPress={handleAddToCart}
          disabled={product.stock === 0 || isPending}
        >
          <Text className="text-white font-bold text-base">
            {product.stock === 0 ? '품절' : isPending ? '담는 중...' : '장바구니에 담기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
