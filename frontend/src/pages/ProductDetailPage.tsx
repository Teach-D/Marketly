import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../api/product.api';
import { useProductReviews } from '../api/review.api';
import { useAddToCart } from '../api/cart.api';
import { useAuthStore } from '../store/auth.store';
import Spinner from '../components/common/Spinner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useProduct(id ?? '');
  const { data: reviewData } = useProductReviews(id ?? '');
  const { mutate: addToCart, isPending, isSuccess } = useAddToCart();

  if (isLoading) return <Spinner />;
  if (!product) return <p>상품을 찾을 수 없습니다.</p>;

  const handleAddToCart = () => {
    if (!user) return navigate('/login');
    addToCart({ productId: product.id, quantity });
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem' }}>
      <button onClick={() => navigate(-1)} style={{ ...btnStyle, backgroundColor: '#6b7280', marginBottom: '1.5rem' }}>
        ← 목록으로
      </button>

      <section style={sectionStyle}>
        <h1 style={{ marginBottom: '0.5rem' }}>{product.name}</h1>
        {product.description && <p style={{ color: '#6b7280' }}>{product.description}</p>}
        <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '1rem 0' }}>
          {product.price.toLocaleString()}원
        </p>
        <p style={{ color: product.stock > 0 ? '#10b981' : '#ef4444', marginBottom: '1rem' }}>
          {product.stock > 0 ? `재고 ${product.stock}개` : '품절'}
        </p>

        {product.stock > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type='number'
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
              style={{ width: 72, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', textAlign: 'center' }}
            />
            <button onClick={handleAddToCart} disabled={isPending} style={btnStyle}>
              {isPending ? '처리 중...' : '장바구니 담기'}
            </button>
            {isSuccess && <span style={{ color: '#10b981', fontSize: '0.9rem' }}>담겼습니다!</span>}
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
          리뷰 ({reviewData?.total ?? 0}개)
        </h2>
        {reviewData?.items.length === 0 ? (
          <p style={{ color: '#6b7280' }}>아직 리뷰가 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reviewData?.items.map((review) => (
              <li key={review.id} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    {review.user.email.split('@')[0]} · {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#374151' }}>{review.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  marginBottom: '2rem',
  padding: '1.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
};

const btnStyle: React.CSSProperties = {
  padding: '0.625rem 1.25rem',
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  cursor: 'pointer',
};
