import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../api/product.api';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get('q') ?? '');
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  const query = searchParams.get('q') ?? '';
  const { data, isLoading } = useProducts({ search: query, page, limit: LIMIT });

  useEffect(() => {
    setInput(searchParams.get('q') ?? '');
    setPage(1);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const trimmed = input.trim();
    trimmed ? setSearchParams({ q: trimmed }) : setSearchParams({});
  };

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>
          상품 목록
          {query && <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 400, marginLeft: '0.75rem' }}>"{query}" 검색 결과</span>}
        </h1>
        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{data?.total ?? 0}개</span>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='상품명 검색'
          style={{ flex: 1, padding: '0.625rem 1rem', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.95rem', background: '#f9fafb', outline: 'none' }}
        />
        <button type='submit' style={btnStyle}>검색</button>
        {query && <button type='button' onClick={() => { setInput(''); setSearchParams({}); }} style={{ ...btnStyle, background: '#6b7280' }}>초기화</button>}
      </form>

      {isLoading ? (
        <Spinner />
      ) : data?.items.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '4rem 0' }}>검색 결과가 없습니다.</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.5rem' }}>
            {data?.items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={btnStyle}>이전</button>
              <span style={{ alignSelf: 'center', fontSize: '0.9rem', color: '#374151' }}>{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={btnStyle}>다음</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = { padding: '0.625rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 };
