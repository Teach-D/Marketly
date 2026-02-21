import { useToastStore } from '../../store/toast.store';

const borderColor = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };

export default function Toast() {
  const { toasts, remove } = useToastStore();

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 9999 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          style={{
            padding: '0.75rem 1.25rem',
            background: '#fff',
            borderLeft: `4px solid ${borderColor[t.type]}`,
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            minWidth: 260,
            fontSize: '0.9rem',
            color: '#1f2937',
            animation: 'fadein 0.2s ease',
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
