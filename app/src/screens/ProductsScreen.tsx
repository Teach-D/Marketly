import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteProducts } from '../api/product.api';
import type { Product } from '../types/product';
import type { ProductsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ProductsStackParamList, 'ProductList'>;

function ProductCard({ item, onPress }: { item: Product; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-xl p-4 mb-3 shadow-sm"
      onPress={onPress}
    >
      <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
        {item.description ?? '설명 없음'}
      </Text>
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-blue-600 font-bold">{item.price.toLocaleString()}원</Text>
        <View className="flex-row items-center gap-2">
          {item.stat && (
            <Text className="text-xs text-yellow-500">★ {item.stat.avgRating.toFixed(1)}</Text>
          )}
          <Text className="text-xs text-gray-400">재고 {item.stock}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProductsScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteProducts({
    search: query || undefined,
    limit: 20,
  });

  const products = data?.pages.flatMap((p) => p.items) ?? [];

  const handleSearch = useCallback(() => setQuery(search), [search]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        item={item}
        onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
      />
    ),
    [navigation],
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 flex-row gap-2">
        <TextInput
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-gray-900"
          placeholder="상품 검색"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          className="bg-blue-600 rounded-lg px-4 justify-center"
          onPress={handleSearch}
        >
          <Text className="text-white font-semibold">검색</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerClassName="px-4 pt-3"
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator color="#2563EB" className="py-4" /> : null
          }
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-20">상품이 없습니다.</Text>
          }
        />
      )}
    </View>
  );
}
