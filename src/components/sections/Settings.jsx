import { useEffect, useRef, useState } from 'react'
import { Settings as SettingsIcon, KeyRound, Eye, EyeOff, Palette, Trash2, Download, Upload, Info, Check } from 'lucide-react'
import PageHeader from '../ui/PageHeader'
import GlassCard from '../ui/GlassCard'
import PathToggle from '../ui/PathToggle'
import useStore from '../../store/useStore'
import useProgress from '../../hooks/useProgress'
import { useAI } from '../ui/AIContext'
import { GEMINI_MODEL_LABEL } from '../../hooks/useGemini'

export default function Settings() {
  const geminiKey = useStore((s) => s.geminiKey)
  const setGeminiKey = useStore((s) => s.setGeminiKey)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const currentPath = useStore((s) => s.currentPath)
  const resetCurrentPath = useStore((s) => s.resetCurrentPath)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const addToast = useStore((s) => s.addToast)
  const { overall, projectsBuilt, projectsTotal, streak } = useProgress()
  const { setSection } = useAI()

  const [keyInput, setKeyInput] = useState(geminiKey || '')
  const [showKey, setShowKey] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => setSection('settings'), [setSection])
  useEffect(() => setKeyInput(geminiKey || ''), [geminiKey])

  const saveKey = () => setGeminiKey(keyInput.trim())

  const doExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexus-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Data exported', 'success')
  }

  const doImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => importData(String(reader.result))
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="section-in max-w-3xl">
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Keys, theme, data — all stored in your browser" />

      {/* Gemini key */}
      <GlassCard className="mb-5 p-5">
        <p className="mb-1 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <KeyRound size={16} className="text-[var(--accent-cyan)]" /> AI Assistant Setup
        </p>
        <p className="mb-3 text-xs text-[var(--text-secondary)]">Model: {GEMINI_MODEL_LABEL}</p>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] px-3 focus-within:border-[var(--accent-cyan)]">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your Gemini API key…"
              className="flex-1 bg-transparent py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-dim)]"
            />
            <button onClick={() => setShowKey((v) => !v)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button onClick={saveKey} className="rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-sm font-bold text-[#02060d]">Save</button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--accent-green)]">
          <Check size={13} /> Key saved locally (base64) — never sent to any server except Google's API.
        </p>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-[var(--accent-cyan)] hover:underline">
          Get a free Gemini API key →
        </a>
      </GlassCard>

      {/* path + theme */}
      <div className="mb-5 grid gap-5 sm:grid-cols-2">
        <GlassCard className="p-5">
          <p className="mb-3 font-semibold text-[var(--text-primary)]">Learning Path</p>
          <PathToggle />
        </GlassCard>
        <GlassCard className="p-5">
          <p className="mb-3 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            <Palette size={16} className="text-[var(--accent-purple)]" /> Theme
          </p>
          <div className="flex gap-2">
            {[
              ['dark', 'Dark'],
              ['amoled', 'AMOLED'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  theme === id ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]' : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* data management */}
      <GlassCard className="mb-5 p-5">
        <p className="mb-3 font-semibold text-[var(--text-primary)]">Data</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={doExport} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Download size={15} /> Export JSON
          </button>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Upload size={15} /> Import JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={doImport} className="hidden" />

          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent-red)]/40 px-3 py-2 text-sm font-semibold text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10">
              <Trash2 size={15} /> Reset {currentPath} progress
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--accent-red)]/40 bg-[var(--accent-red)]/10 px-3 py-1.5 text-sm">
              <span className="text-[var(--text-secondary)]">Sure?</span>
              <button onClick={() => { resetCurrentPath(); setConfirmReset(false) }} className="font-bold text-[var(--accent-red)]">Reset</button>
              <button onClick={() => setConfirmReset(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
            </span>
          )}
        </div>
      </GlassCard>

      {/* about */}
      <GlassCard className="p-5">
        <p className="mb-3 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <Info size={16} className="text-[var(--accent-cyan)]" /> About NEXUS
        </p>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          NEXUS is your mission control for becoming an AI Engineer in 2026 — a single-file, offline-first roadmap tracker with an AI mentor. No backend, no account, all data lives in your browser.
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat value={`${Math.round(overall * 100)}%`} label="Overall" />
          <Stat value={`${projectsBuilt}/${projectsTotal}`} label="Projects" />
          <Stat value={streak} label="Day streak" />
        </div>
      </GlassCard>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-white/[0.02] p-3">
      <div className="font-mono text-xl font-bold text-[var(--accent-cyan)]">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">{label}</div>
    </div>
  )
}
