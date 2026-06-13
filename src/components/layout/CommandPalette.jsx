import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CornerDownLeft } from 'lucide-react'
import { NAV_ITEMS } from './navConfig'
import { interviewCategories, leetcodeCategories } from '../../data/sharedData'
import useStore, { getPathData } from '../../store/useStore'
import { useAI } from '../ui/AIContext'

// subsequence fuzzy match score (lower = better, -1 = no match)
function fuzzy(query, text) {
  if (!query) return 0
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t.includes(q)) return t.indexOf(q)
  let qi = 0
  for (let i = 0; i < t.length && qi < q.length; i++) if (t[i] === q[qi]) qi++
  return qi === q.length ? 1000 : -1
}

export default function CommandPalette({ open, setOpen }) {
  const navigate = useNavigate()
  const currentPath = useStore((s) => s.currentPath)
  const setPath = useStore((s) => s.setPath)
  const { openAI } = useAI()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)

  const commands = useMemo(() => {
    const list = []
    NAV_ITEMS.forEach((n) => list.push({ icon: n.icon, label: n.label, group: 'Navigate', run: () => navigate(n.to) }))
    list.push({
      emoji: '🔀',
      label: currentPath === 'free' ? 'Switch to Udemy Path' : 'Switch to Free Path',
      group: 'Actions',
      run: () => setPath(currentPath === 'free' ? 'udemy' : 'free'),
    })
    list.push({ emoji: '🤖', label: 'Ask AI about current phase', group: 'Actions', run: () => openAI({ section: 'roadmap', prompt: 'Explain my current phase and what to do next.' }) })

    getPathData(currentPath).phases.forEach((p) =>
      list.push({ emoji: '🗺', label: `Roadmap — ${p.title}`, group: 'Phases', run: () => navigate('/roadmap') })
    )
    interviewCategories.forEach((c) =>
      list.push({ emoji: '🎯', label: `Interview — ${c.name}`, group: 'Interview', run: () => navigate('/interview', { state: { category: c.id } }) })
    )
    leetcodeCategories.forEach((c) =>
      list.push({ emoji: '💻', label: `LeetCode — ${c.name}`, group: 'LeetCode', run: () => navigate('/leetcode', { state: { category: c.id } }) })
    )
    return list
  }, [currentPath, navigate, setPath, openAI])

  const filtered = useMemo(() => {
    if (!query) return commands
    return commands
      .map((c) => ({ c, score: fuzzy(query, c.label) }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.c)
  }, [commands, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  if (!open) return null

  const choose = (cmd) => {
    cmd?.run()
    setOpen(false)
  }

  return (
    <div className="no-print fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border-glow)] bg-[var(--bg-deep)] shadow-2xl section-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4">
          <Search size={18} className="text-[var(--text-secondary)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) => Math.min(a + 1, filtered.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => Math.max(a - 1, 0))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                choose(filtered[active])
              } else if (e.key === 'Escape') {
                setOpen(false)
              }
            }}
            placeholder="Search or jump to…"
            className="flex-1 bg-transparent py-4 text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-dim)]"
          />
          <kbd className="rounded border border-[var(--border-subtle)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">ESC</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 && <div className="px-3 py-8 text-center text-sm text-[var(--text-secondary)]">No results</div>}
          {filtered.map((cmd, i) => (
            <button
              key={i}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(cmd)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                i === active ? 'bg-[var(--accent-cyan)]/12 text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
              }`}
            >
              <span className="grid h-6 w-6 place-items-center">
                {cmd.icon ? <cmd.icon size={16} /> : <span>{cmd.emoji}</span>}
              </span>
              <span className="flex-1 truncate">{cmd.label}</span>
              <span className="text-[10px] uppercase tracking-wide text-[var(--text-dim)]">{cmd.group}</span>
              {i === active && <CornerDownLeft size={14} className="text-[var(--accent-cyan)]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
