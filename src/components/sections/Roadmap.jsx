import { useEffect } from 'react'
import { Map } from 'lucide-react'
import PageHeader from '../ui/PageHeader'
import PhaseCard from '../ui/PhaseCard'
import ProgressRing from '../ui/ProgressRing'
import useProgress from '../../hooks/useProgress'
import { useAI } from '../ui/AIContext'

export default function Roadmap() {
  const { phases, overall, pathData } = useProgress()
  const { setSection, openAI } = useAI()

  useEffect(() => setSection('roadmap'), [setSection])

  const onAskAI = (phase) => {
    openAI({
      section: 'roadmap',
      context: `Phase ${phase.number}: ${phase.title}. ${phase.tagline}. Must learn: ${phase.mustLearn.join(', ')}. Projects: ${phase.projects
        .map((p) => p.name)
        .join(', ')}.`,
      prompt: `Explain Phase ${phase.number} (${phase.title}) — what I'll learn, why it matters for getting hired, and how to approach it efficiently.`,
    })
  }

  return (
    <div className="section-in">
      <PageHeader
        icon={Map}
        title="Roadmap"
        subtitle={`${pathData.label} · 6 phases to AI Engineer · ${pathData.totalCost}`}
        right={
          <ProgressRing progress={overall} size={72} stroke={7} label={`${Math.round(overall * 100)}%`} sublabel="overall" />
        }
      />
      <div className="space-y-5">
        {phases.map((phase, i) => (
          <PhaseCard key={phase.id} phase={phase} index={i} onAskAI={onAskAI} />
        ))}
      </div>
    </div>
  )
}
