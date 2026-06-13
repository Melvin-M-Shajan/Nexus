import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Target, ChevronDown, Check, RotateCw, Bot, BookMarked, AlertCircle, MapPin } from 'lucide-react'
import PageHeader from '../ui/PageHeader'
import GlassCard from '../ui/GlassCard'
import StatusBadge from '../ui/StatusBadge'
import useStore from '../../store/useStore'
import { useAI } from '../ui/AIContext'
import { interviewCategories, PHASE_LABELS } from '../../data/sharedData'

export default function InterviewPrep() {
  const location = useLocation()
  const data = useStore((s) => s.data[s.currentPath])
  const setInterviewStatus = useStore((s) => s.setInterviewStatus)
  const { setSection, openAI } = useAI()

  const [activeCat, setActiveCat] = useState(location.state?.category || interviewCategories[0].id)
  const [open, setOpen] = useState({})

  useEffect(() => setSection('interview'), [setSection])
  useEffect(() => {
    if (location.state?.category) setActiveCat(location.state.category)
  }, [location.state])

  const category = interviewCategories.find((c) => c.id === activeCat) || interviewCategories[0]

  const catProgress = (cat) => {
    const total = cat.questions.length
    const confident = cat.questions.filter((q) => data.interviewStatus[q.id] === 'confident').length
    return { total, confident, pct: total ? confident / total : 0 }
  }

  const askGemini = (q) => {
    openAI({
      section: 'interview',
      context: `Interview question: ${q.q}\nReference answer: ${q.a}`,
      prompt: `Explain this interview answer better with a concrete example, then quiz me with a harder follow-up:\n"${q.q}"`,
    })
  }

  return (
    <div className="section-in">
      <PageHeader icon={Target} title="Interview Prep" subtitle="The questions that actually get asked for AI Engineer roles" accent="#7C3AED" />

      {/* tabs */}
      <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1">
        {interviewCategories.map((c) => {
          const { confident, total } = catProgress(c)
          const active = c.id === activeCat
          return (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-[var(--accent-purple)]/50 bg-[var(--accent-purple)]/12 text-[var(--text-primary)]'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {c.name}
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
                {confident}/{total}
              </span>
            </button>
          )
        })}
      </div>

      {/* category progress bar */}
      <div className="mb-5">
        <div className="mb-1 flex justify-between text-xs text-[var(--text-secondary)]">
          <span>{category.name}</span>
          <span className="font-mono">{Math.round(catProgress(category).pct * 100)}% confident</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-[var(--accent-purple)] transition-all duration-500" style={{ width: `${catProgress(category).pct * 100}%` }} />
        </div>
      </div>

      {/* questions */}
      <div className="space-y-3">
        {category.questions.map((q) => {
          const status = data.interviewStatus[q.id] || 'unseen'
          const isOpen = !!open[q.id]
          return (
            <GlassCard key={q.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--accent-gold)' }}>
                    {'★'.repeat(q.stars)}
                    <span className="text-[var(--text-dim)]">{'★'.repeat(5 - q.stars)}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Frequency: {q.frequency}</span>
                </div>
                {status === 'confident' && <StatusBadge variant="complete">Confident</StatusBadge>}
                {status === 'reviewing' && <StatusBadge variant="gold">Reviewing</StatusBadge>}
              </div>

              <p className="mt-2 font-semibold text-[var(--text-primary)]">{q.q}</p>

              <button
                onClick={() => setOpen((o) => ({ ...o, [q.id]: !o[q.id] }))}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-glow)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-cyan)] hover:bg-white/5"
              >
                {isOpen ? 'Hide answer' : 'Show answer'}
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="section-in mt-3 space-y-3">
                  <p className="rounded-xl border border-[var(--border-subtle)] bg-white/[0.02] p-4 text-sm leading-relaxed text-[var(--text-primary)]/90">{q.a}</p>
                  <div className="grid gap-2 text-xs sm:grid-cols-3">
                    <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                      <BookMarked size={14} className="mt-0.5 shrink-0 text-[var(--accent-cyan)]" /> <span>Study: {q.study}</span>
                    </div>
                    <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                      <AlertCircle size={14} className="mt-0.5 shrink-0 text-[var(--accent-red)]" /> <span>Where beginners fail: {q.fail}</span>
                    </div>
                    <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--accent-gold)]" /> <span>Taught in: {PHASE_LABELS[q.phase] || q.phase}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setInterviewStatus(q.id, status === 'confident' ? 'unseen' : 'confident')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                    status === 'confident'
                      ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]'
                      : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Check size={14} /> I know this
                </button>
                <button
                  onClick={() => setInterviewStatus(q.id, status === 'reviewing' ? 'unseen' : 'reviewing')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                    status === 'reviewing'
                      ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]'
                      : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <RotateCw size={14} /> Review later
                </button>
                <button
                  onClick={() => askGemini(q)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-glow)] px-3 py-2 text-xs font-semibold text-[var(--accent-cyan)] hover:bg-white/5"
                >
                  <Bot size={14} /> Ask Gemini
                </button>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
