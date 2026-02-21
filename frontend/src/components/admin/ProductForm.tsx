import { useState } from 'react';
import type { Product } from '../../types';

interface Props {
  initial?: Product;
  isPending: boolean;
  onSubmit: (data: { name: string; description?: string; price: number; stock: number }) => void;
  onCancel: () => void;
}

export default function ProductForm({ initial, isPending, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? ''));
  const [stock, setStock] = useState(String(initial?.stock ?? ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      price: Number(price),
      stock: Number(stock),
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem' }}>{initial ? '상품 수정' : '상품 등록'}</h3>
      <div style={rowStyle}>
        <label style={labelStyle}>상품명</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      </div>
      <div style={rowStyle}>
        <label style={labelStyle}>설명</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ ...rowStyle, flex: 1 }}>
          <label style={labelStyle}>가격 (원)</label>
          <input required type='number' min={0} value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ ...rowStyle, flex: 1 }}>
          <label style={labelStyle}>재고</label>
          <input required type='number' min={0} value={stock} onChange={(e) => setStock(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button type='submit' disabled={isPending} style={primaryBtn}>
          {isPending ? '저장 중...' : '저장'}
        </button>
        <button type='button' onClick={onCancel} style={cancelBtn}>취소</button>
      </div>
    </form>
  );
}

const rowStyle: React.CSSProperties = { marginBottom: '0.75rem' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
const primaryBtn: React.CSSProperties = { padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' };
const cancelBtn: React.CSSProperties = { padding: '0.5rem 1.25rem', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' };
