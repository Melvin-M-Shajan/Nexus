import { useEffect, useMemo } from 'react'
import { Clock, Flag } from 'lucide-react'
import PageHeader from '../ui/PageHeader'
import GlassCard from '../ui/GlassCard'
import useProgress from '../../hooks/useProgress'
import useStore from '../../store/useStore'
import { useAI } from '../ui/AIContext'

const PHASE_WEEKS_2H = { phase1: 3.5, phase2: 4.5, phase3: 11, phase4a: 7, phase4b: 4.5, phase5: 3.5 }
const DAY = 86400000

export default function Timeline() {
  const { phases } = useProgress()
  const settings = useStore((s) => s.settings)
  const setSettings = useStore((s) => s.setSettings)
  const { setSection } = useAI()

  useEffect(() => setSection('timeline'), [setSection])

  const hoursPerDay = settings.hoursPerDay || 2
  const startDate = useMemo(() => new Date(settings.startDate || '2026-01-01'), [settings.startDate])

  const schedule = useMemo(() => {
    let cursor = new Date(startDate)
    const rows = phases.map((p) => {
      const weeks = (PHASE_WEEKS_2H[p.id] || 4) * (2 / hoursPerDay)
      const start = new Date(cursor)
      const end = new Date(cursor.getTime() + weeks * 7 * DAY)
      cursor = end
      return { ...p, start, end, weeks }
    })
    const total = cursor.getTime() - startDate.getTime()
    return { rows, end: cursor, totalMs: total }
  }, [phases, hoursPerDay, startDate])

  const { rows, end, totalMs } = schedule
  const pct = (d) => ((d.getTime() - startDate.getTime()) / totalMs) * 100
  const today = new Date()
  const todayPct = today >= startDate && today <= end ? pct(today) : null

  // month labels
  const months = useMemo(() => {
    const out = []
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    while (d <= end) {
      out.push({ label: d.toLocaleString('en', { month: 'short' }), left: pct(d) })
      d.setMonth(d.getMonth() + 1)
    }
    return out
  }, [startDate, end, totalMs])

  const fmt = (d) => d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

  const milestones = [
    { label: 'Phase 3 Complete', date: rows.find((r) => r.id === 'phase3')?.end, color: '#00D4FF' },
    { label: 'First Deployed Project', date: rows.find((r) => r.id === 'phase5')?.start, color: '#10B981' },
    { label: 'JOB READY 🎉', date: end, color: '#F59E0B' },
  ]

  return (
    <div className="section-in">
      <PageHeader icon={Clock} title="Timeline" subtitle="Plan your journey from day one to job-ready" />

      {/* controls */}
      <GlassCard className="mb-5 p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">Start date</label>
            <input
              type="date"
              value={settings.startDate}
              onChange={(e) => setSettings({ startDate: e.target.value })}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)] [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
              Pace: <span className="text-[var(--accent-cyan)]">{hoursPerDay}h / day</span>
            </label>
            <div className="mb-2 flex gap-2">
              {[2, 4].map((h) => (
                <button
                  key={h}
                  onClick={() => setSettings({ hoursPerDay: h })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    hoursPerDay === h ? 'bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)]' : 'border border-[var(--border-subtle)] text-[var(--text-secondary)]'
                  }`}
                >
                  {h}h/day
                </button>
              ))}
            </div>
            <input type="range" min="1" max="8" step="0.5" value={hoursPerDay} onChange={(e) => setSettings({ hoursPerDay: Number(e.target.value) })} className="w-full" />
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Job-ready by <span className="font-mono font-bold text-[var(--accent-gold)]">{fmt(end)}</span> ·{' '}
          <span className="font-mono">{Math.round(totalMs / DAY / 7)}</span> weeks total
        </p>
      </GlassCard>

      {/* gantt */}
      <GlassCard className="overflow-hidden p-5">
        <div className="scrollbar-hide overflow-x-auto">
        <div className="min-w-[520px]">
        {/* month axis */}
        <div className="mb-3 flex gap-3">
          <div className="w-[100px] shrink-0" />
          <div className="relative h-5 flex-1 border-b border-[var(--border-subtle)]">
            {months.map((m, i) => (
              <span key={i} className="absolute -translate-x-1/2 font-mono text-[10px] text-[var(--text-secondary)]" style={{ left: `${m.left}%` }}>
                {m.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {/* labels */}
          <div className="w-[100px] shrink-0 space-y-2.5">
            {rows.map((r) => (
              <div key={r.id} className="flex h-7 items-center justify-end truncate text-xs font-medium text-[var(--text-secondary)]">
                {r.title}
              </div>
            ))}
          </div>

          {/* tracks */}
          <div className="relative flex-1 space-y-2.5">
            {todayPct != null && (
              <div className="pointer-events-none absolute bottom-0 top-0 z-10" style={{ left: `${todayPct}%` }}>
                <div className="h-full w-[2px] bg-[var(--accent-red)]" style={{ boxShadow: '0 0 8px var(--accent-red)' }} />
                <span className="absolute -top-4 -translate-x-1/2 text-[9px] font-bold text-[var(--accent-red)]">TODAY</span>
              </div>
            )}
            {rows.map((r) => (
              <div key={r.id} className="relative h-7 rounded-md bg-white/[0.03]">
                <div
                  className="absolute top-0 flex h-full items-center rounded-md px-2 transition-all"
                  style={{
                    left: `${pct(r.start)}%`,
                    width: `${Math.max(4, pct(r.end) - pct(r.start))}%`,
                    background: `linear-gradient(90deg, ${r.color}cc, ${r.color}77)`,
                    boxShadow: `0 0 10px ${r.color}55`,
                  }}
                  title={`${fmt(r.start)} → ${fmt(r.end)}`}
                >
                  <span className="truncate text-[10px] font-bold text-[#02060d]">{r.weeks.toFixed(1)}w</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
        </div>
      </GlassCard>

      {/* milestones */}
      <GlassCard className="mt-5 p-5">
        <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          <Flag size={14} /> Milestones
        </p>
        <ul className="space-y-3">
          {milestones.map((m) => (
            <li key={m.label} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
              <span className="flex-1 text-sm text-[var(--text-primary)]/90">{m.label}</span>
              <span className="font-mono text-xs text-[var(--text-secondary)]">{m.date ? fmt(m.date) : '—'}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  )
}
