import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Search, Copy, Check, Printer, Bot } from 'lucide-react'
import PageHeader from '../ui/PageHeader'
import GlassCard from '../ui/GlassCard'
import useCopy from '../../hooks/useCopy'
import { useAI } from '../ui/AIContext'
import { cheatSheets } from '../../data/sharedData'

export default function CheatSheet() {
  const copy = useCopy()
  const { setSection, openAI } = useAI()
  const [activeTab, setActiveTab] = useState(cheatSheets[0].id)
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(null)

  useEffect(() => setSection('cheatsheet'), [setSection])

  const searching = query.trim().length > 0

  const visible = useMemo(() => {
    if (!searching) {
      const sheet = cheatSheets.find((s) => s.id === activeTab) || cheatSheets[0]
      return [{ sheet, cards: sheet.cards }]
    }
    const q = query.toLowerCase()
    return cheatSheets
      .map((sheet) => ({
        sheet,
        cards: sheet.cards.filter((c) => (c.title + ' ' + c.code).toLowerCase().includes(q)),
      }))
      .filter((g) => g.cards.length)
  }, [activeTab, query, searching])

  const doCopy = (card) => {
    copy(card.code, 'Copied!')
    setCopied(card.title)
    setTimeout(() => setCopied(null), 1500)
  }

  const explain = (card) => {
    openAI({
      section: 'cheatsheet',
      context: `Cheat sheet: ${card.title}\n${card.code}`,
      prompt: `Explain "${card.title}" clearly with a concrete example I can use in a project.`,
    })
  }

  return (
    <div className="section-in">
      <div className="no-print">
        <PageHeader
          icon={ClipboardList}
          title="Cheat Sheet"
          subtitle="Searchable, copy-paste-ready reference"
          right={
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Printer size={14} /> Print
            </button>
          }
        />

        {/* search */}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-void)] px-3 focus-within:border-[var(--accent-cyan)]">
          <Search size={16} className="text-[var(--text-secondary)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all cheat sheets…"
            className="flex-1 bg-transparent py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-dim)]"
          />
        </div>

        {/* tabs */}
        {!searching && (
          <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1">
            {cheatSheets.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`shrink-0 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                  s.id === activeTab
                    ? 'border-[var(--accent-cyan)]/50 bg-[var(--accent-cyan)]/12 text-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* cards */}
      <div className="print-area space-y-5">
        {visible.map((group) => (
          <div key={group.sheet.id}>
            {searching && <h2 className="mb-2 font-display text-lg font-bold text-[var(--accent-cyan)]">{group.sheet.name}</h2>}
            <div className="grid gap-4 lg:grid-cols-2">
              {group.cards.map((card) => (
                <GlassCard key={card.title} spotlight={false} className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{card.title}</h3>
                    <div className="no-print flex items-center gap-1">
                      <button onClick={() => explain(card)} title="Ask AI" className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--accent-cyan)]">
                        <Bot size={14} />
                      </button>
                      <button onClick={() => doCopy(card)} title="Copy" className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]">
                        {copied === card.title ? <Check size={14} className="text-[var(--accent-green)]" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-[var(--text-primary)]/90">
                    <code>{card.code}</code>
                  </pre>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
        {visible.length === 0 && <p className="text-center text-sm text-[var(--text-secondary)]">No cheat sheet matches "{query}".</p>}
      </div>
    </div>
  )
}
