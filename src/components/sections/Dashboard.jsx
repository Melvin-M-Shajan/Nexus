import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Flame,
  Layers,
  Hammer,
  Sparkles,
  Loader2,
  RefreshCw,
  Flag,
  ArrowRight,
  CheckSquare,
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import ProgressRing from '../ui/ProgressRing'
import AnimatedCounter from '../ui/AnimatedCounter'
import StatusBadge from '../ui/StatusBadge'
import useProgress from '../../hooks/useProgress'
import useStore from '../../store/useStore'
import { useGemini } from '../../hooks/useGemini'
import { useAI } from '../ui/AIContext'
import { PRIORITY_META } from '../../data/sharedData'
import TargetCompanies from './TargetCompanies'
import ProjectIdeas from './ProjectIdeas'
import ExecutionRoadmap from './ExecutionRoadmap'

function buildHeatmap(heatmap) {
  // 12 weeks (84 days) ending today, columns = weeks, rows = day of week
  const days = []
  const today = new Date()
  const end = new Date(today)
  // move to end of current week (Saturday)
  end.setDate(end.getDate() + (6 - end.getDay()))
  for (let i = 83; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ key, date: d, studied: !!heatmap[key], future: d > today })
  }
  const weeks = []
  for (let w = 0; w < 12; w++) weeks.push(days.slice(w * 7, w * 7 + 7))
  return weeks
}

export default function Dashboard() {
  const { overall, currentPhase, phases, streak, projectsBuilt, projectsTotal, data } = useProgress()
  const currentPath = useStore((s) => s.currentPath)
  const toggleHeatmap = useStore((s) => s.toggleHeatmap)
  const markToday = useStore((s) => s.markToday)
  const settings = useStore((s) => s.settings)
  const { generate, hasKey } = useGemini()
  const { setSection } = useAI()

  const [briefing, setBriefing] = useState('')
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => setSection('dashboard'), [setSection])

  const weeks = buildHeatmap(data.heatmap)
  const studiedDays = Object.keys(data.heatmap).length

  const pendingTodos = data.todos.filter((t) => !t.done).slice(0, 4)

  async function regenBriefing() {
    if (!hasKey) {
      setBriefing(
        `Focus today on **${currentPhase?.title}**. You're ${Math.round(overall * 100)}% through the roadmap with a ${streak}-day streak. Pick one pending project, timebox 2 hours, and mark a resource as learned. (Add a Gemini key in Settings for a personalized AI briefing.)`
      )
      return
    }
    setBriefingLoading(true)
    setBriefing('')
    try {
      const prompt = `Give me a short "Today's Focus" briefing (2-3 sentences max). My current phase is ${currentPhase?.title}, I'm ${Math.round(
        overall * 100
      )}% complete overall, streak ${streak} days, and I have ${pendingTodos.length} pending todos: ${pendingTodos
        .map((t) => t.text)
        .join('; ')}. Suggest one concrete thing to focus on today.`
      const full = await generate({
        history: [{ role: 'user', content: prompt }],
        system: 'You are NEXUS AI, a concise AI engineering mentor. Reply in 2-3 sentences, markdown allowed.',
        onToken: (t) => setBriefing(t),
      })
      setBriefing(full)
    } catch {
      setBriefing('Could not reach Gemini. Check your key in Settings and try again.')
    } finally {
      setBriefingLoading(false)
    }
  }

  const milestones = computeMilestones(phases, settings)

  const stats = [
    { label: 'Overall Progress', value: Math.round(overall * 100), suffix: '%', icon: Activity, color: 'var(--accent-cyan)' },
    { label: `Current Phase`, text: currentPhase?.number, sub: currentPhase?.title, icon: Layers, color: currentPhase?.color },
    { label: 'Day Streak', value: streak, icon: Flame, color: 'var(--accent-gold)' },
    { label: 'Projects Built', value: projectsBuilt, suffix: `/${projectsTotal}`, icon: Hammer, color: 'var(--accent-green)' },
  ]

  return (
    <div className="section-in space-y-5">
      {/* tabs */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-[var(--accent-cyan)]/50 bg-[var(--accent-cyan)]/12 text-[var(--text-primary)]'
              : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'companies'
              ? 'border-[var(--accent-cyan)]/50 bg-[var(--accent-cyan)]/12 text-[var(--text-primary)]'
              : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Target Companies
        </button>
        <button
          onClick={() => setActiveTab('execution')}
          className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'execution'
              ? 'border-[var(--accent-cyan)]/50 bg-[var(--accent-cyan)]/12 text-[var(--text-primary)]'
              : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Projects & Execution
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* mission status */}
      <GlassCard className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">Mission Status</p>
            <h2 className="mt-1 font-display text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              {currentPhase
                ? overall >= 1
                  ? 'All phases complete — you are job-ready 🎉'
                  : `${currentPhase.title} — ${Math.round((currentPhase.progress || 0) * 100)}% complete`
                : 'Begin your mission'}
            </h2>
          </div>
          <StatusBadge variant={currentPath === 'free' ? 'complete' : 'gold'} className="text-xs">
            Path: {currentPath}
          </StatusBadge>
        </div>
        <div className="h-1 w-full bg-white/5">
          <div
            className="h-full transition-all duration-1000"
            style={{ width: `${overall * 100}%`, background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))' }}
          />
        </div>
      </GlassCard>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s, i) => (
          <GlassCard key={s.label} className="fade-up p-4" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">{s.label}</span>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div className="mt-2 font-mono text-3xl font-bold" style={{ color: s.color }}>
              {s.text != null ? (
                s.text
              ) : (
                <AnimatedCounter value={s.value} suffix={s.suffix || ''} />
              )}
            </div>
            {s.sub && <div className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{s.sub}</div>}
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* phase rings */}
        <GlassCard className="p-5">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">Phase Progress</p>
          <div className="grid grid-cols-3 gap-4">
            {phases.map((p) => (
              <Link to="/roadmap" key={p.id} className="flex flex-col items-center gap-2">
                <ProgressRing progress={p.progress} size={84} stroke={7} color={p.color} label={`${Math.round(p.progress * 100)}%`} />
                <span className="text-center text-[11px] font-medium text-[var(--text-secondary)]">{p.title}</span>
              </Link>
            ))}
          </div>
        </GlassCard>

        {/* heatmap */}
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">Weekly Activity</p>
            <button
              onClick={markToday}
              className="rounded-lg border border-[var(--border-glow)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent-cyan)] hover:bg-white/5"
            >
              Mark today
            </button>
          </div>
          <div className="scrollbar-hide flex gap-1.5 overflow-x-auto pb-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1.5">
                {week.map((day) => (
                  <button
                    key={day.key}
                    disabled={day.future}
                    onClick={() => toggleHeatmap(day.key)}
                    title={day.key}
                    className="h-3.5 w-3.5 rounded-[3px] transition-colors"
                    style={{
                      background: day.studied ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)',
                      boxShadow: day.studied ? '0 0 6px rgba(16,185,129,0.6)' : 'none',
                      opacity: day.future ? 0.25 : 1,
                      cursor: day.future ? 'default' : 'pointer',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">
            <span className="font-mono text-[var(--accent-green)]">{studiedDays}</span> days studied · click a cell to toggle
          </p>
        </GlassCard>
      </div>

      {/* today's focus */}
      <GlassCard className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            <Sparkles size={14} className="text-[var(--accent-cyan)]" /> Today's Focus
          </p>
          <button
            onClick={regenBriefing}
            disabled={briefingLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-glow)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-cyan)] hover:bg-white/5 disabled:opacity-50"
          >
            {briefingLoading ? <Loader2 size={13} className="spin" /> : <RefreshCw size={13} />}
            Regenerate
          </button>
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-primary)]/90">
          {briefing ? (
            <span dangerouslySetInnerHTML={{ __html: briefing.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />
          ) : (
            <span className="text-[var(--text-secondary)]">
              Tap <em>Regenerate</em> for an AI briefing tailored to your progress.
            </span>
          )}
          {briefingLoading && <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-[var(--accent-cyan)] align-middle" />}
        </p>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* recent todos */}
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <CheckSquare size={14} /> Recent Todos
            </p>
            <Link to="/todo" className="text-xs text-[var(--accent-cyan)] hover:underline">
              View all <ArrowRight size={11} className="inline" />
            </Link>
          </div>
          {pendingTodos.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No pending tasks. Nice and clear. ✨</p>
          ) : (
            <ul className="space-y-2">
              {pendingTodos.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm text-[var(--text-primary)]/90">
                  <span>{PRIORITY_META[t.priority]?.dot}</span>
                  <span className="truncate">{t.text}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        {/* milestones */}
        <GlassCard className="p-5">
          <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            <Flag size={14} /> Upcoming Milestones
          </p>
          <ul className="space-y-2.5">
            {milestones.map((m) => (
              <li key={m.label} className="flex items-center gap-3 text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${m.color}20`, color: m.color }}>
                  📍
                </span>
                <span className="flex-1 text-[var(--text-primary)]/90">{m.label}</span>
                <span className="font-mono text-xs text-[var(--text-secondary)]">{m.eta}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
        </>
      ) : activeTab === 'companies' ? (
        <div className="animate-in fade-in duration-300">
          {/* Target Companies (Section 1) */}
          <TargetCompanies />
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Portfolio Project Ideas (Section 2) */}
          <ProjectIdeas />

          {/* 60-Day Execution Roadmap (Section 3) */}
          <ExecutionRoadmap />
        </div>
      )}
    </div>
  )
}

function computeMilestones(phases, settings) {
  const hoursPerDay = settings.hoursPerDay || 2
  // rough hours per phase from "slow" estimate midpoint at 2h/day
  const phaseWeeks = { phase1: 3.5, phase2: 4.5, phase3: 11, phase4a: 7, phase4b: 4.5, phase5: 3.5 }
  let cumWeeksAt2h = 0
  const result = []
  for (const p of phases) {
    const baseWeeks = phaseWeeks[p.id] || 4
    const adjusted = baseWeeks * (2 / hoursPerDay)
    cumWeeksAt2h += adjusted * (1 - (p.progress || 0))
  }
  // Build a few headline milestones
  const remainingToPhase3 = phases
    .filter((p) => ['phase1', 'phase2', 'phase3'].includes(p.id))
    .reduce((acc, p) => acc + (phaseWeeks[p.id] || 4) * (2 / hoursPerDay) * (1 - (p.progress || 0)), 0)
  result.push({ label: 'Phase 3 (LLM) Complete', eta: `~${Math.max(1, Math.round(remainingToPhase3))} wks`, color: '#00D4FF' })
  const firstDeploy = phases.reduce((acc, p) => acc + (phaseWeeks[p.id] || 4) * (2 / hoursPerDay) * (1 - (p.progress || 0)) * (['phase5'].includes(p.id) ? 1 : 0.7), 0)
  result.push({ label: 'First Deployed Project', eta: `~${Math.max(2, Math.round(firstDeploy))} wks`, color: '#10B981' })
  result.push({ label: 'Job-Ready', eta: `~${Math.max(3, Math.round(cumWeeksAt2h))} wks`, color: '#F59E0B' })
  return result
}
