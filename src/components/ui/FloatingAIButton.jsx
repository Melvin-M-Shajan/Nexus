import { Bot } from 'lucide-react'
import MagneticButton from './MagneticButton'
import { useAI } from './AIContext'

export default function FloatingAIButton() {
  const { open, openAI } = useAI()
  if (open) return null
  return (
    <MagneticButton
      onClick={() => openAI()}
      strength={0.25}
      className="no-print fixed bottom-20 right-4 z-30 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-[#02060d] shadow-lg md:bottom-6 md:right-6"
      style={{
        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
        boxShadow: '0 0 24px rgba(0,212,255,0.5)',
      }}
      aria-label="Open AI assistant"
    >
      <Bot size={18} /> Ask AI
    </MagneticButton>
  )
}
