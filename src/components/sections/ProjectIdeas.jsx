import { useState, useMemo } from 'react'
import {
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Layers,
  Wrench,
  TrendingUp,
  Target,
  Code2,
  Clock,
  Sparkles
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import StatusBadge from '../ui/StatusBadge'
import { projectIdeas } from '../../data/projectIdeas'

const ScoreBar = ({ label, score, icon: Icon, colorClass }) => (
  <div className="flex items-center justify-between text-xs">
    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
      {Icon && <Icon size={12} />}
      {label}
    </div>
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass}`} 
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="font-mono text-[10px] w-4 text-right text-[var(--text-primary)]">{score}</span>
    </div>
  </div>
)

export default function ProjectIdeas() {
  const [expandedCards, setExpandedCards] = useState({})

  const toggleExpand = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Sort selected to top
  const sortedProjects = useMemo(() => {
    return [...projectIdeas].sort((a, b) => {
      if (a.selected && !b.selected) return -1
      if (!a.selected && b.selected) return 1
      return 0
    })
  }, [])

  return (
    <div className="section-in mt-8 space-y-4">
      {/* Header */}
      <GlassCard className="p-5">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[var(--text-primary)]">
              <Lightbulb size={20} className="text-[var(--accent-gold)]" /> Portfolio Project Ideas
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Top 10 high-impact AI engineering projects optimized for resume value and technical depth.
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge variant="gold">Total: 10</StatusBadge>
            <StatusBadge variant="active">Selected: 2</StatusBadge>
          </div>
        </div>
      </GlassCard>

      {/* Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {sortedProjects.map(project => {
          const isExpanded = expandedCards[project.id]
          const isSelected = project.selected

          return (
            <GlassCard 
              key={project.id} 
              className={`p-5 transition-all ${isSelected ? 'border-[var(--accent-cyan)]/30' : ''}`}
            >
              <div 
                className="flex cursor-pointer justify-between items-start gap-4"
                onClick={() => toggleExpand(project.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[var(--text-primary)] text-lg">{project.name}</h3>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 rounded bg-[var(--accent-cyan)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent-cyan)] uppercase tracking-wider border border-[var(--accent-cyan)]/30">
                        <CheckCircle2 size={10} /> Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {project.pitch}
                  </p>
                </div>
                <button className="text-[var(--text-secondary)] hover:text-white mt-1 shrink-0 bg-white/5 rounded-full p-1.5 transition-colors">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Always visible score badges / summary */}
              <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
                <span className="flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-[var(--text-secondary)]">
                  <Clock size={12} className="text-[var(--accent-gold)]" /> {project.buildTime}
                </span>
                <span className="flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-[var(--text-secondary)]">
                  <Target size={12} className="text-[var(--accent-green)]" /> {project.relevantCompanies.length} Target Cos
                </span>
                <span className="flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-[var(--text-secondary)]">
                  <TrendingUp size={12} className="text-[var(--accent-purple)]" /> Impact: {project.scores.resumeImpact}/10
                </span>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-5 space-y-5 border-t border-[var(--border-subtle)] pt-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {/* Scores Grid */}
                  <div>
                    <h4 className="text-xs font-mono uppercase text-[var(--text-secondary)] mb-2.5 tracking-wider">Score Breakdown</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      <ScoreBar label="LLM Depth" score={project.scores.llmDepth} icon={Sparkles} colorClass="bg-[var(--accent-cyan)]" />
                      <ScoreBar label="Backend" score={project.scores.backendDepth} icon={Code2} colorClass="bg-[var(--accent-purple)]" />
                      <ScoreBar label="Data Eng" score={project.scores.dataEngDepth} icon={Database} colorClass="bg-[#f97316]" />
                      <ScoreBar label="MLOps/Infra" score={project.scores.mlopsDepth} icon={Layers} colorClass="bg-[var(--text-primary)]" />
                      <ScoreBar label="Difficulty" score={project.scores.difficulty} icon={Wrench} colorClass="bg-[var(--accent-gold)]" />
                      <ScoreBar label="Resume Impact" score={project.scores.resumeImpact} icon={TrendingUp} colorClass="bg-[var(--accent-green)]" />
                    </div>
                  </div>

                  {/* Why it fits */}
                  <div className="rounded-md bg-white/5 p-3 text-sm text-[var(--text-primary)]/80 leading-relaxed border-l-2 border-[var(--accent-cyan)]">
                    <strong className="text-[var(--text-secondary)] block text-xs uppercase tracking-wider mb-1 font-mono">Why this fits me:</strong>
                    {project.whyFits}
                  </div>

                  {/* Tags: AI Concepts & Tech Stack */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-[10px] font-mono uppercase text-[var(--text-dim)] mb-2">AI Concepts</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {project.aiConcepts.map(c => (
                          <span key={c} className="rounded bg-[var(--accent-cyan)]/10 px-1.5 py-0.5 text-[10px] text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono uppercase text-[var(--text-dim)] mb-2">Tech Stack</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {project.techStack.map(c => (
                          <span key={c} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)] border border-white/5">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Feature Tiers */}
                  <div>
                    <h4 className="text-xs font-mono uppercase text-[var(--text-secondary)] mb-2.5 tracking-wider">Implementation Tiers</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-3">
                        <span className="w-16 shrink-0 text-xs font-semibold text-[var(--text-dim)]">MVP</span>
                        <span className="text-[var(--text-primary)]/80 leading-relaxed">{project.features.mvp}</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="w-16 shrink-0 text-xs font-semibold text-[var(--accent-green)]">Production</span>
                        <span className="text-[var(--text-primary)]/80 leading-relaxed">{project.features.production}</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="w-16 shrink-0 text-xs font-semibold text-[var(--accent-purple)]">Impressive</span>
                        <span className="text-[var(--text-primary)]/80 leading-relaxed">{project.features.impressive}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resume Bullets */}
                  <div>
                    <h4 className="text-xs font-mono uppercase text-[var(--text-secondary)] mb-2.5 tracking-wider">Resume Bullets</h4>
                    <ul className="list-disc pl-4 space-y-1.5 text-sm text-[var(--text-primary)]/80">
                      {project.resumeBullets.map((bullet, i) => (
                        <li key={i} className="leading-relaxed pl-1 marker:text-[var(--accent-gold)]">{bullet}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Target Companies tags */}
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-[var(--text-dim)] mb-2">Relevant Target Companies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {project.relevantCompanies.map(c => (
                        <span key={c} className="text-[11px] text-[var(--text-secondary)] after:content-[','] last:after:content-['']">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
