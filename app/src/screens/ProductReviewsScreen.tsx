import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useReviews, useDeleteReview } from '../api/review.api';
import { useAuthStore } from '../store/auth.store';
import type { Review } from '../types/review';
import type { ProductsStackParamList } from '../navigation/types';

type Route = RouteProp<ProductsStackParamList, 'ProductReviews'>;
type Nav = NativeStackNavigationProp<ProductsStackParamList, 'ProductReviews'>;

function StarRating({ rating }: { rating: number }) {
  return (
    <Text className="text-yellow-400">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </Text>
  );
}

function ReviewCard({
  review,
  isOwner,
  onEdit,
  onDelete,
}: {
  review: Review;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const date = new Date(review.createdAt).toLocaleDateString('ko-KR');
  return (
    <View className="bg-white border border-gray-100 rounded-xl p-4 mb-3">
      <View className="flex-row justify-between items-start">
        <View>
          <StarRating rating={review.rating} />
          <Text className="text-xs text-gray-400 mt-1">
            {review.user.email.split('@')[0]} · {date}
          </Text>
        </View>
        {isOwner && (
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={onEdit}>
              <Text className="text-blue-500 text-sm">수정</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Text className="text-red-400 text-sm">삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text className="text-gray-700 mt-2 leading-5">{review.content}</Text>
    </View>
  );
}

export default function ProductReviewsScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const [page] = useState(1);
  const { data, isLoading } = useReviews(params.productId, page);
  const { mutate: deleteReview } = useDeleteReview(params.productId);
  const { accessToken } = useAuthStore();

  const handleDelete = (reviewId: string) => {
    Alert.alert('리뷰 삭제', '리뷰를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () =>
          deleteReview(reviewId, {
            onSuccess: () => Toast.show({ type: 'success', text1: '리뷰가 삭제됐습니다.' }),
            onError: () => Toast.show({ type: 'error', text1: '삭제에 실패했습니다.' }),
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

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReviewCard
            review={item}
            isOwner={!!accessToken}
            onEdit={() =>
              navigation.navigate('WriteReview', {
                productId: params.productId,
                reviewId: item.id,
                initialRating: item.rating,
                initialContent: item.content,
              })
            }
            onDelete={() => handleDelete(item.id)}
          />
        )}
        contentContainerClassName="px-4 pt-4"
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">아직 리뷰가 없습니다.</Text>
        }
      />

      {accessToken && (
        <View className="p-4 border-t border-gray-100 bg-white">
          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-4 items-center"
            onPress={() =>
              navigation.navigate('WriteReview', { productId: params.productId })
            }
          >
            <Text className="text-white font-bold">리뷰 작성하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
