import { useAdminOrders, useShipOrder, useDeliverOrder } from '../../api/admin.api';
import Spinner from '../../components/common/Spinner';
import type { Order } from '../../types';

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

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useAdminOrders();
  const { mutate: ship, isPending: isShipping } = useShipOrder();
  const { mutate: deliver, isPending: isDelivering } = useDeliverOrder();

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>주문 관리</h1>
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            {['주문번호', '회원', '상품', '총액', '상태', '액션'].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders?.map((order) => (
            <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={tdStyle}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{order.id.slice(0, 8)}...</span>
                <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                  {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </td>
              <td style={{ ...tdStyle, fontSize: '0.8rem', color: '#6b7280' }}>
                {order.userId.slice(0, 8)}...
              </td>
              <td style={tdStyle}>
                <span style={{ fontSize: '0.85rem' }}>{order.items.map((i) => i.product?.name ?? '삭제된 상품').join(', ')}</span>
              </td>
              <td style={tdStyle}>{order.totalPrice.toLocaleString()}원</td>
              <td style={tdStyle}>
                <span style={{ color: statusColor[order.status], fontWeight: 600, fontSize: '0.85rem' }}>
                  {statusLabel[order.status]}
                </span>
              </td>
              <td style={tdStyle}>
                {order.status === 'PAID' && (
                  <button onClick={() => ship(order.id)} disabled={isShipping} style={actionBtn('#3b82f6')}>
                    배송 처리
                  </button>
                )}
                {order.status === 'SHIPPING' && (
                  <button onClick={() => deliver(order.id)} disabled={isDelivering} style={actionBtn('#10b981')}>
                    배송 완료
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' };
const thStyle: React.CSSProperties = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#374151' };
const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
const actionBtn = (color: string): React.CSSProperties => ({ padding: '0.25rem 0.625rem', background: color, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' });
