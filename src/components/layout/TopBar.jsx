import { Link } from 'react-router-dom'
import { Command, Bot, Settings as SettingsIcon, Menu } from 'lucide-react'
import PathToggle from '../ui/PathToggle'
import { HexLogo } from './Sidebar'
import { useAI } from '../ui/AIContext'

export default function TopBar({ onOpenPalette, onOpenDrawer }) {
  const { openAI } = useAI()
  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-void)]/80 px-3 backdrop-blur-xl sm:px-5">
      {/* left: mobile menu + logo / desktop title */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <button onClick={onOpenDrawer} className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/5 md:hidden">
          <Menu size={20} />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 md:hidden">
          <HexLogo size={26} />
          <span className="font-display text-base font-bold tracking-wide">NEXUS</span>
        </Link>
        <div className="hidden md:block truncate">
          <div className="font-display text-sm font-semibold text-[var(--text-secondary)]">
            AI Engineer Roadmap <span className="text-[var(--accent-cyan)]">2026</span>
          </div>
        </div>
      </div>

      {/* center: path toggle (truly centered) */}
      <div className="hidden shrink-0 sm:block">
        <PathToggle />
      </div>

      {/* right actions */}
      <div className="flex flex-1 items-center justify-end gap-1.5">
        <button
          onClick={onOpenPalette}
          className="hidden items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-white/[0.02] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--border-glow)] hover:text-[var(--text-primary)] sm:flex"
        >
          <Command size={14} />
          <span className="font-mono">K</span>
        </button>
        <button onClick={onOpenPalette} className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/5 sm:hidden">
          <Command size={18} />
        </button>
        <button
          onClick={() => openAI()}
          className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--accent-cyan)]"
          title="AI Assistant"
        >
          <Bot size={18} />
        </button>
        <Link to="/settings" className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]" title="Settings">
          <SettingsIcon size={18} />
        </Link>
      </div>
    </header>
  )
}
