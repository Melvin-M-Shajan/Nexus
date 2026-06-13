// Small pill badge with color variants.
const VARIANTS = {
  active: { bg: 'rgba(0,212,255,0.12)', color: '#00D4FF', border: 'rgba(0,212,255,0.4)' },
  complete: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', border: 'rgba(16,185,129,0.4)' },
  locked: { bg: 'rgba(122,156,192,0.1)', color: '#7A9CC0', border: 'rgba(122,156,192,0.25)' },
  gold: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: 'rgba(245,158,11,0.4)' },
  red: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', border: 'rgba(239,68,68,0.4)' },
  purple: { bg: 'rgba(124,58,237,0.14)', color: '#a78bfa', border: 'rgba(124,58,237,0.4)' },
  neutral: { bg: 'rgba(255,255,255,0.05)', color: '#7A9CC0', border: 'rgba(255,255,255,0.1)' },
}

export default function StatusBadge({ variant = 'neutral', children, className = '', style }) {
  const v = VARIANTS[variant] || VARIANTS.neutral
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${className}`}
      style={{ background: v.bg, color: v.color, border: `1px solid ${v.border}`, ...style }}
    >
      {children}
    </span>
  )
}
