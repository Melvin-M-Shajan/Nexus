import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Code2, ExternalLink, Bot, Lightbulb, Cpu } from 'lucide-react'
import PageHeader from '../ui/PageHeader'
import GlassCard from '../ui/GlassCard'
import useStore from '../../store/useStore'
import { useAI } from '../ui/AIContext'
import { leetcodeCategories } from '../../data/sharedData'

const DIFF = {
  Easy: { color: '#10B981' },
  Medium: { color: '#F59E0B' },
  Hard: { color: '#EF4444' },
}
const STATUSES = [
  { id: 'todo', label: 'Todo' },
  { id: 'attempted', label: 'Attempted' },
  { id: 'solved', label: 'Solved' },
  { id: 'revisit', label: 'Revisit' },
]
const STATUS_COLOR = { todo: 'var(--text-secondary)', attempted: 'var(--accent-gold)', solved: 'var(--accent-green)', revisit: 'var(--accent-purple)' }

export default function LeetCode() {
  const location = useLocation()
  const data = useStore((s) => s.data[s.currentPath])
  const setLeetcodeStatus = useStore((s) => s.setLeetcodeStatus)
  const { setSection, openAI } = useAI()
  const [activeCat, setActiveCat] = useState(location.state?.category || leetcodeCategories[0].id)

  useEffect(() => setSection('leetcode'), [setSection])
  useEffect(() => {
    if (location.state?.category) setActiveCat(location.state.category)
  }, [location.state])

  const category = leetcodeCategories.find((c) => c.id === activeCat) || leetcodeCategories[0]

  const solvedCount = (cat) => cat.problems.filter((p) => data.leetcodeStatus[p.id] === 'solved').length
  const totalSolved = leetcodeCategories.reduce((a, c) => a + solvedCount(c), 0)
  const totalProblems = leetcodeCategories.reduce((a, c) => a + c.problems.length, 0)

  const getHint = (p) => {
    openAI({
      section: 'leetcode',
      context: `LeetCode #${p.num} ${p.title} (${p.difficulty}). Key insight: ${p.insight}`,
      prompt: `Give me a progressive hint for LeetCode #${p.num} "${p.title}" without fully spoiling the solution.`,
    })
  }

  return (
    <div className="section-in">
      <PageHeader
        icon={Code2}
        title="LeetCode"
        subtitle="Not 500 problems — these ~25 patterns are enough for AI Engineer interviews"
        accent="#10B981"
        right={
          <div className="text-right">
            <div className="font-mono text-2xl font-bold text-[var(--accent-green)]">
              {totalSolved}
              <span className="text-sm text-[var(--text-secondary)]">/{totalProblems}</span>
            </div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">solved</div>
          </div>
        }
      />

      {/* tabs */}
      <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1">
        {leetcodeCategories.map((c) => {
          const active = c.id === activeCat
          return (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-[var(--accent-green)]/50 bg-[var(--accent-green)]/12 text-[var(--text-primary)]'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {c.name}
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">
                {solvedCount(c)}/{c.problems.length}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mb-4 text-sm text-[var(--text-secondary)]">{category.blurb}</p>

      <div className="grid gap-3 lg:grid-cols-2">
        {category.problems.map((p) => {
          const status = data.leetcodeStatus[p.id] || 'todo'
          return (
            <GlassCard key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  <span className="font-mono text-[var(--text-secondary)]">#{p.num}</span> {p.title}
                </h3>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: `${DIFF[p.difficulty].color}20`, color: DIFF[p.difficulty].color }}>
                  {p.difficulty}
                </span>
              </div>

              <div className="hr-glow my-3" />

              <p className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <Cpu size={14} className="mt-0.5 shrink-0 text-[var(--accent-cyan)]" />
                <span><strong className="text-[var(--text-primary)]/80">AI relevance:</strong> {p.relevance}</span>
              </p>
              <p className="mt-2 flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <Lightbulb size={14} className="mt-0.5 shrink-0 text-[var(--accent-gold)]" />
                <span><strong className="text-[var(--text-primary)]/80">Key insight:</strong> {p.insight}</span>
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-glow)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-cyan)] hover:bg-white/5"
                >
                  Open <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => getHint(p)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <Bot size={13} /> Hint
                </button>
              </div>

              {/* status segmented */}
              <div className="mt-3 grid grid-cols-4 gap-1 rounded-lg border border-[var(--border-subtle)] p-1">
                {STATUSES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setLeetcodeStatus(p.id, s.id)}
                    className="rounded-md py-1 text-[11px] font-semibold transition-colors"
                    style={
                      status === s.id
                        ? { background: `${STATUS_COLOR[s.id]}22`, color: STATUS_COLOR[s.id] }
                        : { color: 'var(--text-dim)' }
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
