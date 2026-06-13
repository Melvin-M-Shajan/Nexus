import { create } from 'zustand'
import { freePathData } from '../data/freePathData'
import { udemyPathData } from '../data/udemyPathData'

// No secret is shipped in source. For optional local-only convenience you can set
// VITE_GEMINI_API_KEY in a gitignored .env.local; otherwise users add their own key
// in Settings, stored only in their browser and sent only to Google's API.
const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const PATHS = ['free', 'udemy']
const pathData = { free: freePathData, udemy: udemyPathData }

const k = (path, name) => `nexus_${path}_${name}`

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full / unavailable */
  }
}

// ---- starter todos per path ----
const STARTER_TODOS = {
  free: [
    { text: 'Set up Python environment (pyenv + venv)', phase: 'phase1', column: 'thisweek', priority: 'high', type: 'project' },
    { text: 'Watch freeCodeCamp Python (hrs 1–10)', phase: 'phase1', column: 'backlog', priority: 'high', type: 'video' },
    { text: 'Build web scraper project', phase: 'phase1', column: 'backlog', priority: 'medium', type: 'project' },
    { text: 'Create GitHub repo for all projects', phase: 'phase1', column: 'thisweek', priority: 'medium', type: 'project' },
    { text: 'Set OpenAI API key + spending limit', phase: 'phase3', column: 'backlog', priority: 'high', type: 'project' },
    { text: 'Watch Karpathy Zero to Hero (all 8 videos)', phase: 'phase3', column: 'backlog', priority: 'high', type: 'video' },
    { text: 'Clone mlabonne/llm-course and bookmark roadmap', phase: 'phase3', column: 'backlog', priority: 'low', type: 'reading' },
  ],
  udemy: [
    { text: 'Buy Angela Yu course on Udemy (wait for sale <₹499)', phase: 'phase1', column: 'thisweek', priority: 'high', type: 'reading' },
    { text: 'Complete Angela Yu Days 1-30', phase: 'phase1', column: 'backlog', priority: 'high', type: 'video' },
    { text: 'Complete Angela Yu Days 31-60', phase: 'phase1', column: 'backlog', priority: 'medium', type: 'video' },
    { text: 'Buy ML A-Z course (Python sections only)', phase: 'phase2', column: 'backlog', priority: 'medium', type: 'reading' },
    { text: 'Buy Ed Donner LLM Engineering (wait for sale)', phase: 'phase3', column: 'backlog', priority: 'high', type: 'reading' },
  ],
}

let TODO_SEQ = Date.now()
const uid = () => `t_${(TODO_SEQ++).toString(36)}`

function seedTodos(path) {
  const existing = load(k(path, 'todos'), null)
  if (existing) return existing
  const seeded = STARTER_TODOS[path].map((t) => ({
    id: uid(),
    done: t.column === 'done',
    createdAt: Date.now(),
    due: '',
    ...t,
  }))
  save(k(path, 'todos'), seeded)
  return seeded
}

function defaultCosts(path) {
  return path === 'free'
    ? { spent: 0, budget: 100, hoursPerDay: 1, model: 'gpt-4o-mini', hoursLogged: 0 }
    : { coursesBought: {}, spent: 0, hoursLogged: 0 }
}

function loadPath(path) {
  return {
    phaseProgress: load(k(path, 'phase_progress'), {}),
    projectCompletion: load(k(path, 'project_completion'), {}),
    resourceCompletion: load(k(path, 'resource_completion'), {}),
    phaseComplete: load(k(path, 'phase_complete'), {}),
    interviewStatus: load(k(path, 'interview_status'), {}),
    leetcodeStatus: load(k(path, 'leetcode_status'), {}),
    todos: seedTodos(path),
    heatmap: load(k(path, 'activity_heatmap'), {}),
    notes: load(k(path, 'notes'), {}),
    costs: load(k(path, 'costs'), defaultCosts(path)),
  }
}

const useStore = create((set, get) => ({
  currentPath: load('nexus_current_path', 'free'),
  theme: load('nexus_theme', 'dark'),
  geminiKey: (() => {
    const stored = localStorage.getItem('nexus_gemini_key')
    if (stored) {
      try {
        const decoded = atob(stored)
        return decoded
      } catch {
        return ''
      }
    }
    return DEFAULT_GEMINI_KEY
  })(),
  onboarded: load('nexus_onboarded', false),
  settings: load('nexus_settings', { startDate: '2026-01-01', hoursPerDay: 2 }),
  chatHistory: load('nexus_gemini_chat_history', []),
  toasts: [],
  data: { free: loadPath('free'), udemy: loadPath('udemy') },

  // ---------- path ----------
  setPath(path) {
    if (!PATHS.includes(path) || path === get().currentPath) return
    save('nexus_current_path', path)
    set({ currentPath: path })
    get().addToast(`Switched to ${path.toUpperCase()} Path — progress saved`, path === 'free' ? 'success' : 'gold')
  },

  // ---------- theme ----------
  setTheme(theme) {
    save('nexus_theme', theme)
    set({ theme })
  },

  // ---------- gemini ----------
  setGeminiKey(key) {
    if (key) localStorage.setItem('nexus_gemini_key', btoa(key))
    else localStorage.removeItem('nexus_gemini_key')
    set({ geminiKey: key })
    if (key) get().addToast('Gemini API key saved locally', 'success')
  },

  // ---------- onboarding ----------
  completeOnboarding({ path, key, hoursPerDay, startDate }) {
    if (path) get().setPath(path)
    if (key) get().setGeminiKey(key)
    const settings = { ...get().settings }
    if (hoursPerDay) settings.hoursPerDay = hoursPerDay
    if (startDate) settings.startDate = startDate
    save('nexus_settings', settings)
    save('nexus_onboarded', true)
    set({ onboarded: true, settings })
  },

  setSettings(patch) {
    const settings = { ...get().settings, ...patch }
    save('nexus_settings', settings)
    set({ settings })
  },

  // ---------- helpers to mutate current-path data ----------
  _update(field, storageName, updater) {
    const path = get().currentPath
    const data = get().data
    const current = data[path][field]
    const next = updater(current)
    save(k(path, storageName), next)
    set({ data: { ...data, [path]: { ...data[path], [field]: next } } })
  },

  toggleProject(phaseId, index, total) {
    get()._update('projectCompletion', 'project_completion', (pc) => {
      const arr = (pc[phaseId] || new Array(total).fill(false)).slice()
      arr[index] = !arr[index]
      return { ...pc, [phaseId]: arr }
    })
  },

  toggleResource(phaseId, index, total) {
    get()._update('resourceCompletion', 'resource_completion', (rc) => {
      const arr = (rc[phaseId] || new Array(total).fill(false)).slice()
      arr[index] = !arr[index]
      return { ...rc, [phaseId]: arr }
    })
  },

  markPhaseComplete(phase) {
    const phaseId = phase.id
    const projTotal = phase.projects?.length || 0
    const resTotal = phase.resources?.length || 0
    get()._update('projectCompletion', 'project_completion', (pc) => ({
      ...pc,
      [phaseId]: new Array(projTotal).fill(true),
    }))
    get()._update('resourceCompletion', 'resource_completion', (rc) => ({
      ...rc,
      [phaseId]: new Array(resTotal).fill(true),
    }))
    get()._update('phaseComplete', 'phase_complete', (p) => ({ ...p, [phaseId]: true }))
    get().addToast(`Phase complete: ${phase.title} 🎉`, 'success')
  },

  setNote(phaseId, text) {
    get()._update('notes', 'notes', (n) => ({ ...n, [phaseId]: text }))
  },

  setInterviewStatus(qid, status) {
    get()._update('interviewStatus', 'interview_status', (s) => ({ ...s, [qid]: status }))
  },

  setLeetcodeStatus(id, status) {
    get()._update('leetcodeStatus', 'leetcode_status', (s) => ({ ...s, [id]: status }))
  },

  toggleHeatmap(dateStr) {
    get()._update('heatmap', 'activity_heatmap', (h) => {
      const next = { ...h }
      if (next[dateStr]) delete next[dateStr]
      else next[dateStr] = true
      return next
    })
  },

  markToday() {
    const today = new Date().toISOString().slice(0, 10)
    const h = get().data[get().currentPath].heatmap
    if (!h[today]) {
      get().toggleHeatmap(today)
      get().addToast('Marked today as studied 🔥', 'success')
    }
  },

  // ---------- todos ----------
  addTodo(todo) {
    const t = {
      id: uid(),
      text: todo.text || 'New task',
      phase: todo.phase || '',
      priority: todo.priority || 'medium',
      type: todo.type || 'project',
      due: todo.due || '',
      column: todo.column || 'backlog',
      done: false,
      createdAt: Date.now(),
    }
    get()._update('todos', 'todos', (list) => [...list, t])
    return t
  },
  updateTodo(id, patch) {
    get()._update('todos', 'todos', (list) =>
      list.map((t) => (t.id === id ? { ...t, ...patch } : t))
    )
  },
  moveTodo(id, column) {
    get()._update('todos', 'todos', (list) =>
      list.map((t) => (t.id === id ? { ...t, column, done: column === 'done' } : t))
    )
  },
  toggleTodoDone(id) {
    get()._update('todos', 'todos', (list) =>
      list.map((t) =>
        t.id === id ? { ...t, done: !t.done, column: !t.done ? 'done' : 'thisweek' } : t
      )
    )
  },
  deleteTodo(id) {
    get()._update('todos', 'todos', (list) => list.filter((t) => t.id !== id))
  },
  archiveCompleted() {
    get()._update('todos', 'todos', (list) => list.filter((t) => !t.done))
    get().addToast('Completed tasks archived', 'success')
  },

  // ---------- costs ----------
  setCosts(patch) {
    get()._update('costs', 'costs', (c) => ({ ...c, ...patch }))
  },
  toggleCourseBought(phaseId) {
    get()._update('costs', 'costs', (c) => ({
      ...c,
      coursesBought: { ...(c.coursesBought || {}), [phaseId]: !c.coursesBought?.[phaseId] },
    }))
  },

  // ---------- chat ----------
  setChatHistory(history) {
    const trimmed = history.slice(-20)
    save('nexus_gemini_chat_history', trimmed)
    set({ chatHistory: trimmed })
  },
  clearChat() {
    save('nexus_gemini_chat_history', [])
    set({ chatHistory: [] })
  },

  // ---------- toasts ----------
  addToast(message, kind = 'info') {
    const id = uid()
    set({ toasts: [...get().toasts, { id, message, kind }] })
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) })
    }, 3200)
  },
  dismissToast(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },

  // ---------- data management ----------
  resetCurrentPath() {
    const path = get().currentPath
    ;['phase_progress', 'project_completion', 'resource_completion', 'phase_complete',
      'interview_status', 'leetcode_status', 'todos', 'activity_heatmap', 'notes', 'costs'].forEach(
      (name) => localStorage.removeItem(k(path, name))
    )
    const fresh = loadPath(path)
    set({ data: { ...get().data, [path]: fresh } })
    get().addToast(`Reset ${path.toUpperCase()} path progress`, 'gold')
  },

  exportData() {
    const dump = {}
    for (const key in localStorage) {
      if (key.startsWith('nexus_')) dump[key] = localStorage.getItem(key)
    }
    return JSON.stringify(dump, null, 2)
  },
  importData(json) {
    try {
      const dump = JSON.parse(json)
      Object.entries(dump).forEach(([key, val]) => {
        if (key.startsWith('nexus_')) localStorage.setItem(key, val)
      })
      set({
        currentPath: load('nexus_current_path', 'free'),
        theme: load('nexus_theme', 'dark'),
        settings: load('nexus_settings', get().settings),
        chatHistory: load('nexus_gemini_chat_history', []),
        data: { free: loadPath('free'), udemy: loadPath('udemy') },
      })
      get().addToast('Data imported successfully', 'success')
      return true
    } catch {
      get().addToast('Import failed — invalid JSON', 'danger')
      return false
    }
  },
}))

// ---- selectors / derived helpers ----
export function phaseProgress(phase, projectCompletion, resourceCompletion) {
  const projTotal = phase.projects?.length || 0
  const resTotal = phase.resources?.length || 0
  const total = projTotal + resTotal
  if (total === 0) return 0
  const projDone = (projectCompletion[phase.id] || []).filter(Boolean).length
  const resDone = (resourceCompletion[phase.id] || []).filter(Boolean).length
  return (projDone + resDone) / total
}

export function overallProgress(phases, projectCompletion, resourceCompletion) {
  if (!phases.length) return 0
  const sum = phases.reduce(
    (acc, p) => acc + phaseProgress(p, projectCompletion, resourceCompletion),
    0
  )
  return sum / phases.length
}

export function computeStreak(heatmap) {
  let streak = 0
  const d = new Date()
  // allow today not yet marked: start from today, but if today missing start from yesterday
  if (!heatmap[d.toISOString().slice(0, 10)]) d.setDate(d.getDate() - 1)
  for (;;) {
    const key = d.toISOString().slice(0, 10)
    if (heatmap[key]) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
}

export function getPathData(path) {
  return pathData[path]
}

export default useStore
