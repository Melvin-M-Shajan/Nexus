import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  MonitorPlay,
  FolderGit2,
  GraduationCap,
  FileText,
  ExternalLink,
  Check,
  Clock,
} from 'lucide-react'
import PageHeader from '../ui/PageHeader'
import GlassCard from '../ui/GlassCard'
import StatusBadge from '../ui/StatusBadge'
import ProgressRing from '../ui/ProgressRing'
import useProgress from '../../hooks/useProgress'
import useStore from '../../store/useStore'
import { useAI } from '../ui/AIContext'

const typeIcon = (t) => ({ video: MonitorPlay, github: FolderGit2, course: GraduationCap, docs: FileText }[t] || BookOpen)
const TYPES = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Videos' },
  { id: 'course', label: 'Courses' },
  { id: 'github', label: 'Repos' },
  { id: 'docs', label: 'Docs' },
]

export default function ResourceDeepDive() {
  const { phases, pathData } = useProgress()
  const toggleResource = useStore((s) => s.toggleResource)
  const data = useStore((s) => s.data[s.currentPath])
  const { setSection } = useAI()
  const [filter, setFilter] = useState('all')

  useEffect(() => setSection('roadmap'), [setSection])

  const { totalHours, learnedHours, totalCount, learnedCount } = useMemo(() => {
    let totalHours = 0
    let learnedHours = 0
    let totalCount = 0
    let learnedCount = 0
    phases.forEach((p) => {
      p.resources.forEach((r, i) => {
        totalHours += r.hours
        totalCount += 1
        if (data.resourceCompletion[p.id]?.[i]) {
          learnedHours += r.hours
          learnedCount += 1
        }
      })
    })
    return { totalHours, learnedHours, totalCount, learnedCount }
  }, [phases, data.resourceCompletion])

  const progress = totalCount ? learnedCount / totalCount : 0

  return (
    <div className="section-in">
      <PageHeader
        icon={BookOpen}
        title="Resources"
        subtitle={`${pathData.label} · every resource, in one place`}
        right={<ProgressRing progress={progress} size={72} stroke={7} label={`${learnedCount}/${totalCount}`} sublabel="learned" />}
      />

      {/* summary */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total resources" value={totalCount} />
        <Stat label="Learned" value={learnedCount} color="var(--accent-green)" />
        <Stat label="Total hours" value={`${totalHours}h`} />
        <Stat label="Hours done" value={`${learnedHours}h`} color="var(--accent-cyan)" />
      </div>

      {/* filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === t.id
                ? 'bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)]'
                : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {phases.map((phase) => {
          const items = phase.resources
            .map((r, i) => ({ r, i }))
            .filter(({ r }) => filter === 'all' || r.type === filter)
          if (!items.length) return null
          return (
            <GlassCard key={phase.id} className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md font-mono text-[11px] font-bold" style={{ background: `${phase.color}22`, color: phase.color }}>
                  {phase.number}
                </span>
                <h3 className="font-semibold text-[var(--text-primary)]">{phase.title}</h3>
              </div>
              <ul className="space-y-2">
                {items.map(({ r, i }) => {
                  const Icon = typeIcon(r.type)
                  const done = !!data.resourceCompletion[phase.id]?.[i]
                  return (
                    <li key={r.name} className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-white/[0.02] p-2.5">
                      <button
                        onClick={() => toggleResource(phase.id, i, phase.resources.length)}
                        className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border"
                        style={{ borderColor: done ? phase.color : 'var(--border-subtle)', background: done ? phase.color : 'transparent' }}
                      >
                        {done && <Check size={13} className="text-[#02060d]" />}
                      </button>
                      <Icon size={16} className="mt-0.5 shrink-0 text-[var(--text-secondary)]" />
                      <div className="min-w-0 flex-1">
                        <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-cyan)]">
                          {r.name} <ExternalLink size={12} className="opacity-60" />
                        </a>
                        <div className="text-xs text-[var(--text-secondary)]">{r.creator}</div>
                        {r.watchNote && <div className="mt-0.5 text-xs text-[var(--accent-gold)]">⚠ {r.watchNote}</div>}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 font-mono text-xs text-[var(--text-secondary)]">
                          <Clock size={11} /> {r.hours}h
                        </span>
                        {r.watchAll ? <StatusBadge variant="complete">Full</StatusBadge> : <StatusBadge variant="gold">Partial</StatusBadge>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, color = 'var(--text-primary)' }) {
  return (
    <GlassCard className="p-4">
      <div className="font-mono text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">{label}</div>
    </GlassCard>
  )
}
