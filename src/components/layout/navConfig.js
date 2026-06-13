import {
  LayoutDashboard,
  Map,
  BookOpen,
  Clock,
  Target,
  Code2,
  ClipboardList,
  CheckSquare,
  Wallet,
  Bot,
  Settings,
} from 'lucide-react'

// `section` maps to AI context + command palette grouping.
export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' },
  { to: '/roadmap', label: 'Roadmap', icon: Map, section: 'roadmap' },
  { to: '/resources', label: 'Resources', icon: BookOpen, section: 'roadmap' },
  { to: '/timeline', label: 'Timeline', icon: Clock, section: 'timeline' },
  { to: '/interview', label: 'Interview Prep', icon: Target, section: 'interview' },
  { to: '/leetcode', label: 'LeetCode', icon: Code2, section: 'leetcode' },
  { to: '/cheatsheet', label: 'Cheat Sheet', icon: ClipboardList, section: 'cheatsheet' },
  { to: '/todo', label: 'To-Do List', icon: CheckSquare, section: 'todo' },
  { to: '/cost', label: 'Cost Tracker', icon: Wallet, section: 'cost' },
  { to: '/settings', label: 'Settings', icon: Settings, section: 'settings' },
]

// secondary action that opens the AI panel (not a route)
export const AI_NAV = { label: 'AI Assistant', icon: Bot, section: 'ai', action: 'ai' }

// 5 main tabs for the mobile bottom bar
export const MOBILE_TABS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/interview', label: 'Interview', icon: Target },
  { action: 'ai', label: 'AI', icon: Bot },
  { action: 'more', label: 'More', icon: ClipboardList },
]
