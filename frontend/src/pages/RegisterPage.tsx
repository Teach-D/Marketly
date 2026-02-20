import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../api/auth.api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: register, isPending, error } = useRegister();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setValidationError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setValidationError('');
    register(
      { email: form.email, password: form.password },
      { onSuccess: () => navigate('/login') },
    );
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>회원가입</h1>
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
          placeholder='비밀번호 (8자 이상)'
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          minLength={8}
          required
          style={inputStyle}
        />
        <input
          type='password'
          placeholder='비밀번호 확인'
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          required
          style={inputStyle}
        />
        {validationError && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{validationError}</p>}
        {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>이미 사용 중인 이메일입니다.</p>}
        <button type='submit' disabled={isPending} style={buttonStyle}>
          {isPending ? '처리 중...' : '회원가입'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
        이미 계정이 있으신가요? <Link to='/login'>로그인</Link>
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
