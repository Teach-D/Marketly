import { useNavigate } from 'react-router-dom';
import { useCart } from '../api/cart.api';
import { useCreateOrder } from '../api/order.api';
import CartItemRow from '../components/cart/CartItemRow';
import Spinner from '../components/common/Spinner';
import { useToastStore } from '../store/toast.store';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: items, isLoading } = useCart();
  const { mutate: createOrder, isPending: isOrdering } = useCreateOrder();
  const toast = useToastStore();

  const totalPrice = items?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0;

  const handleOrder = () => {
    createOrder(undefined, {
      onSuccess: () => navigate('/orders'),
      onError: () => toast.push('주문에 실패했습니다. 재고를 확인해 주세요.', 'error'),
    });
  };

  if (isLoading) return <Spinner />;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>장바구니</h1>

      {!items || items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
          <p>장바구니가 비어 있습니다.</p>
          <button onClick={() => navigate('/products')} style={primaryBtnStyle}>
            상품 보러 가기
          </button>
        </div>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderTop: '2px solid #111' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>총 합계</span>
            <strong style={{ fontSize: '1.25rem' }}>{totalPrice.toLocaleString()}원</strong>
          </div>

          <button
            onClick={handleOrder}
            disabled={isOrdering}
            style={{ ...primaryBtnStyle, width: '100%', marginTop: '1rem', fontSize: '1.1rem', padding: '0.875rem' }}
          >
            {isOrdering ? '주문 처리 중...' : `${totalPrice.toLocaleString()}원 주문하기`}
          </button>
        </>
      )}
    </div>
  );
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '0.625rem 1.5rem',
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  cursor: 'pointer',
};
