import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import useStore from '../../store/useStore'

const META = {
  success: { icon: CheckCircle2, color: 'var(--accent-green)' },
  gold: { icon: Info, color: 'var(--accent-gold)' },
  danger: { icon: AlertTriangle, color: 'var(--accent-red)' },
  info: { icon: Info, color: 'var(--accent-cyan)' },
}

export default function Toaster() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)

  return (
    <div className="no-print pointer-events-none fixed left-1/2 top-20 z-[70] flex w-[min(92vw,360px)] -translate-x-1/2 flex-col gap-2 md:left-auto md:right-6 md:top-auto md:bottom-24 md:translate-x-0">
      {toasts.map((t) => {
        const m = META[t.kind] || META.info
        return (
          <div
            key={t.id}
            className="toast-in pointer-events-auto flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/95 px-4 py-3 shadow-xl backdrop-blur-md"
            style={{ borderColor: `${m.color}55` }}
          >
            <m.icon size={18} style={{ color: m.color }} />
            <span className="flex-1 text-sm text-[var(--text-primary)]">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
