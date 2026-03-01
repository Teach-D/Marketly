import { useState } from 'react';
import { useAdminCoupons, useCreateCoupon } from '../../api/coupon.api';
import Spinner from '../../components/common/Spinner';
import type { Coupon } from '../../types';

interface CouponFormState {
  name: string;
  discountRate: string;
  minOrderAmount: string;
  maxIssueCount: string;
  validFrom: string;
  validUntil: string;
}

const emptyForm: CouponFormState = {
  name: '',
  discountRate: '',
  minOrderAmount: '0',
  maxIssueCount: '',
  validFrom: '',
  validUntil: '',
};

export default function AdminCouponsPage() {
  const [form, setForm] = useState<CouponFormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: coupons, isLoading } = useAdminCoupons();
  const { mutate: create, isPending } = useCreateCoupon();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      {
        name: form.name,
        discountRate: Number(form.discountRate),
        minOrderAmount: Number(form.minOrderAmount),
        maxIssueCount: Number(form.maxIssueCount),
        validFrom: new Date(form.validFrom).toISOString(),
        validUntil: new Date(form.validUntil).toISOString(),
      },
      { onSuccess: () => { setForm(emptyForm); setShowForm(false); } },
    );
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>쿠폰 관리</h1>
        <button onClick={() => setShowForm((v) => !v)} style={primaryBtn}>
          {showForm ? '취소' : '+ 쿠폰 생성'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={formStyle}>
          <h3 style={{ margin: '0 0 1rem' }}>새 쿠폰 생성</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>쿠폰 이름</label>
              <input name='name' value={form.name} onChange={handleChange} required style={inputStyle} placeholder='여름 특가 10%' />
            </div>
            <div>
              <label style={labelStyle}>할인율 (%)</label>
              <input name='discountRate' type='number' min={1} max={100} value={form.discountRate} onChange={handleChange} required style={inputStyle} placeholder='10' />
            </div>
            <div>
              <label style={labelStyle}>최소 주문 금액 (원)</label>
              <input name='minOrderAmount' type='number' min={0} value={form.minOrderAmount} onChange={handleChange} required style={inputStyle} placeholder='30000' />
            </div>
            <div>
              <label style={labelStyle}>총 발급 수량</label>
              <input name='maxIssueCount' type='number' min={1} value={form.maxIssueCount} onChange={handleChange} required style={inputStyle} placeholder='100' />
            </div>
            <div>
              <label style={labelStyle}>유효 시작일</label>
              <input name='validFrom' type='datetime-local' value={form.validFrom} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>유효 만료일</label>
              <input name='validUntil' type='datetime-local' value={form.validUntil} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type='button' onClick={() => { setForm(emptyForm); setShowForm(false); }} style={cancelBtn}>취소</button>
            <button type='submit' disabled={isPending} style={primaryBtn}>{isPending ? '생성 중...' : '생성'}</button>
          </div>
        </form>
      )}

      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            {['쿠폰 이름', '할인율', '최소주문금액', '발급현황', '유효기간', '쿠폰 ID'].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!coupons?.length ? (
            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>생성된 쿠폰이 없습니다.</td></tr>
          ) : (
            coupons.map((coupon) => <CouponRow key={coupon.id} coupon={coupon} copiedId={copiedId} onCopy={handleCopyId} />)
          )}
        </tbody>
      </table>
    </div>
  );
}

function CouponRow({ coupon, copiedId, onCopy }: { coupon: Coupon; copiedId: string | null; onCopy: (id: string) => void }) {
  const isExpired = new Date() > new Date(coupon.validUntil);
  return (
    <tr style={{ borderBottom: '1px solid #e5e7eb', opacity: isExpired ? 0.5 : 1 }}>
      <td style={tdStyle}>
        <p style={{ margin: 0, fontWeight: 600 }}>{coupon.name}</p>
        {isExpired && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>만료됨</span>}
      </td>
      <td style={tdStyle}>{coupon.discountRate}%</td>
      <td style={tdStyle}>{coupon.minOrderAmount > 0 ? `${coupon.minOrderAmount.toLocaleString()}원` : '없음'}</td>
      <td style={tdStyle}>{coupon.issuedCount} / {coupon.maxIssueCount}</td>
      <td style={{ ...tdStyle, fontSize: '0.8rem' }}>
        <div>{new Date(coupon.validFrom).toLocaleDateString('ko-KR')}</div>
        <div>~ {new Date(coupon.validUntil).toLocaleDateString('ko-KR')}</div>
      </td>
      <td style={tdStyle}>
        <button onClick={() => onCopy(coupon.id)} style={copyBtn}>
          {copiedId === coupon.id ? '복사됨' : 'ID 복사'}
        </button>
      </td>
    </tr>
  );
}

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' };
const thStyle: React.CSSProperties = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#374151' };
const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
const primaryBtn: React.CSSProperties = { padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' };
const cancelBtn: React.CSSProperties = { padding: '0.5rem 1.25rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' };
const copyBtn: React.CSSProperties = { padding: '0.25rem 0.625rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' };
const formStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.5rem', marginBottom: '1.5rem' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
