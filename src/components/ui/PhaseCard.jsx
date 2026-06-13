import { useState } from 'react'
import {
  MonitorPlay,
  FolderGit2,
  GraduationCap,
  FileText,
  BookOpen,
  ExternalLink,
  Check,
  NotebookPen,
  Bot,
  CircleCheck,
  Clock,
  Star,
  Users,
} from 'lucide-react'
import GlassCard from './GlassCard'
import StatusBadge from './StatusBadge'
import MagneticButton from './MagneticButton'
import useStore from '../../store/useStore'

const typeIcon = (type) => {
  switch (type) {
    case 'video':
      return MonitorPlay
    case 'github':
      return FolderGit2
    case 'course':
      return GraduationCap
    case 'docs':
      return FileText
    default:
      return BookOpen
  }
}

export default function PhaseCard({ phase, index = 0, onAskAI }) {
  const data = useStore((s) => s.data[s.currentPath])
  const toggleResource = useStore((s) => s.toggleResource)
  const toggleProject = useStore((s) => s.toggleProject)
  const markPhaseComplete = useStore((s) => s.markPhaseComplete)
  const setNote = useStore((s) => s.setNote)

  const [notesOpen, setNotesOpen] = useState(false)

  const resDone = data.resourceCompletion[phase.id] || []
  const projDone = data.projectCompletion[phase.id] || []
  const progress = phase.progress ?? 0
  const isComplete = progress >= 1 || phase.complete
  const isActive = progress > 0 && progress < 1
  const pct = Math.round(progress * 100)

  return (
    <GlassCard
      className={`phase-card fade-up overflow-visible ${isActive ? 'glow-pulse' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* left accent bar that fills by completion */}
      <div className="absolute left-0 top-0 bottom-0 w-1 overflow-hidden rounded-l-2xl bg-white/5">
        <div
          className="absolute bottom-0 left-0 w-full transition-all duration-700"
          style={{ height: `${pct}%`, background: phase.color, boxShadow: `0 0 12px ${phase.color}` }}
        />
      </div>

      <div className="p-5 sm:p-6">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="grid h-7 w-7 place-items-center rounded-md font-mono text-xs font-bold"
                style={{ background: `${phase.color}22`, color: phase.color, border: `1px solid ${phase.color}55` }}
              >
                {phase.number}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                Phase {phase.number}
              </span>
              {isComplete ? (
                <StatusBadge variant="complete">Complete</StatusBadge>
              ) : isActive ? (
                <StatusBadge variant="active">Active</StatusBadge>
              ) : (
                <StatusBadge variant="locked">Not started</StatusBadge>
              )}
            </div>
            <h3 className="mt-2 text-xl font-bold text-[var(--text-primary)]">{phase.title}</h3>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{phase.tagline}</p>
          </div>

          {/* progress bar */}
          <div className="flex min-w-[140px] flex-col items-end gap-1">
            <span className="font-mono text-lg font-bold" style={{ color: phase.color }}>
              {pct}%
            </span>
            <div className="h-2 w-36 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: phase.color, boxShadow: `0 0 10px ${phase.color}` }}
              />
            </div>
          </div>
        </div>

        {/* duration line */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1">
            <Clock size={13} /> {phase.duration.slow} (2h/day)
          </span>
          <span className="hidden sm:inline">·</span>
          <span>{phase.duration.fast} (4h/day)</span>
          <span className="hidden sm:inline">·</span>
          <StatusBadge variant={phase.cost === 'FREE' ? 'complete' : 'gold'}>{phase.cost}</StatusBadge>
        </div>

        <div className="hr-glow my-4" />

        {/* resources */}
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Resources
          </p>
          <ul className="space-y-2">
            {phase.resources.map((r, i) => {
              const Icon = typeIcon(r.type)
              const done = !!resDone[i]
              return (
                <li
                  key={r.name}
                  className="group flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-white/[0.02] p-2.5 transition-colors hover:border-[var(--border-glow)]"
                >
                  <button
                    onClick={() => toggleResource(phase.id, i, phase.resources.length)}
                    aria-label={done ? 'Mark resource not learned' : 'Mark resource learned'}
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all"
                    style={{
                      borderColor: done ? phase.color : 'var(--border-subtle)',
                      background: done ? phase.color : 'transparent',
                    }}
                  >
                    {done && <Check size={13} className="text-[#02060d]" />}
                  </button>
                  <Icon size={16} className="mt-0.5 shrink-0 text-[var(--text-secondary)]" />
                  <div className="min-w-0 flex-1">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-cyan)]"
                    >
                      {r.name} <ExternalLink size={12} className="opacity-60" />
                    </a>
                    <div className="text-xs text-[var(--text-secondary)]">{r.creator}</div>
                    {r.watchNote && <div className="mt-0.5 text-xs text-[var(--accent-gold)]">⚠ {r.watchNote}</div>}
                    {(r.rating || r.students || r.price) && (
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-secondary)]">
                        {r.rating && (
                          <span className="inline-flex items-center gap-1">
                            <Star size={11} className="text-[var(--accent-gold)]" /> {r.rating}
                          </span>
                        )}
                        {r.students && (
                          <span className="inline-flex items-center gap-1">
                            <Users size={11} /> {r.students}
                          </span>
                        )}
                        {r.price && <span className="font-mono text-[var(--accent-gold)]">{r.price}</span>}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-xs text-[var(--text-secondary)]">{r.hours}h</div>
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: done ? phase.color : 'var(--text-dim)' }}>
                      {done ? 'Learned' : 'Learn'}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* must learn / skip */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent-green)]">
              Must Learn ✅
            </p>
            <ul className="space-y-1">
              {phase.mustLearn.map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm text-[var(--text-primary)]/90">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent-green)]" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent-red)]">Skip 🚫</p>
            <ul className="space-y-1">
              {phase.skip.map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm text-[var(--text-secondary)] line-through decoration-[var(--accent-red)]/40">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent-red)]" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* projects */}
        <div className="mt-4">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Projects to build (tick when done)
          </p>
          <ul className="space-y-1.5">
            {phase.projects.map((p, i) => {
              const done = !!projDone[i]
              return (
                <li key={p.name}>
                  <button
                    onClick={() => toggleProject(phase.id, i, phase.projects.length)}
                    className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all"
                      style={{
                        borderColor: done ? phase.color : 'var(--border-subtle)',
                        background: done ? phase.color : 'transparent',
                      }}
                    >
                      {done && <Check size={13} className="text-[#02060d]" />}
                    </span>
                    <span className={`text-sm ${done ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>
                      {p.name}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* notes */}
        {notesOpen && (
          <div className="mt-4 section-in">
            <textarea
              value={data.notes[phase.id] || ''}
              onChange={(e) => setNote(phase.id, e.target.value)}
              placeholder="Your notes for this phase…"
              className="h-28 w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]"
            />
          </div>
        )}

        {/* actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          <MagneticButton
            onClick={() => markPhaseComplete(phase)}
            disabled={isComplete}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
            style={{ background: `${phase.color}22`, color: phase.color, border: `1px solid ${phase.color}55` }}
          >
            <CircleCheck size={14} /> {isComplete ? 'Phase Complete' : 'Mark Phase Complete'}
          </MagneticButton>
          <MagneticButton
            onClick={() => onAskAI?.(phase)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-glow)] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent-cyan)]"
          >
            <Bot size={14} /> Ask AI for Help
          </MagneticButton>
          <MagneticButton
            onClick={() => setNotesOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <NotebookPen size={14} /> Notes
          </MagneticButton>
        </div>
      </div>
    </GlassCard>
  )
}
