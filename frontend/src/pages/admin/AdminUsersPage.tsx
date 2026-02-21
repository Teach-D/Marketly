import { useState } from 'react';
import { useAdminUsers } from '../../api/admin.api';
import Spinner from '../../components/common/Spinner';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers(page);

  if (isLoading) return <Spinner />;

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>회원 관리 ({data?.total ?? 0}명)</h1>

      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            {['이메일', '권한', '가입일'].map((h) => <th key={h} style={thStyle}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data?.items.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>
                <span style={{
                  padding: '0.125rem 0.5rem',
                  borderRadius: 99,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: user.role === 'ADMIN' ? '#fef3c7' : '#f3f4f6',
                  color: user.role === 'ADMIN' ? '#92400e' : '#374151',
                }}>
                  {user.role}
                </span>
              </td>
              <td style={{ ...tdStyle, color: '#6b7280', fontSize: '0.85rem' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>이전</button>
          <span style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageBtn}>다음</button>
        </div>
      )}
    </div>
  );
}

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' };
const thStyle: React.CSSProperties = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#374151' };
const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
const pageBtn: React.CSSProperties = { padding: '0.375rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: '0.875rem' };
