import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>{product.name}</h3>
      {product.description && (
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.description}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
        <strong>{product.price.toLocaleString()}원</strong>
        <span style={{ fontSize: '0.8rem', color: product.stock > 0 ? '#10b981' : '#ef4444' }}>
          {product.stock > 0 ? `재고 ${product.stock}개` : '품절'}
        </span>
      </div>
    </div>
  );
}
