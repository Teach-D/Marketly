import { useState } from 'react';
import { useProducts } from '../../api/product.api';
import { useCreateProduct, useUpdateProduct, useDeleteProduct, useAdjustStock } from '../../api/admin.api';
import ProductForm from '../../components/admin/ProductForm';
import Spinner from '../../components/common/Spinner';
import type { Product } from '../../types';

type FormMode = { type: 'create' } | { type: 'edit'; product: Product } | null;

export default function AdminProductsPage() {
  const [mode, setMode] = useState<FormMode>(null);
  const { data, isLoading } = useProducts({ limit: 100 });
  const { mutate: create, isPending: isCreating } = useCreateProduct();
  const { mutate: update, isPending: isUpdating } = useUpdateProduct();
  const { mutate: remove } = useDeleteProduct();
  const { mutate: adjustStock } = useAdjustStock();

  const handleSubmit = (dto: { name: string; description?: string; price: number; stock: number }) => {
    if (mode?.type === 'edit') {
      update({ id: mode.product.id, dto }, { onSuccess: () => setMode(null) });
    } else {
      create(dto, { onSuccess: () => setMode(null) });
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>상품 관리</h1>
        <button onClick={() => setMode({ type: 'create' })} style={primaryBtn}>+ 상품 등록</button>
      </div>

      {mode && (
        <ProductForm
          initial={mode.type === 'edit' ? mode.product : undefined}
          isPending={isCreating || isUpdating}
          onSubmit={handleSubmit}
          onCancel={() => setMode(null)}
        />
      )}

      <table style={tableStyle}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            {['상품명', '가격', '재고', '재고 조정', '액션'].map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.items.map((product) => (
            <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={tdStyle}>
                <p style={{ margin: 0, fontWeight: 600 }}>{product.name}</p>
                {product.description && <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{product.description}</p>}
              </td>
              <td style={tdStyle}>{product.price.toLocaleString()}원</td>
              <td style={tdStyle}>{product.stock}</td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <button onClick={() => adjustStock({ id: product.id, delta: -1 })} style={iconBtn}>−</button>
                  <button onClick={() => adjustStock({ id: product.id, delta: 1 })} style={iconBtn}>+</button>
                </div>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setMode({ type: 'edit', product })} style={editBtn}>수정</button>
                  <button onClick={() => confirm('삭제하시겠습니까?') && remove(product.id)} style={deleteBtn}>삭제</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' };
const thStyle: React.CSSProperties = { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#374151' };
const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem', fontSize: '0.9rem' };
const primaryBtn: React.CSSProperties = { padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem' };
const iconBtn: React.CSSProperties = { width: 28, height: 28, border: '1px solid #d1d5db', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: '1rem' };
const editBtn: React.CSSProperties = { padding: '0.25rem 0.625rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' };
const deleteBtn: React.CSSProperties = { padding: '0.25rem 0.625rem', background: '#fff', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' };
