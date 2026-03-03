import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin/dashboard', label: '대시보드' },
  { to: '/admin/products', label: '상품 관리' },
  { to: '/admin/orders', label: '주문 관리' },
  { to: '/admin/users', label: '회원 관리' },
  { to: '/admin/coupons', label: '쿠폰 관리' },
];

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 200, background: '#1f2937', padding: '2rem 0', flexShrink: 0 }}>
        <p style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 700, padding: '0 1.25rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>
          관리자 패널
        </p>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'block',
              padding: '0.625rem 1.25rem',
              color: isActive ? '#fff' : '#9ca3af',
              background: isActive ? '#374151' : 'transparent',
              textDecoration: 'none',
              fontSize: '0.9rem',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <main style={{ flex: 1, padding: '2rem', background: '#f9fafb', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
