import { useNavigate } from 'react-router-dom';
import { useAddToCart } from '../../api/cart.api';
import { useAuthStore } from '../../store/auth.store';
import { useToastStore } from '../../store/toast.store';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { mutate: addToCart, isPending } = useAddToCart();
  const toast = useToastStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.push('로그인이 필요합니다.', 'info');
      return navigate('/login');
    }
    addToCart(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => toast.push('장바구니에 담겼습니다!', 'success'),
        onError: () => toast.push('장바구니 담기에 실패했습니다.', 'error'),
      },
    );
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem' }}>
        🛍️
      </div>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </h3>
        {product.description && (
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#6b7280', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.description}
          </p>
        )}
        <p style={{ margin: '0.5rem 0 0.75rem', fontSize: '1.15rem', fontWeight: 800, color: '#111' }}>
          {product.price.toLocaleString()}원
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {product.stock > 0 ? `재고 ${product.stock}개` : '품절'}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isPending || product.stock === 0}
            style={{ padding: '0.4rem 0.875rem', background: product.stock > 0 ? '#3b82f6' : '#e5e7eb', color: product.stock > 0 ? '#fff' : '#9ca3af', border: 'none', borderRadius: 6, fontSize: '0.8rem', cursor: product.stock > 0 ? 'pointer' : 'not-allowed', fontWeight: 600 }}
          >
            {isPending ? '...' : '담기'}
          </button>
        </div>
      </div>
    </div>
  );
}
