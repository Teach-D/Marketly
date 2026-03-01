import { useState } from 'react';
import { useMyCoupons, useIssueCoupon } from '../api/coupon.api';
import Spinner from '../components/common/Spinner';
import type { UserCoupon } from '../types';

type TabType = 'my' | 'issue';

export default function CouponsPage() {
  const [tab, setTab] = useState<TabType>('my');
  const [couponId, setCouponId] = useState('');
  const { data: myCoupons, isLoading } = useMyCoupons();
  const { mutate: issue, isPending: isIssuing } = useIssueCoupon();

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const id = couponId.trim();
    if (!id) return;
    issue(id, { onSuccess: () => setCouponId('') });
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>쿠폰</h1>

      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
        {(['my', 'issue'] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: tab === t ? 700 : 400,
              color: tab === t ? '#3b82f6' : '#6b7280',
              borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {t === 'my' ? '내 쿠폰' : '쿠폰 발급'}
          </button>
        ))}
      </div>

      {tab === 'my' && (
        <>
          {isLoading ? (
            <Spinner />
          ) : !myCoupons?.length ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem 0' }}>보유한 쿠폰이 없습니다.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myCoupons.map((uc) => <CouponCard key={uc.id} userCoupon={uc} />)}
            </ul>
          )}
        </>
      )}

      {tab === 'issue' && (
        <div>
          <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>
            이벤트 페이지에서 받은 쿠폰 ID를 입력하면 선착순으로 발급됩니다.
          </p>
          <form onSubmit={handleIssue} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={couponId}
              onChange={(e) => setCouponId(e.target.value)}
              placeholder='쿠폰 ID를 입력하세요'
              style={inputStyle}
            />
            <button type='submit' disabled={isIssuing || !couponId.trim()} style={primaryBtn}>
              {isIssuing ? '발급 중...' : '발급받기'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function CouponCard({ userCoupon }: { userCoupon: UserCoupon }) {
  const { coupon } = userCoupon;
  const validUntil = new Date(coupon.validUntil).toLocaleDateString('ko-KR');
  const isExpired = new Date() > new Date(coupon.validUntil);

  return (
    <li style={{
      border: `2px dashed ${isExpired ? '#d1d5db' : '#3b82f6'}`,
      borderRadius: 10,
      padding: '1.25rem',
      background: isExpired ? '#f9fafb' : '#eff6ff',
      opacity: isExpired ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#1e40af' }}>{coupon.name}</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>
            {coupon.discountRate}% 할인
          </p>
        </div>
        {isExpired && (
          <span style={{ background: '#d1d5db', color: '#6b7280', borderRadius: 99, padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>
            만료
          </span>
        )}
      </div>
      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#6b7280', display: 'flex', gap: '1rem' }}>
        {coupon.minOrderAmount > 0 && <span>{coupon.minOrderAmount.toLocaleString()}원 이상 구매 시</span>}
        <span>~ {validUntil}까지</span>
      </div>
    </li>
  );
}

const inputStyle: React.CSSProperties = { flex: 1, padding: '0.625rem 1rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', outline: 'none' };
const primaryBtn: React.CSSProperties = { padding: '0.625rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' };
