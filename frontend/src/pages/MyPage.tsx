import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useLogout } from '../api/auth.api';
import { useMyOrders } from '../api/order.api';
import OrderList from '../components/order/OrderList';
import Spinner from '../components/common/Spinner';

export default function MyPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: orders, isLoading: isOrdersLoading } = useMyOrders();

  const handleLogout = () => {
    logout(undefined, { onSuccess: () => navigate('/login') });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>마이페이지</h1>
        <button onClick={handleLogout} disabled={isLoggingOut} style={logoutButtonStyle}>
          {isLoggingOut ? '처리 중...' : '로그아웃'}
        </button>
      </header>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>내 정보</h2>
        <p><strong>이메일</strong>: {user?.email}</p>
        <p><strong>권한</strong>: {user?.role === 'ADMIN' ? '관리자' : '일반 회원'}</p>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>주문 내역 / 배송 상태</h2>
        {isOrdersLoading ? (
          <Spinner />
        ) : (
          <OrderList orders={orders ?? []} />
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

const sectionTitleStyle: React.CSSProperties = {
  marginBottom: '1rem',
  fontSize: '1.1rem',
  fontWeight: 600,
};

const logoutButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};
