import { createPortal } from 'react-dom'

// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <svg className="spin" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" strokeOpacity=".2" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ label, bg, color }) {
  return (
    <span className="badge" style={{ background: bg, color }}>
      {label}
    </span>
  )
}

// ── StatCard ───────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: color ? `${color}18` : 'var(--teal-light)', color: color || 'var(--teal)' }}>
          {icon}
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}>
          ↑ live
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif' }}>
          {value ?? '—'}
        </p>
        {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
    </div>
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────
export function Pagination({ current, total, onChange }) {
  if (total <= 1) return null
  const pages = Array.from({ length: Math.min(total, 7) }, (_, i) =>
    total <= 7 ? i : Math.max(0, Math.min(current - 3, total - 7)) + i
  )
  return (
    <div className="flex items-center gap-1.5 mt-5 justify-end">
      <button className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
        disabled={current === 0} onClick={() => onChange(current - 1)}>← Prev</button>
      {pages.map(page => (
        <button key={page}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={page === current
            ? { background: 'var(--teal)', color: '#fff' }
            : { background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          onClick={() => onChange(page)}>{page + 1}</button>
      ))}
      <button className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
        disabled={current >= total - 1} onClick={() => onChange(current + 1)}>Next →</button>
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────
// Uses React Portal → renders at <body> level, escapes any parent overflow/transform
// This fixes: backdrop-filter not blurring, white border, non-scrollable content
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Click outside overlay */}
      <div
        style={{ position: 'absolute', inset: 0 }}
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={`relative w-full ${width} fade-in`}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: 'none',
          outline: 'none',
          boxShadow: '0 32px 80px rgba(26, 107, 107, 0.22)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Teal header — stays fixed at top */}
        <div
          style={{
            background: 'var(--teal)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <h3 style={{
            color: '#fff',
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            fontSize: '1rem',
            margin: 0,
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>,
    document.body   // ← renders outside the page div entirely
  )
}

// ── ConfirmDialog ──────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  if (!open) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
      <div
        className="relative fade-in"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 24px 60px rgba(26,107,107,0.2)',
          padding: '1.5rem',
          width: '100%',
          maxWidth: '24rem',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: 'rgba(224,90,90,0.1)', color: 'var(--danger)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, margin: '0 auto 1rem',
        }}>⚠</div>
        <h3 style={{
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700, fontSize: '1rem',
          color: 'var(--text-primary)', marginBottom: 8,
        }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn-secondary px-6" onClick={onClose}>Cancel</button>
          <button className="btn-danger px-6" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Table ──────────────────────────────────────────────────────────────────
export function Table({ headers, children, loading, empty }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--teal-light)', borderBottom: '1px solid var(--border)' }}>
              {headers.map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--teal-deep)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={headers.length} className="text-center py-16">
                  <div className="flex justify-center" style={{ color: 'var(--teal)' }}>
                    <Spinner size={24} />
                  </div>
                </td></tr>
              : children}
          </tbody>
        </table>
        {!loading && empty && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3" style={{ color: 'var(--teal-mid)', opacity: 0.3 }}>◎</div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No records found</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── EmptyState ─────────────────────────────────────────────────────────────
export function EmptyState({ icon = '◎', title = 'Nothing here yet', message }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4" style={{ color: 'var(--teal-mid)', opacity: 0.35 }}>{icon}</div>
      <p className="font-semibold mb-1"
        style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display, serif' }}>{title}</p>
      {message && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>}
    </div>
  )
}

// ── FormField ──────────────────────────────────────────────────────────────
export function FormField({ label, children, hint }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  )
}