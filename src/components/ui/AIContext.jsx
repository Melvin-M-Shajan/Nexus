import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const AIContext = createContext(null)

// Default quick actions per section (label + the prompt they send).
export const SECTION_QUICK_ACTIONS = {
  dashboard: [
    { label: '🧭 Plan my day', prompt: "Generate today's study plan based on my current progress and pending todos." },
    { label: '📊 Am I on track?', prompt: 'Look at my progress and tell me honestly if I am on track to become job-ready, and what to prioritize.' },
    { label: '🎯 Next milestone', prompt: 'What is the single most important thing I should do next to progress?' },
  ],
  roadmap: [
    { label: '💡 Explain this phase', prompt: 'Explain what I will learn in my current phase and why it matters for getting hired.' },
    { label: '📋 What should I build next?', prompt: 'Based on my current phase, what project should I build next and how should I approach it?' },
    { label: '⏱ Am I on track?', prompt: 'Given my progress, am I on track? Suggest priority cuts if I am behind.' },
  ],
  interview: [
    { label: '🎯 Quiz me', prompt: 'Quiz me on this interview topic with 3 progressively harder questions, then evaluate my answers.' },
    { label: '📝 Explain better', prompt: 'Explain this interview answer in more depth with a concrete example.' },
    { label: '🔗 Related questions', prompt: 'Give me 3 related interview questions I should also be able to answer.' },
  ],
  leetcode: [
    { label: '💡 Give me a hint', prompt: "Give me a hint for this LeetCode problem without spoiling the full solution." },
    { label: '🔍 Explain approach', prompt: 'Explain the optimal approach and complexity for this problem.' },
    { label: '🔄 Similar problems', prompt: 'Suggest similar problems to reinforce this pattern.' },
  ],
  cheatsheet: [
    { label: '📖 Explain concept', prompt: 'Explain this concept clearly with a concrete example.' },
    { label: '💻 Show code', prompt: 'Show me a minimal, working code example for this.' },
    { label: '🔗 Connect to project', prompt: 'How would I apply this in one of my roadmap projects?' },
  ],
  timeline: [
    { label: '⏱ Recalculate', prompt: 'If I only have 1 hour per day, recalculate my realistic timeline and suggest what to cut.' },
    { label: '🎯 Job-ready by?', prompt: 'At my current pace, when will I realistically be job-ready?' },
  ],
  todo: [
    { label: '✨ Suggest tasks', prompt: 'Based on my current phase and progress, suggest 5 concrete tasks I should add to my todo list.' },
  ],
  cost: [
    { label: '💰 Estimate cost', prompt: 'Help me estimate my monthly API cost and how to reduce it.' },
  ],
  default: [
    { label: '💬 Help me', prompt: 'Help me with my AI engineering roadmap.' },
  ],
}

export function AIProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState('dashboard')
  const [extraContext, setExtraContext] = useState('') // e.g. the selected phase/question text
  const [pending, setPending] = useState(null) // a prompt to auto-send when panel opens

  const openAI = useCallback((opts = {}) => {
    if (opts.section) setSection(opts.section)
    if (opts.context != null) setExtraContext(opts.context)
    if (opts.prompt) setPending({ text: opts.prompt, ts: Date.now() })
    setOpen(true)
  }, [])

  const closeAI = useCallback(() => setOpen(false), [])
  const consumePending = useCallback(() => setPending(null), [])

  const value = useMemo(
    () => ({ open, setOpen, openAI, closeAI, section, setSection, extraContext, setExtraContext, pending, consumePending }),
    [open, openAI, closeAI, section, extraContext, pending, consumePending]
  )

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>
}

export function useAI() {
  const ctx = useContext(AIContext)
  if (!ctx) throw new Error('useAI must be used within AIProvider')
  return ctx
}
