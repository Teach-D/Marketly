import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '../api/cart.api';
import type { CartItem } from '../types/cart';

function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
      <View className="flex-row justify-between items-start">
        <Text className="text-base font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>
          {item.product.name}
        </Text>
        <TouchableOpacity onPress={onRemove}>
          <Text className="text-gray-400 text-sm">삭제</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => onUpdateQty(item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Text className="text-gray-700 font-bold">−</Text>
          </TouchableOpacity>
          <Text className="text-base font-semibold text-gray-900 w-6 text-center">
            {item.quantity}
          </Text>
          <TouchableOpacity
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => onUpdateQty(item.quantity + 1)}
          >
            <Text className="text-gray-700 font-bold">+</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-blue-600 font-bold">
          {(item.product.price * item.quantity).toLocaleString()}원
        </Text>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const { data: items, isLoading } = useCart();
  const { mutate: updateQty } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveCartItem();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();

  const total = items?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0;

  const handleClear = () => {
    Alert.alert('장바구니 비우기', '모든 상품을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '비우기',
        style: 'destructive',
        onPress: () =>
          clearCart(undefined, {
            onSuccess: () => Toast.show({ type: 'success', text1: '장바구니를 비웠습니다.' }),
            onError: () => Toast.show({ type: 'error', text1: '오류가 발생했습니다.' }),
          }),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!items?.length) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-4xl mb-4">🛒</Text>
        <Text className="text-gray-400 text-base">장바구니가 비어있습니다.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
        <Text className="text-sm text-gray-500">총 {items.length}종</Text>
        <TouchableOpacity onPress={handleClear} disabled={isClearing}>
          <Text className="text-red-400 text-sm">전체 삭제</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            onUpdateQty={(qty) =>
              updateQty(
                { productId: item.productId, quantity: qty },
                { onError: () => Toast.show({ type: 'error', text1: '수량 변경에 실패했습니다.' }) },
              )
            }
            onRemove={() =>
              removeItem(item.productId, {
                onError: () => Toast.show({ type: 'error', text1: '삭제에 실패했습니다.' }),
              })
            }
          />
        )}
        contentContainerClassName="px-4 pt-3"
      />

      <View className="bg-white border-t border-gray-100 p-4">
        <View className="flex-row justify-between mb-3">
          <Text className="text-gray-600">합계</Text>
          <Text className="text-xl font-bold text-gray-900">{total.toLocaleString()}원</Text>
        </View>
        <TouchableOpacity className="bg-blue-600 rounded-xl py-4 items-center">
          <Text className="text-white font-bold text-base">주문하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
