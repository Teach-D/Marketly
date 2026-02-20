import { useParams, useNavigate } from 'react-router-dom';
import { useOrder, useCancelOrder } from '../api/order.api';
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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(id ?? '');
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const handleCancel = () => {
    if (!order || !confirm('주문을 취소하시겠습니까?')) return;
    cancelOrder(order.id, {
      onSuccess: () => navigate('/orders'),
      onError: () => alert('주문 취소에 실패했습니다.'),
    });
  };

  if (isLoading) return <Spinner />;
  if (!order) return <p style={{ textAlign: 'center', padding: '2rem' }}>주문을 찾을 수 없습니다.</p>;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
      <button
        onClick={() => navigate('/orders')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginBottom: '1rem', padding: 0 }}
      >
        ← 주문 목록으로
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>주문 상세</h1>
        <span style={{ fontWeight: 600, color: statusColor[order.status] }}>{statusLabel[order.status]}</span>
      </div>

      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        주문일: {new Date(order.createdAt).toLocaleString('ko-KR')}
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
        {order.items.map((item) => (
          <li
            key={item.id}
            style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>{item.product.name}</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                {item.price.toLocaleString()}원 × {item.quantity}
              </p>
            </div>
            <strong>{(item.price * item.quantity).toLocaleString()}원</strong>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderTop: '2px solid #111', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>총 합계</span>
        <strong style={{ fontSize: '1.25rem' }}>{order.totalPrice.toLocaleString()}원</strong>
      </div>

      {order.status === 'PAID' && (
        <button
          onClick={handleCancel}
          disabled={isCancelling}
          style={cancelBtnStyle}
        >
          {isCancelling ? '취소 처리 중...' : '주문 취소'}
        </button>
      )}
    </div>
  );
}

const cancelBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem',
  backgroundColor: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  cursor: 'pointer',
};
