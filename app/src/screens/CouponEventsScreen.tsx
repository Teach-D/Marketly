import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useCouponEvents, useIssueCoupon } from '../api/coupon.api';
import type { CouponEvent } from '../types/coupon';

const STATUS_MAP = {
  open: { label: '발급 가능', bg: 'bg-blue-100', text: 'text-blue-600' },
  upcoming: { label: '오픈 예정', bg: 'bg-yellow-100', text: 'text-yellow-600' },
  sold_out: { label: '소진', bg: 'bg-gray-100', text: 'text-gray-400' },
};

function CouponEventCard({
  item,
  onIssue,
  isPending,
}: {
  item: CouponEvent;
  onIssue: () => void;
  isPending: boolean;
}) {
  const status = STATUS_MAP[item.status];
  const openDate = new Date(item.openAt).toLocaleString('ko-KR');
  const validUntil = new Date(item.validUntil).toLocaleDateString('ko-KR');

  return (
    <View className="bg-white border border-gray-100 rounded-xl p-4 mb-3">
      <View className="flex-row justify-between items-start">
        <Text className="text-base font-semibold text-gray-900 flex-1 mr-2">{item.name}</Text>
        <View className={`px-2 py-1 rounded-full ${status.bg}`}>
          <Text className={`text-xs font-medium ${status.text}`}>{status.label}</Text>
        </View>
      </View>

      <Text className="text-2xl font-bold text-blue-600 mt-2">{item.discountRate}% 할인</Text>

      <View className="mt-2 gap-1">
        <Text className="text-xs text-gray-500">
          최소 주문금액: {item.minOrderAmount.toLocaleString()}원
        </Text>
        <Text className="text-xs text-gray-500">
          발급: {item.issuedCount}/{item.maxIssueCount}장
        </Text>
        {item.status === 'upcoming' && (
          <Text className="text-xs text-yellow-600">오픈: {openDate}</Text>
        )}
        <Text className="text-xs text-gray-400">유효기간: ~{validUntil}</Text>
      </View>

      {item.status === 'open' && (
        <TouchableOpacity
          className="mt-3 bg-blue-600 rounded-lg py-3 items-center"
          onPress={onIssue}
          disabled={isPending}
        >
          <Text className="text-white font-semibold text-sm">
            {isPending ? '발급 중...' : '쿠폰 받기'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function CouponEventsScreen() {
  const { data: events, isLoading } = useCouponEvents();
  const { mutate: issue, isPending } = useIssueCoupon();

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
        data={events ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CouponEventCard
            item={item}
            isPending={isPending}
            onIssue={() =>
              issue(item.id, {
                onSuccess: () =>
                  Toast.show({ type: 'success', text1: '쿠폰을 받았습니다!' }),
                onError: (err: unknown) => {
                  const msg =
                    (err as { response?: { data?: { error?: { message?: string } } } })?.response
                      ?.data?.error?.message ?? '쿠폰 발급에 실패했습니다.';
                  Toast.show({ type: 'error', text1: msg });
                },
              })
            }
          />
        )}
        contentContainerClassName="px-4 pt-4"
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">진행 중인 쿠폰 이벤트가 없습니다.</Text>
        }
      />
    </View>
  );
}
