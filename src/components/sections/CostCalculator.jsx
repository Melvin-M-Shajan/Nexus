import { useEffect } from 'react'
import { Wallet, TrendingUp, Clock, Check, Tag } from 'lucide-react'
import PageHeader from '../ui/PageHeader'
import GlassCard from '../ui/GlassCard'
import useStore from '../../store/useStore'
import useProgress from '../../hooks/useProgress'
import { useAI } from '../ui/AIContext'
import { modelPricing } from '../../data/sharedData'

export default function CostCalculator() {
  const currentPath = useStore((s) => s.currentPath)
  const data = useStore((s) => s.data[s.currentPath])
  const setCosts = useStore((s) => s.setCosts)
  const toggleCourseBought = useStore((s) => s.toggleCourseBought)
  const settings = useStore((s) => s.settings)
  const { phases, overall, pathData } = useProgress()
  const { setSection } = useAI()

  useEffect(() => setSection('cost'), [setSection])

  const costs = data.costs

  // ROI projection
  const weeksLeft = Math.max(1, Math.round(28 * (1 - overall) * (2 / (settings.hoursPerDay || 2))))

  return (
    <div className="section-in">
      <PageHeader icon={Wallet} title="Cost Tracker" subtitle={`${pathData.label} · ${pathData.totalCost} total`} accent="#F59E0B" />

      {currentPath === 'free' ? (
        <FreeCosts costs={costs} setCosts={setCosts} />
      ) : (
        <UdemyCosts costs={costs} phases={phases} toggleCourseBought={toggleCourseBought} setCosts={setCosts} />
      )}

      {/* shared: time invested + ROI */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <GlassCard className="p-5">
          <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            <Clock size={14} /> Time Invested
          </p>
          <label className="text-xs text-[var(--text-secondary)]">Hours logged (manual)</label>
          <input
            type="number"
            min="0"
            value={costs.hoursLogged ?? 0}
            onChange={(e) => setCosts({ hoursLogged: Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]"
          />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Estimated from progress: <span className="font-mono text-[var(--accent-cyan)]">{Math.round(overall * 380)}h</span> of ~380h roadmap
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            <TrendingUp size={14} /> ROI Projector
          </p>
          <p className="text-sm text-[var(--text-primary)]/90">
            At <span className="font-mono text-[var(--accent-cyan)]">{settings.hoursPerDay || 2}h/day</span>, you'll be job-ready in roughly{' '}
            <span className="font-mono text-2xl font-bold text-[var(--accent-gold)]">{weeksLeft}</span> weeks.
          </p>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">{Math.round(overall * 100)}% of the roadmap complete.</p>
        </GlassCard>
      </div>
    </div>
  )
}

function FreeCosts({ costs, setCosts }) {
  const hours = costs.hoursPerDay ?? 1
  const model = modelPricing.find((m) => m.id === costs.model) || modelPricing[0]

  // rough usage model: per active hour ≈ 60 req × (1500 in + 700 out) tokens
  const inTokens = hours * 30 * 60 * 1500
  const outTokens = hours * 30 * 60 * 700
  const monthly = (inTokens / 1e6) * model.input + (outTokens / 1e6) * model.output

  const spent = costs.spent ?? 0
  const budget = costs.budget ?? 100

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <GlassCard className="p-5">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">API Cost Estimator</p>
        <div className="mb-4 rounded-xl border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-4 py-2 text-sm font-semibold text-[var(--accent-green)]">
          Course cost: ₹0 — everything is free 🎉
        </div>

        <label className="text-xs text-[var(--text-secondary)]">
          Hours/day using the API: <span className="font-mono text-[var(--accent-cyan)]">{hours}h</span>
        </label>
        <input type="range" min="0" max="4" step="0.5" value={hours} onChange={(e) => setCosts({ hoursPerDay: Number(e.target.value) })} className="mb-4 mt-2 w-full" />

        <label className="text-xs text-[var(--text-secondary)]">Primary model</label>
        <select
          value={costs.model}
          onChange={(e) => setCosts({ model: e.target.value })}
          className="mb-4 mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)] [color-scheme:dark]"
        >
          {modelPricing.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-white/[0.02] p-4 text-center">
          <div className="font-mono text-3xl font-bold text-[var(--accent-cyan)]">${monthly.toFixed(2)}</div>
          <div className="text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">estimated / month</div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">Running Total</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)]">Spent so far ($)</label>
            <input type="number" min="0" step="0.5" value={spent} onChange={(e) => setCosts({ spent: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)]">Budget ($)</label>
            <input type="number" min="0" step="5" value={budget} onChange={(e) => setCosts({ budget: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]" />
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-[var(--text-secondary)]">
            <span>${spent.toFixed(2)} spent</span>
            <span>${budget.toFixed(2)} budget</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (spent / Math.max(1, budget)) * 100)}%`,
                background: spent > budget ? 'var(--accent-red)' : 'linear-gradient(90deg, var(--accent-green), var(--accent-cyan))',
              }}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

function UdemyCosts({ costs, phases, toggleCourseBought }) {
  const bought = costs.coursesBought || {}
  const courses = phases.map((p) => ({ id: p.id, title: p.title, course: p.resources[0], color: p.color }))
  const totalSpent = courses.reduce((acc, c) => acc + (bought[c.id] ? parsePrice(c.course?.price) : 0), 0)
  const totalBudget = 2994

  return (
    <div className="space-y-5">
      <GlassCard className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">Course Purchase Tracker</p>
          <span className="font-mono text-sm">
            <span className="font-bold text-[var(--accent-gold)]">₹{totalSpent}</span>
            <span className="text-[var(--text-secondary)]"> / ₹{totalBudget}</span>
          </span>
        </div>
        <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-[var(--accent-gold)] transition-all" style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }} />
        </div>

        <ul className="space-y-2">
          {courses.map((c) => {
            const isBought = !!bought[c.id]
            return (
              <li key={c.id} className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-white/[0.02] p-3">
                <button
                  onClick={() => toggleCourseBought(c.id)}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md border"
                  style={{ borderColor: isBought ? 'var(--accent-gold)' : 'var(--border-subtle)', background: isBought ? 'var(--accent-gold)' : 'transparent' }}
                >
                  {isBought && <Check size={14} className="text-[#1a1203]" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[var(--text-primary)]">{c.title}</div>
                  <div className="truncate text-xs text-[var(--text-secondary)]">{c.course?.name} · {c.course?.creator}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-[var(--accent-gold)]">{c.course?.price}</div>
                  {!isBought && <div className="text-[10px] text-[var(--text-secondary)]">⏳ wait for sale</div>}
                </div>
              </li>
            )
          })}
        </ul>
      </GlassCard>

      <GlassCard className="flex items-center gap-3 p-4">
        <Tag size={18} className="shrink-0 text-[var(--accent-gold)]" />
        <p className="text-sm text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">Udemy sale calendar:</strong> sales run almost weekly — never pay full price. Wait for courses to drop to ~₹499.
        </p>
      </GlassCard>
    </div>
  )
}

function parsePrice(p) {
  if (!p) return 0
  const n = Number(String(p).replace(/[^\d]/g, ''))
  return isNaN(n) ? 0 : n
}
