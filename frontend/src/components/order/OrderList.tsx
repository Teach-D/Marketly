import type { Order } from '../../types';
import OrderStatusBadge from './OrderStatusBadge';

interface Props {
  orders: Order[];
}

export default function OrderList({ orders }: Props) {
  if (orders.length === 0) {
    return <p style={{ color: '#6b7280' }}>주문 내역이 없습니다.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {orders.map((order) => (
        <li
          key={order.id}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>주문 #{order.id.slice(0, 8)}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0', fontSize: '0.9rem', color: '#374151' }}>
            {order.items?.map((item) => (
              <li key={item.id}>
                {item.product?.name} × {item.quantity}
              </li>
            ))}
          </ul>
          <div style={{ textAlign: 'right', fontWeight: 600 }}>
            합계: {order.totalPrice.toLocaleString()}원
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            {new Date(order.createdAt).toLocaleDateString('ko-KR')}
          </div>
        </li>
      ))}
    </ul>
  );
}
