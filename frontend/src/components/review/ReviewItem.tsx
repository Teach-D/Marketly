import type { Review } from '../../types';
import ReviewForm from './ReviewForm';
import { useUpdateReview, useDeleteReview } from '../../api/review.api';

interface Props {
  review: Review;
  productId: string;
  currentUserId: string | null;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export default function ReviewItem({ review, productId, currentUserId, isEditing, onEditStart, onEditEnd }: Props) {
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview(productId);
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview(productId);

  const isOwner = currentUserId === review.userId;

  const handleUpdate = (rating: number, content: string) => {
    updateReview({ id: review.id, dto: { rating, content } }, { onSuccess: onEditEnd });
  };

  const handleDelete = () => {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return;
    deleteReview(review.id);
  };

  return (
    <li style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: 600 }}>
          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            {review.user.email.split('@')[0]} · {new Date(review.createdAt).toLocaleDateString('ko-KR')}
          </span>
          {isOwner && !isEditing && (
            <>
              <button onClick={onEditStart} style={actionBtnStyle('#3b82f6')}>수정</button>
              <button onClick={handleDelete} disabled={isDeleting} style={actionBtnStyle('#ef4444')}>삭제</button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <ReviewForm
          productId={productId}
          initialRating={review.rating}
          initialContent={review.content}
          isPending={isUpdating}
          onSubmit={handleUpdate}
          onCancel={onEditEnd}
        />
      ) : (
        <p style={{ margin: 0, color: '#374151' }}>{review.content}</p>
      )}
    </li>
  );
}

const actionBtnStyle = (color: string): React.CSSProperties => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color,
  fontSize: '0.8rem',
  padding: '0 0.25rem',
});
