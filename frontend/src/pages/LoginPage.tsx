import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../api/auth.api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(form, { onSuccess: () => navigate('/my') });
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>로그인</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type='email'
          placeholder='이메일'
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
          style={inputStyle}
        />
        <input
          type='password'
          placeholder='비밀번호'
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
          style={inputStyle}
        />
        {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>이메일 또는 비밀번호가 올바르지 않습니다.</p>}
        <button type='submit' disabled={isPending} style={buttonStyle}>
          {isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
        계정이 없으신가요? <Link to='/register'>회원가입</Link>
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.625rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '1rem',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.625rem',
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  cursor: 'pointer',
};
