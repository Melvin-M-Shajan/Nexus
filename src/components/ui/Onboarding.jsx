import { useState } from 'react'
import { Rocket, KeyRound, Clock, ArrowRight, Check } from 'lucide-react'
import useStore from '../../store/useStore'
import { HexLogo } from '../layout/Sidebar'

export default function Onboarding() {
  const completeOnboarding = useStore((s) => s.completeOnboarding)
  const geminiKey = useStore((s) => s.geminiKey)
  const [step, setStep] = useState(0)
  const [path, setPath] = useState('free')
  const [key, setKey] = useState(geminiKey || '')
  const [hours, setHours] = useState(2)

  const finish = () =>
    completeOnboarding({ path, key: key.trim(), hoursPerDay: hours, startDate: new Date().toISOString().slice(0, 10) })

  const weeks = Math.round((28 * 2) / hours)

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-[var(--bg-void)]/90 backdrop-blur-md" />
      <div className="relative my-auto max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border-glow)] bg-[var(--bg-deep)] shadow-2xl section-in">
        {/* header */}
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-6 py-5">
          <HexLogo size={34} />
          <div>
            <div className="font-display text-xl font-bold text-glow">NEXUS</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">AI Engineer Roadmap 2026</div>
          </div>
        </div>

        {/* progress dots */}
        <div className="flex gap-1.5 px-6 pt-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= step ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        <div className="px-6 py-6">
          {step === 0 && (
            <div className="section-in">
              <div className="mb-1 flex items-center gap-2 text-[var(--accent-cyan)]">
                <Rocket size={18} /> <span className="font-mono text-xs uppercase tracking-wider">Step 1 of 3</span>
              </div>
              <h2 className="mb-1 font-display text-2xl font-bold">Choose your path</h2>
              <p className="mb-5 text-sm text-[var(--text-secondary)]">Switch anytime — progress is saved separately per path.</p>
              <div className="grid grid-cols-2 gap-3">
                <PathOption active={path === 'free'} onClick={() => setPath('free')} title="Free Path" sub="YouTube & open-source" cost="₹0" color="var(--accent-green)" />
                <PathOption active={path === 'udemy'} onClick={() => setPath('udemy')} title="Udemy Path" sub="Paid courses" cost="~₹2,994" color="var(--accent-gold)" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="section-in">
              <div className="mb-1 flex items-center gap-2 text-[var(--accent-cyan)]">
                <KeyRound size={18} /> <span className="font-mono text-xs uppercase tracking-wider">Step 2 of 3</span>
              </div>
              <h2 className="mb-1 font-display text-2xl font-bold">Add your Gemini key</h2>
              <p className="mb-5 text-sm text-[var(--text-secondary)]">Optional — powers the AI mentor. Paste your own free Gemini key; it's stored only in your browser and never sent anywhere except Google's API. You can add it later in Settings.</p>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Paste Gemini API key (optional)…"
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]"
              />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-[var(--accent-cyan)] hover:underline">
                Get a free key from Google AI Studio →
              </a>
            </div>
          )}

          {step === 2 && (
            <div className="section-in">
              <div className="mb-1 flex items-center gap-2 text-[var(--accent-cyan)]">
                <Clock size={18} /> <span className="font-mono text-xs uppercase tracking-wider">Step 3 of 3</span>
              </div>
              <h2 className="mb-1 font-display text-2xl font-bold">Set your pace</h2>
              <p className="mb-5 text-sm text-[var(--text-secondary)]">How many hours per day can you commit?</p>
              <div className="mb-2 text-center font-mono text-4xl font-bold text-[var(--accent-cyan)]">{hours}h<span className="text-base text-[var(--text-secondary)]">/day</span></div>
              <input type="range" min="1" max="8" step="0.5" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full" />
              <div className="mt-5 rounded-xl border border-[var(--border-glow)] bg-[var(--accent-cyan)]/5 p-4 text-center">
                <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Estimated to job-ready</div>
                <div className="font-mono text-2xl font-bold text-[var(--accent-gold)]">~{weeks} weeks</div>
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-6 py-4">
          <button onClick={finish} className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Skip</button>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Back
              </button>
            )}
            {step < 2 ? (
              <button onClick={() => setStep((s) => s + 1)} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-bold text-[#02060d]">
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button onClick={finish} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-bold text-[#02060d]">
                <Check size={15} /> Launch NEXUS
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PathOption({ active, onClick, title, sub, cost, color }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border p-4 text-left transition-all"
      style={{
        borderColor: active ? color : 'var(--border-subtle)',
        background: active ? `${color}12` : 'rgba(255,255,255,0.02)',
        boxShadow: active ? `0 0 16px ${color}40` : 'none',
      }}
    >
      <div className="font-display text-lg font-bold" style={{ color: active ? color : 'var(--text-primary)' }}>{title}</div>
      <div className="text-xs text-[var(--text-secondary)]">{sub}</div>
      <div className="mt-2 font-mono text-sm font-bold" style={{ color }}>{cost}</div>
    </button>
  )
}
