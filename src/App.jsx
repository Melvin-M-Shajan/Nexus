import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useStore from './store/useStore'
import { AIProvider } from './components/ui/AIContext'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import MobileNav from './components/layout/MobileNav'
import CommandPalette from './components/layout/CommandPalette'
import GeminiChat from './components/ui/GeminiChat'
import FloatingAIButton from './components/ui/FloatingAIButton'
import Toaster from './components/ui/Toaster'
import Onboarding from './components/ui/Onboarding'
import ErrorBoundary from './components/ui/ErrorBoundary'

import Dashboard from './components/sections/Dashboard'
import Roadmap from './components/sections/Roadmap'
import ResourceDeepDive from './components/sections/ResourceDeepDive'
import Timeline from './components/sections/Timeline'
import InterviewPrep from './components/sections/InterviewPrep'
import LeetCode from './components/sections/LeetCode'
import CheatSheet from './components/sections/CheatSheet'
import TodoList from './components/sections/TodoList'
import CostCalculator from './components/sections/CostCalculator'
import Settings from './components/sections/Settings'

export default function App() {
  const theme = useStore((s) => s.theme)
  const currentPath = useStore((s) => s.currentPath)
  const onboarded = useStore((s) => s.onboarded)

  const [collapsed, setCollapsed] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // apply theme + path data attributes
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.path = currentPath
  }, [theme, currentPath])

  // Cmd/Ctrl+K → command palette
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <AIProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenPalette={() => setPaletteOpen(true)} onOpenDrawer={() => setDrawerOpen(true)} />

          <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-5 pb-24 sm:px-5 md:pb-8">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/resources" element={<ResourceDeepDive />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/interview" element={<InterviewPrep />} />
                <Route path="/leetcode" element={<LeetCode />} />
                <Route path="/cheatsheet" element={<CheatSheet />} />
                <Route path="/todo" element={<TodoList />} />
                <Route path="/cost" element={<CostCalculator />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>

        <MobileNav drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
        <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
        <GeminiChat />
        <FloatingAIButton />
        <Toaster />
        {!onboarded && <Onboarding />}
      </div>
    </AIProvider>
  )
}
