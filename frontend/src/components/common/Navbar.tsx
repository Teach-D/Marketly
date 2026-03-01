import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useCart } from '../../api/cart.api';
import { useLogout } from '../../api/auth.api';

export default function Navbar() {
  const { user } = useAuthStore();
  const { data: cartItems } = useCart();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`);
  };

  const handleLogout = () => {
    logout(undefined, { onSuccess: () => navigate('/') });
  };

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <Link to='/' style={{ fontWeight: 800, fontSize: '1.3rem', color: '#3b82f6', textDecoration: 'none', flexShrink: 0 }}>
        ShopNest
      </Link>

      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 440 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='상품을 검색하세요...'
          style={{ width: '100%', padding: '0.5rem 1.25rem', border: '1px solid #e5e7eb', borderRadius: 99, fontSize: '0.9rem', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }}
        />
      </form>

      <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginLeft: 'auto', flexShrink: 0 }}>
        <Link to='/products' style={linkStyle}>상품</Link>

        {user ? (
          <>
            <Link to='/cart' style={{ ...linkStyle, position: 'relative', fontSize: '1.2rem' }}>
              🛒
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -8, background: '#ef4444', color: '#fff', borderRadius: 99, fontSize: '0.65rem', minWidth: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontWeight: 700 }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to='/orders' style={linkStyle}>주문</Link>
            <Link to='/coupons' style={linkStyle}>쿠폰</Link>
            <Link to='/my' style={linkStyle}>{user.email.split('@')[0]}</Link>
            {user.role === 'ADMIN' && (
              <Link to='/admin' style={{ ...linkStyle, color: '#f59e0b', fontWeight: 600 }}>관리자</Link>
            )}
            <button onClick={handleLogout} style={outlineBtn}>로그아웃</button>
          </>
        ) : (
          <>
            <Link to='/login' style={linkStyle}>로그인</Link>
            <Link to='/register' style={{ ...outlineBtn, background: '#3b82f6', color: '#fff', borderColor: '#3b82f6', textDecoration: 'none', padding: '0.375rem 0.875rem', borderRadius: 6, fontSize: '0.875rem', display: 'inline-block' }}>
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

const linkStyle: React.CSSProperties = { color: '#374151', textDecoration: 'none', fontSize: '0.9rem' };
const outlineBtn: React.CSSProperties = { background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, padding: '0.375rem 0.875rem', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' };
