import { useNavigate } from 'react-router-dom';
import { useMyOrders } from '../api/order.api';
import Spinner from '../components/common/Spinner';
import type { Order } from '../types';

const statusLabel: Record<Order['status'], string> = {
  PAID: '결제완료',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소됨',
};

const statusColor: Record<Order['status'], string> = {
  PAID: '#3b82f6',
  SHIPPING: '#f59e0b',
  DELIVERED: '#10b981',
  CANCELLED: '#6b7280',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useMyOrders();

  if (isLoading) return <Spinner />;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>주문 내역</h1>

      {!orders || orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
          <p>주문 내역이 없습니다.</p>
          <button onClick={() => navigate('/products')} style={primaryBtnStyle}>
            상품 보러 가기
          </button>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => (
            <li
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.25rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: statusColor[order.status] }}>
                  {statusLabel[order.status]}
                </span>
              </div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#374151' }}>
                {order.items.map((item) => item.product?.name ?? '삭제된 상품').join(', ')}
              </p>
              <strong style={{ fontSize: '1rem' }}>{order.totalPrice.toLocaleString()}원</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const primaryBtnStyle: React.CSSProperties = {
  marginTop: '1rem',
  padding: '0.625rem 1.5rem',
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  cursor: 'pointer',
};
