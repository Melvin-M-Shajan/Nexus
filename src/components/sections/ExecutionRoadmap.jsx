import { useMemo } from 'react'
import { Calendar, CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import useStore from '../../store/useStore'

const roadmapData = [
  {
    dayRange: "Days 1-30",
    title: "Build GraphRAG-Enterprise",
    color: "var(--accent-cyan)",
    subPhases: [
      { title: "Dataset Selection", desc: "Curate and clean a domain-specific enterprise knowledge dataset." },
      { title: "Graph Schema", desc: "Design the entity-relationship schema for Neo4j ingestion." },
      { title: "Vector + Fusion Retrieval", desc: "Implement hybrid search using vector similarity and graph traversal." },
      { title: "FastAPI Wrapper + Eval Suite", desc: "Wrap retrieval logic in API endpoints and build RAGAS evals." },
      { title: "Frontend + Deployment", desc: "Build a UI to visualize reasoning sub-graphs and deploy via Docker." }
    ]
  },
  {
    dayRange: "Days 31-60",
    title: "Build AgentMesh",
    color: "var(--accent-purple)",
    subPhases: [
      { title: "Architecture Design", desc: "Define agent roles, tools, and the shared state schema." },
      { title: "Execution Engine", desc: "Build the core LangGraph execution loop." },
      { title: "Task Router", desc: "Implement semantic routing for incoming user requests." },
      { title: "Inter-Agent Memory", desc: "Implement PostgreSQL persistence for resuming workflows." },
      { title: "Guardrails + Monitoring", desc: "Add structured output validation and an observability UI." }
    ]
  }
]

export default function ExecutionRoadmap() {
  const settings = useStore((s) => s.settings)
  
  // Try to determine current day based on settings.startDate.
  // If not set or in the past/future, default to a static view.
  const currentDay = useMemo(() => {
    if (!settings.startDate) return -1
    const start = new Date(settings.startDate)
    const today = new Date()
    const diffTime = today - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 60 ? diffDays : -1
  }, [settings.startDate])

  return (
    <div className="section-in mt-8 space-y-4">
      <GlassCard className="p-5">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-[var(--text-primary)]">
            <Calendar size={20} className="text-[#f97316]" /> 60-Day Execution Roadmap
          </h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Step-by-step timeline for building the selected portfolio projects.
          </p>
        </div>

        <div className="space-y-8 pl-2">
          {roadmapData.map((phase, i) => {
            let isActivePhase = false
            if (currentDay > 0) {
              if (i === 0 && currentDay <= 30) isActivePhase = true
              if (i === 1 && currentDay > 30 && currentDay <= 60) isActivePhase = true
            }

            return (
              <div key={phase.dayRange} className="relative">
                {/* Phase Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ring-4 ring-[#0a1628] ${isActivePhase ? 'animate-pulse' : ''}`}
                    style={{ 
                      backgroundColor: `${phase.color}20`, 
                      color: phase.color,
                      border: `1px solid ${phase.color}` 
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-2">
                      {phase.title}
                      {isActivePhase && (
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[var(--text-primary)]">
                          Active
                        </span>
                      )}
                    </h3>
                    <p className="font-mono text-xs text-[var(--text-dim)]">{phase.dayRange}</p>
                  </div>
                </div>

                {/* Sub-phases Stepper */}
                <div className="ml-4 space-y-4 border-l-2 border-[var(--border-subtle)] pl-6 relative">
                  {phase.subPhases.map((sub, j) => {
                    // Estimate sub-phase active state based on currentDay
                    let isSubActive = false
                    let isSubDone = false
                    
                    if (currentDay > 0) {
                      const daysPerSub = 30 / phase.subPhases.length
                      const phaseStartDay = i === 0 ? 1 : 31
                      const subStartDay = phaseStartDay + (j * daysPerSub)
                      const subEndDay = subStartDay + daysPerSub

                      if (currentDay >= subStartDay && currentDay < subEndDay) {
                        isSubActive = true
                      } else if (currentDay >= subEndDay) {
                        isSubDone = true
                      }
                    }

                    return (
                      <div key={sub.title} className="relative">
                        {/* Timeline Node */}
                        <div className="absolute -left-[31px] top-1 bg-[#0a1628] rounded-full">
                          {isSubDone ? (
                            <CheckCircle2 size={14} className="text-[var(--accent-green)]" />
                          ) : isSubActive ? (
                            <Circle size={14} fill={phase.color} className="text-transparent animate-pulse" />
                          ) : (
                            <Circle size={14} className="text-[var(--border-subtle)]" />
                          )}
                        </div>
                        
                        <div>
                          <h4 
                            className={`text-sm font-semibold flex items-center gap-1.5 ${isSubActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                            style={isSubActive ? { color: phase.color } : {}}
                          >
                            {isSubActive && <ChevronRight size={14} />}
                            {sub.title}
                          </h4>
                          <p className={`mt-1 text-xs leading-relaxed ${isSubActive ? 'text-[var(--text-primary)]/80' : 'text-[var(--text-dim)]'}`}>
                            {sub.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>
    </div>
  )
}
