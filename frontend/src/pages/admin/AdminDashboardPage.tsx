import { useState } from 'react';
import { useStatsSummary, useDailyStats, useMonthlyStats } from '../../api/stats.api';
import BarChart from '../../components/admin/BarChart';
import Spinner from '../../components/common/Spinner';

type PeriodTab = 'daily' | 'monthly';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<PeriodTab>('daily');
  const { data: summary, isLoading: summaryLoading } = useStatsSummary();
  const { data: daily, isLoading: dailyLoading } = useDailyStats(30);
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyStats(12);

  const isChartLoading = tab === 'daily' ? dailyLoading : monthlyLoading;

  const revenueData = tab === 'daily'
    ? (daily ?? []).map((d) => ({ label: d.date, value: d.revenue }))
    : (monthly ?? []).map((m) => ({ label: m.month, value: m.revenue }));

  const orderData = tab === 'daily'
    ? (daily ?? []).map((d) => ({ label: d.date, value: d.orders }))
    : (monthly ?? []).map((m) => ({ label: m.month, value: m.orders }));

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>대시보드</h1>

      {summaryLoading ? <Spinner /> : summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <SummaryCard label='오늘 매출' value={`${summary.today.revenue.toLocaleString()}원`} sub={`이번달 ${summary.thisMonth.revenue.toLocaleString()}원`} color='#3b82f6' />
          <SummaryCard label='오늘 주문' value={`${summary.today.orders}건`} sub={`이번달 ${summary.thisMonth.orders}건`} color='#10b981' />
          <SummaryCard label='오늘 신규회원' value={`${summary.today.newUsers}명`} sub={`이번달 ${summary.thisMonth.newUsers}명`} color='#8b5cf6' />
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem' }}>매출 / 주문 추이</h2>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {(['daily', 'monthly'] as PeriodTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '0.25rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 99,
                  background: tab === t ? '#3b82f6' : '#fff',
                  color: tab === t ? '#fff' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: tab === t ? 600 : 400,
                }}
              >
                {t === 'daily' ? '최근 30일' : '최근 12개월'}
              </button>
            ))}
          </div>
        </div>

        {isChartLoading ? <Spinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>매출 (원)</p>
              <BarChart data={revenueData} color='#3b82f6' formatValue={(v) => `${(v / 10000).toFixed(0)}만`} />
            </div>
            <div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>주문 (건)</p>
              <BarChart data={orderData} color='#10b981' />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.25rem', borderLeft: `4px solid ${color}` }}>
      <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{value}</p>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>{sub}</p>
    </div>
  );
}
