import { useState } from 'react';

interface Props {
  productId: string;
  initialRating?: number;
  initialContent?: string;
  isPending: boolean;
  onSubmit: (rating: number, content: string) => void;
  onCancel?: () => void;
}

export default function ReviewForm({ productId: _productId, initialRating = 5, initialContent = '', isPending, onSubmit, onCancel }: Props) {
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(rating, content.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>별점</label>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type='button'
              onClick={() => setRating(star)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: star <= rating ? '#f59e0b' : '#d1d5db', padding: 0 }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder='리뷰를 작성해 주세요.'
          required
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type='submit' disabled={isPending} style={submitBtnStyle}>
          {isPending ? '저장 중...' : '저장'}
        </button>
        {onCancel && (
          <button type='button' onClick={onCancel} style={cancelBtnStyle}>
            취소
          </button>
        )}
      </div>
    </form>
  );
}

const submitBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.9rem',
  cursor: 'pointer',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: '#fff',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.9rem',
  cursor: 'pointer',
};
