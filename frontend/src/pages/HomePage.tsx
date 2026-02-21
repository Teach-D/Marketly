import { useNavigate } from 'react-router-dom';
import { useProducts } from '../api/product.api';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';

export default function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading } = useProducts({ limit: 8 });

  return (
    <div>
      <section style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', padding: '5rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: '0 0 0.75rem', letterSpacing: '0.1em', fontWeight: 500 }}>
          BEST SHOPPING EXPERIENCE
        </p>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.2 }}>
          원하는 모든 것을<br />합리적인 가격에
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.85, margin: '0 0 2.5rem' }}>
          다양한 상품을 지금 바로 만나보세요.
        </p>
        <button
          onClick={() => navigate('/products')}
          style={{ padding: '0.875rem 2.5rem', background: '#fff', color: '#3b82f6', border: 'none', borderRadius: 99, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
        >
          쇼핑 시작하기 →
        </button>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>신상품</h2>
          <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem' }}>
            전체 보기 →
          </button>
        </div>
        {isLoading ? (
          <Spinner />
        ) : data?.items.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem 0' }}>등록된 상품이 없습니다.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.5rem' }}>
            {data?.items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <section style={{ background: '#f9fafb', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['🚚', '빠른 배송', '주문 후 신속하게 배송해 드립니다.'], ['🔒', '안전 결제', '안전하게 보호되는 결제 시스템.'], ['💬', '리뷰 시스템', '구매 후 솔직한 리뷰를 남겨보세요.']].map(([icon, title, desc]) => (
            <div key={title} style={{ flex: '1 1 200px', padding: '1.5rem', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>{icon}</p>
              <p style={{ fontWeight: 700, margin: '0 0 0.25rem' }}>{title}</p>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
