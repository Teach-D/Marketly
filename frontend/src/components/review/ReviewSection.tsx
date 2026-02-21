import { useState } from 'react';
import { useProductReviews, useCreateReview } from '../../api/review.api';
import { useAuthStore } from '../../store/auth.store';
import { useToastStore } from '../../store/toast.store';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';

interface Props {
  productId: string;
}

export default function ReviewSection({ productId }: Props) {
  const { user } = useAuthStore();
  const { data: reviewData } = useProductReviews(productId);
  const { mutate: createReview, isPending: isCreating } = useCreateReview(productId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useToastStore();

  const myReview = user ? reviewData?.items.find((r) => r.userId === user.id) : null;

  const handleCreate = (rating: number, content: string) => {
    createReview(
      { productId, rating, content },
      {
        onSuccess: () => toast.push('리뷰가 등록되었습니다.', 'success'),
        onError: () => toast.push('구매 후 배송 완료된 상품만 리뷰를 작성할 수 있습니다.', 'error'),
      },
    );
  };

  return (
    <section>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
        리뷰 ({reviewData?.total ?? 0}개)
      </h2>

      {user && !myReview && (
        <ReviewForm
          productId={productId}
          isPending={isCreating}
          onSubmit={handleCreate}
        />
      )}

      {!reviewData?.items.length ? (
        <p style={{ color: '#6b7280', marginTop: '1rem' }}>아직 리뷰가 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {reviewData.items.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              productId={productId}
              currentUserId={user?.id ?? null}
              isEditing={editingId === review.id}
              onEditStart={() => setEditingId(review.id)}
              onEditEnd={() => setEditingId(null)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
