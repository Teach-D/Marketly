import type { CartItem } from '../../types';
import { useUpdateCartItem, useRemoveCartItem } from '../../api/cart.api';

interface Props {
  item: CartItem;
}

export default function CartItemRow({ item }: Props) {
  const { mutate: update, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: remove, isPending: isRemoving } = useRemoveCartItem();

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    update({ itemId: item.id, quantity: value });
  };

  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{item.product.name}</p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
          {item.product.price.toLocaleString()}원
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={isUpdating || item.quantity <= 1}
          style={qtyBtnStyle}
        >
          −
        </button>
        <span style={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isUpdating}
          style={qtyBtnStyle}
        >
          +
        </button>
      </div>

      <p style={{ minWidth: 80, textAlign: 'right', fontWeight: 600, margin: 0 }}>
        {(item.product.price * item.quantity).toLocaleString()}원
      </p>

      <button
        onClick={() => remove(item.id)}
        disabled={isRemoving}
        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}
      >
        ✕
      </button>
    </li>
  );
}

const qtyBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '1rem',
};
