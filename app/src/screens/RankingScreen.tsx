import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRanking } from '../api/product.api';
import type { RankingItem } from '../types/product';
import type { ProductsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ProductsStackParamList, 'ProductList'>;

const RANK_COLORS = ['#F59E0B', '#9CA3AF', '#B45309'];

function RankingCard({ item, onPress }: { item: RankingItem; onPress: () => void }) {
  const medalColor = RANK_COLORS[item.rank - 1] ?? '#6B7280';

  return (
    <TouchableOpacity
      className="bg-white border border-gray-100 rounded-xl p-4 mb-3 flex-row items-center shadow-sm"
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: medalColor + '20' }}>
        <Text className="font-bold text-base" style={{ color: medalColor }}>
          {item.rank}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-900" numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text className="text-gray-500 text-sm mt-0.5">
          {item.product.price.toLocaleString()}원
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-xs text-gray-400">판매량</Text>
        <Text className="font-bold text-blue-600">{item.salesCount}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function RankingScreen() {
  const navigation = useNavigation<Nav>();
  const { data: ranking, isLoading } = useRanking(20);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={ranking ?? []}
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => (
          <RankingCard
            item={item}
            onPress={() =>
              navigation.navigate('ProductDetail', { id: item.product.id })
            }
          />
        )}
        contentContainerClassName="px-4 pt-4"
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">랭킹 데이터가 없습니다.</Text>
        }
      />
    </View>
  );
}
