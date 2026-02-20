import type { Order } from '../../types';

const STATUS_LABEL: Record<Order['status'], string> = {
  PAID: '결제완료',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소됨',
};

const STATUS_COLOR: Record<Order['status'], string> = {
  PAID: '#f59e0b',
  SHIPPING: '#3b82f6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
};

interface Props {
  status: Order['status'];
}

export default function OrderStatusBadge({ status }: Props) {
  return (
    <span
      style={{
        backgroundColor: STATUS_COLOR[status],
        color: '#fff',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 600,
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
