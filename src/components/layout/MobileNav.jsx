import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X, Bot } from 'lucide-react'
import { NAV_ITEMS, MOBILE_TABS } from './navConfig'
import { useAI } from '../ui/AIContext'
import PathToggle from '../ui/PathToggle'
import { HexLogo } from './Sidebar'

export default function MobileNav({ drawerOpen, setDrawerOpen }) {
  const { openAI } = useAI()
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  const handleTab = (tab) => {
    if (tab.action === 'ai') openAI()
    else if (tab.action === 'more') setMoreOpen(true)
  }

  return (
    <>
      {/* bottom tab bar */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-[var(--border-subtle)] bg-[var(--bg-deep)]/95 backdrop-blur-xl md:hidden">
        {MOBILE_TABS.map((tab) => {
          const active = tab.to && location.pathname === tab.to
          const inner = (
            <span className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${active ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`}>
              <tab.icon size={20} />
              {tab.label}
            </span>
          )
          return tab.to ? (
            <NavLink key={tab.label} to={tab.to} className="flex flex-1">
              {inner}
            </NavLink>
          ) : (
            <button key={tab.label} onClick={() => handleTab(tab)} className="flex flex-1">
              {inner}
            </button>
          )
        })}
      </nav>

      {/* "More" bottom sheet */}
      {moreOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setMoreOpen(false)} />
          <div className="slide-up fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-[var(--border-glow)] bg-[var(--bg-deep)] p-4 md:hidden">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display font-bold">All Sections</span>
              <button onClick={() => setMoreOpen(false)} className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
            <div className="mb-4 flex justify-center">
              <PathToggle size="sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-[11px] font-medium ${
                      isActive
                        ? 'border-[var(--accent-cyan)]/50 bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
                    }`
                  }
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </>
      )}

      {/* left drawer (hamburger) */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-[var(--border-glow)] bg-[var(--bg-deep)] p-4 md:hidden" style={{ animation: 'slide-in-right 0ms' }}>
            <div className="mb-5 flex items-center gap-2">
              <HexLogo size={28} />
              <div>
                <div className="font-display text-lg font-bold text-glow">NEXUS</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)]">Roadmap 2026</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="ml-auto rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
                        : 'text-[var(--text-secondary)] hover:bg-white/[0.03]'
                    }`
                  }
                >
                  <item.icon size={18} /> {item.label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setDrawerOpen(false)
                  openAI()
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-white/[0.03]"
              >
                <Bot size={18} /> AI Assistant
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  )
}
