import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useCreateReview, useUpdateReview } from '../api/review.api';
import type { ProductsStackParamList } from '../navigation/types';

type Route = RouteProp<ProductsStackParamList, 'WriteReview'>;
type Nav = NativeStackNavigationProp<ProductsStackParamList, 'WriteReview'>;

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)}>
          <Text className={`text-3xl ${star <= value ? 'text-yellow-400' : 'text-gray-200'}`}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function WriteReviewScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const isEdit = !!params.reviewId;

  const [rating, setRating] = useState(params.initialRating ?? 5);
  const [content, setContent] = useState(params.initialContent ?? '');

  const { mutate: createReview, isPending: isCreating } = useCreateReview(params.productId);
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview(params.productId);
  const isPending = isCreating || isUpdating;

  const handleSubmit = () => {
    if (!content.trim()) {
      Toast.show({ type: 'error', text1: '리뷰 내용을 입력해주세요.' });
      return;
    }

    if (isEdit && params.reviewId) {
      updateReview(
        { id: params.reviewId, rating, content },
        {
          onSuccess: () => {
            Toast.show({ type: 'success', text1: '리뷰가 수정됐습니다.' });
            navigation.goBack();
          },
          onError: () => Toast.show({ type: 'error', text1: '수정에 실패했습니다.' }),
        },
      );
    } else {
      createReview(
        { productId: params.productId, rating, content },
        {
          onSuccess: () => {
            Toast.show({ type: 'success', text1: '리뷰가 등록됐습니다.' });
            navigation.goBack();
          },
          onError: (err: unknown) => {
            const msg =
              (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
                ?.error?.message ?? '리뷰 등록에 실패했습니다.';
            Toast.show({ type: 'error', text1: msg });
          },
        },
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerClassName="p-4">
        <Text className="text-base font-bold text-gray-900 mb-3">평점</Text>
        <StarPicker value={rating} onChange={setRating} />

        <Text className="text-base font-bold text-gray-900 mt-6 mb-3">리뷰 내용</Text>
        <TextInput
          className="border border-gray-200 rounded-xl p-4 text-gray-900 min-h-32"
          placeholder="상품은 어떠셨나요? 솔직한 리뷰를 남겨주세요."
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
          maxLength={500}
        />
        <Text className="text-right text-xs text-gray-400 mt-1">{content.length}/500</Text>
      </ScrollView>

      <View className="p-4 border-t border-gray-100">
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-4 items-center"
          onPress={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              {isEdit ? '수정하기' : '등록하기'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
