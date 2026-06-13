import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeft, Bot } from 'lucide-react'
import { NAV_ITEMS, AI_NAV } from './navConfig'
import { useAI } from '../ui/AIContext'

export default function Sidebar({ collapsed, setCollapsed }) {
  const { openAI } = useAI()

  return (
    <aside
      className={`no-print sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-deep)]/60 backdrop-blur-md transition-[width] duration-300 md:flex ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* logo */}
      <div className="flex h-16 items-center gap-2 px-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center text-[var(--accent-cyan)]">
          <HexLogo />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <div className="font-display text-lg font-bold tracking-wide text-glow">NEXUS</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">Roadmap 2026</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--accent-cyan)]/10 text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-white/[0.03] hover:text-[var(--text-primary)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)]" />
                )}
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {/* AI assistant (opens panel) */}
        <button
          onClick={() => openAI()}
          title={collapsed ? AI_NAV.label : undefined}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-white/[0.03] hover:text-[var(--accent-cyan)]"
        >
          <Bot size={18} className="shrink-0" />
          {!collapsed && <span className="truncate">{AI_NAV.label}</span>}
        </button>
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="m-2 flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        {collapsed ? <PanelLeft size={16} /> : <><PanelLeftClose size={16} /> Collapse</>}
      </button>
    </aside>
  )
}

export function HexLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="hexg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00D4FF" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <path d="M32 6 L54 19 L54 45 L32 58 L10 45 L10 19 Z" fill="none" stroke="url(#hexg)" strokeWidth="3" />
      <circle cx="32" cy="32" r="6" fill="url(#hexg)" />
    </svg>
  )
}
