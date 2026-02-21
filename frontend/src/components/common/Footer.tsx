import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#1f2937', color: '#9ca3af', padding: '3rem 2rem 2rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', margin: '0 0 0.5rem' }}>ShopNest</p>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>최고의 쇼핑 경험을 제공합니다.</p>
        </div>
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 0.75rem', fontSize: '0.875rem' }}>쇼핑</p>
            {([['상품 목록', '/products'], ['장바구니', '/cart'], ['주문 내역', '/orders']] as const).map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', color: '#9ca3af', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 0.75rem', fontSize: '0.875rem' }}>계정</p>
            {([['로그인', '/login'], ['회원가입', '/register'], ['마이페이지', '/my']] as const).map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', color: '#9ca3af', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid #374151', fontSize: '0.8rem', textAlign: 'center' }}>
        © 2025 ShopNest. All rights reserved.
      </div>
    </footer>
  );
}
