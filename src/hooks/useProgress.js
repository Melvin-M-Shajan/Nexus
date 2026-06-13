import useStore, {
  getPathData,
  phaseProgress,
  overallProgress,
  computeStreak,
} from '../store/useStore'

// Convenience hook bundling the current path's data + derived metrics.
export function useProgress() {
  const currentPath = useStore((s) => s.currentPath)
  const data = useStore((s) => s.data[s.currentPath])
  const pathData = getPathData(currentPath)
  const phases = pathData.phases

  const overall = overallProgress(phases, data.projectCompletion, data.resourceCompletion)
  const streak = computeStreak(data.heatmap)

  const phasesWithProgress = phases.map((p) => ({
    ...p,
    progress: phaseProgress(p, data.projectCompletion, data.resourceCompletion),
    complete: !!data.phaseComplete[p.id],
  }))

  const currentPhase =
    phasesWithProgress.find((p) => p.progress > 0 && p.progress < 1) ||
    phasesWithProgress.find((p) => p.progress === 0) ||
    phasesWithProgress[phasesWithProgress.length - 1]

  const projectsBuilt = phases.reduce(
    (acc, p) => acc + (data.projectCompletion[p.id] || []).filter(Boolean).length,
    0
  )
  const projectsTotal = phases.reduce((acc, p) => acc + (p.projects?.length || 0), 0)

  return {
    currentPath,
    pathData,
    phases: phasesWithProgress,
    overall,
    streak,
    currentPhase,
    projectsBuilt,
    projectsTotal,
    data,
  }
}

export default useProgress
