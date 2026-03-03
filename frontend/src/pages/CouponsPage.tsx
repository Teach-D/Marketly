import { useEffect, useState } from 'react';
import { useCouponEvents, useIssueCoupon, useMyCoupons } from '../api/coupon.api';
import Spinner from '../components/common/Spinner';
import type { CouponEvent, UserCoupon } from '../types';
import { useAuthStore } from '../store/auth.store';

type TabType = 'events' | 'my';

export default function CouponsPage() {
  const [tab, setTab] = useState<TabType>('events');
  const { user } = useAuthStore();
  const { data: events, isLoading: eventsLoading } = useCouponEvents();
  const { data: myCoupons, isLoading: myLoading } = useMyCoupons();
  const { mutate: issue, isPending: isIssuing, variables: issuingId } = useIssueCoupon();

  const isLoading = tab === 'events' ? eventsLoading : myLoading;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>쿠폰</h1>

      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
        {(['events', 'my'] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.5rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: tab === t ? 700 : 400,
              color: tab === t ? '#3b82f6' : '#6b7280',
              borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {t === 'events' ? '쿠폰 이벤트' : `내 쿠폰${myCoupons?.length ? ` (${myCoupons.length})` : ''}`}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : (
        <>
          {tab === 'events' && (
            <>
              {!events?.length ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem 0' }}>진행 중인 쿠폰 이벤트가 없습니다.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isLoggedIn={!!user}
                      isIssuing={isIssuing && issuingId === event.id}
                      onIssue={() => issue(event.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'my' && (
            <>
              {!myCoupons?.length ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem 0' }}>보유한 쿠폰이 없습니다.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {myCoupons.map((uc) => <MyCouponCard key={uc.id} userCoupon={uc} />)}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event, isLoggedIn, isIssuing, onIssue }: {
  event: CouponEvent;
  isLoggedIn: boolean;
  isIssuing: boolean;
  onIssue: () => void;
}) {
  const countdown = useCountdown(event.openAt);
  const remaining = event.maxIssueCount - event.issuedCount;
  const progressPct = Math.round((event.issuedCount / event.maxIssueCount) * 100);

  const statusConfig = {
    upcoming: { label: '오픈 예정', bg: '#fef3c7', border: '#fbbf24', badge: '#92400e', badgeBg: '#fef3c7' },
    open: { label: '발급 중', bg: '#eff6ff', border: '#3b82f6', badge: '#1e40af', badgeBg: '#dbeafe' },
    sold_out: { label: '마감', bg: '#f9fafb', border: '#d1d5db', badge: '#6b7280', badgeBg: '#f3f4f6' },
  }[event.status];

  return (
    <div style={{ border: `2px solid ${statusConfig.border}`, borderRadius: 12, padding: '1.5rem', background: statusConfig.bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: statusConfig.badgeBg, color: statusConfig.badge, borderRadius: 99, padding: '0.15rem 0.6rem', marginBottom: '0.4rem', display: 'inline-block' }}>
            {statusConfig.label}
          </span>
          <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.1rem', fontWeight: 700 }}>{event.name}</h3>
        </div>
        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>{event.discountRate}%</p>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {event.minOrderAmount > 0 && <span>{event.minOrderAmount.toLocaleString()}원 이상 구매 시</span>}
        <span>유효기간 ~ {new Date(event.validUntil).toLocaleDateString('ko-KR')}</span>
      </div>

      {event.status === 'upcoming' && countdown && (
        <div style={{ background: '#fffbeb', borderRadius: 8, padding: '0.625rem 1rem', marginBottom: '0.75rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e' }}>오픈까지</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#b45309', fontVariantNumeric: 'tabular-nums' }}>{countdown}</p>
        </div>
      )}

      {event.status !== 'upcoming' && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            <span>발급 현황</span>
            <span>{event.issuedCount} / {event.maxIssueCount} ({remaining > 0 ? `${remaining}개 남음` : '소진'})</span>
          </div>
          <div style={{ height: 6, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: event.status === 'sold_out' ? '#d1d5db' : '#3b82f6', borderRadius: 99, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      <button
        onClick={onIssue}
        disabled={event.status !== 'open' || isIssuing || !isLoggedIn}
        style={{
          width: '100%', padding: '0.75rem', border: 'none', borderRadius: 8, fontWeight: 700,
          fontSize: '1rem', cursor: event.status === 'open' && isLoggedIn ? 'pointer' : 'default',
          background: event.status === 'open' && isLoggedIn ? '#3b82f6' : '#e5e7eb',
          color: event.status === 'open' && isLoggedIn ? '#fff' : '#9ca3af',
          transition: 'background 0.2s',
        }}
      >
        {!isLoggedIn ? '로그인 후 발급 가능' : isIssuing ? '발급 중...' : event.status === 'upcoming' ? '오픈 대기 중' : event.status === 'sold_out' ? '마감되었습니다' : '발급받기'}
      </button>
    </div>
  );
}

function MyCouponCard({ userCoupon }: { userCoupon: UserCoupon }) {
  const { coupon } = userCoupon;
  const validUntil = new Date(coupon.validUntil).toLocaleDateString('ko-KR');
  const isExpired = new Date() > new Date(coupon.validUntil);

  return (
    <li style={{ border: `2px dashed ${isExpired ? '#d1d5db' : '#3b82f6'}`, borderRadius: 10, padding: '1.25rem', background: isExpired ? '#f9fafb' : '#eff6ff', opacity: isExpired ? 0.6 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#1e40af' }}>{coupon.name}</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{coupon.discountRate}% 할인</p>
        </div>
        {isExpired && <span style={{ background: '#d1d5db', color: '#6b7280', borderRadius: 99, padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>만료</span>}
      </div>
      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#6b7280', display: 'flex', gap: '1rem' }}>
        {coupon.minOrderAmount > 0 && <span>{coupon.minOrderAmount.toLocaleString()}원 이상 구매 시</span>}
        <span>~ {validUntil}까지</span>
      </div>
    </li>
  );
}

function useCountdown(targetDate: string): string {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setRemaining(''); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setRemaining(`${h > 0 ? `${h}시간 ` : ''}${m}분 ${s}초`);
    };
    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  return remaining;
}
