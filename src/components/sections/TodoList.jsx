import { useEffect, useMemo, useRef, useState } from 'react'
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core'
import { CheckSquare, Plus, Trash2, GripVertical, Bot, Download, LayoutGrid, List, Archive, X } from 'lucide-react'
import PageHeader from '../ui/PageHeader'
import GlassCard from '../ui/GlassCard'
import useStore from '../../store/useStore'
import useCopy from '../../hooks/useCopy'
import { useAI } from '../ui/AIContext'
import { PHASE_LABELS, PRIORITY_META } from '../../data/sharedData'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'thisweek', label: 'This Week' },
  { id: 'inprogress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]
const TYPES = ['video', 'project', 'reading']

export default function TodoList() {
  const data = useStore((s) => s.data[s.currentPath])
  const addTodo = useStore((s) => s.addTodo)
  const moveTodo = useStore((s) => s.moveTodo)
  const deleteTodo = useStore((s) => s.deleteTodo)
  const updateTodo = useStore((s) => s.updateTodo)
  const archiveCompleted = useStore((s) => s.archiveCompleted)
  const copy = useCopy()
  const { setSection, openAI } = useAI()

  const [mode, setMode] = useState('kanban')
  const [filters, setFilters] = useState({ phase: 'all', priority: 'all', type: 'all' })
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ text: '', phase: 'phase1', priority: 'medium', type: 'project', due: '', column: 'backlog' })
  const addInputRef = useRef(null)

  useEffect(() => setSection('todo'), [setSection])

  // quick-add with "T"
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 't' && !adding && !/input|textarea/i.test(e.target.tagName)) {
        e.preventDefault()
        setAdding(true)
        setTimeout(() => addInputRef.current?.focus(), 30)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [adding])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } })
  )

  const filtered = useMemo(
    () =>
      data.todos.filter(
        (t) =>
          (filters.phase === 'all' || t.phase === filters.phase) &&
          (filters.priority === 'all' || t.priority === filters.priority) &&
          (filters.type === 'all' || t.type === filters.type)
      ),
    [data.todos, filters]
  )

  const byColumn = (col) => filtered.filter((t) => t.column === col)

  const submit = () => {
    if (!draft.text.trim()) return
    addTodo(draft)
    setDraft({ ...draft, text: '', due: '' })
    setTimeout(() => addInputRef.current?.focus(), 20)
  }

  const onDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) moveTodo(active.id, over.id)
  }

  const exportMd = () => {
    let md = `# NEXUS Todos\n\n`
    COLUMNS.forEach((c) => {
      md += `## ${c.label}\n`
      const items = data.todos.filter((t) => t.column === c.id)
      if (!items.length) md += `_none_\n`
      items.forEach((t) => {
        md += `- [${t.done ? 'x' : ' '}] ${t.text}${t.phase ? ` _(${PHASE_LABELS[t.phase] || t.phase})_` : ''}${t.due ? ` — due ${t.due}` : ''}\n`
      })
      md += `\n`
    })
    copy(md, 'Todo list copied as markdown')
  }

  return (
    <div className="section-in">
      <PageHeader
        icon={CheckSquare}
        title="To-Do List"
        subtitle="Kanban board · press T to quick-add"
        right={
          <div className="flex items-center gap-2">
            <button onClick={() => setMode(mode === 'kanban' ? 'list' : 'kanban')} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              {mode === 'kanban' ? <List size={14} /> : <LayoutGrid size={14} />} {mode === 'kanban' ? 'List' : 'Board'}
            </button>
            <button onClick={exportMd} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <Download size={14} /> Export
            </button>
          </div>
        }
      />

      {/* toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => { setAdding(true); setTimeout(() => addInputRef.current?.focus(), 30) }} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-cyan)] px-3 py-2 text-xs font-bold text-[#02060d]">
          <Plus size={14} /> Add task
        </button>
        <button onClick={() => openAI({ section: 'todo' })} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-glow)] px-3 py-2 text-xs font-semibold text-[var(--accent-cyan)] hover:bg-white/5">
          <Bot size={14} /> AI suggest tasks
        </button>
        <button onClick={archiveCompleted} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <Archive size={14} /> Archive done
        </button>

        <div className="ml-auto flex flex-wrap gap-2">
          <Select value={filters.phase} onChange={(v) => setFilters({ ...filters, phase: v })} options={[['all', 'All phases'], ...Object.entries(PHASE_LABELS)]} />
          <Select value={filters.priority} onChange={(v) => setFilters({ ...filters, priority: v })} options={[['all', 'All priority'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']]} />
          <Select value={filters.type} onChange={(v) => setFilters({ ...filters, type: v })} options={[['all', 'All types'], ...TYPES.map((t) => [t, t])]} />
        </div>
      </div>

      {/* add form */}
      {adding && (
        <GlassCard className="mb-4 p-4 section-in">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[200px] flex-1">
              <input
                ref={addInputRef}
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setAdding(false) }}
                placeholder="Task description…"
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]"
              />
            </div>
            <Select value={draft.phase} onChange={(v) => setDraft({ ...draft, phase: v })} options={Object.entries(PHASE_LABELS)} />
            <Select value={draft.priority} onChange={(v) => setDraft({ ...draft, priority: v })} options={[['high', 'High'], ['medium', 'Medium'], ['low', 'Low']]} />
            <Select value={draft.type} onChange={(v) => setDraft({ ...draft, type: v })} options={TYPES.map((t) => [t, t])} />
            <Select value={draft.column} onChange={(v) => setDraft({ ...draft, column: v })} options={COLUMNS.map((c) => [c.id, c.label])} />
            <input
              type="date"
              value={draft.due}
              onChange={(e) => setDraft({ ...draft, due: e.target.value })}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] px-2 py-2 text-sm text-[var(--text-primary)] outline-none [color-scheme:dark]"
            />
            <button onClick={submit} className="rounded-lg bg-[var(--accent-cyan)] px-3 py-2 text-xs font-bold text-[#02060d]">Add</button>
            <button onClick={() => setAdding(false)} className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/5"><X size={16} /></button>
          </div>
        </GlassCard>
      )}

      {mode === 'kanban' ? (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {COLUMNS.map((col) => (
              <Column key={col.id} col={col} items={byColumn(col.id)} onDelete={deleteTodo} onToggleDone={(id) => updateTodo(id, {})} />
            ))}
          </div>
        </DndContext>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No tasks match these filters.</p>}
          {filtered.map((t) => (
            <GlassCard key={t.id} spotlight={false} className="flex items-center gap-3 p-3">
              <button
                onClick={() => moveTodo(t.id, t.column === 'done' ? 'thisweek' : 'done')}
                className="grid h-5 w-5 shrink-0 place-items-center rounded-md border"
                style={{ borderColor: t.column === 'done' ? 'var(--accent-green)' : 'var(--border-subtle)', background: t.column === 'done' ? 'var(--accent-green)' : 'transparent' }}
              >
                {t.column === 'done' && <CheckSquare size={12} className="text-[#02060d]" />}
              </button>
              <span className="text-sm">{PRIORITY_META[t.priority]?.dot}</span>
              <span className={`flex-1 text-sm ${t.column === 'done' ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>{t.text}</span>
              <span className="hidden font-mono text-[10px] text-[var(--text-secondary)] sm:inline">{PHASE_LABELS[t.phase]}</span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">{COLUMNS.find((c) => c.id === t.column)?.label}</span>
              <button onClick={() => deleteTodo(t.id)} className="text-[var(--text-dim)] hover:text-[var(--accent-red)]"><Trash2 size={14} /></button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}

function Column({ col, items, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-3 transition-colors ${isOver ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5' : 'border-[var(--border-subtle)] bg-white/[0.015]'}`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">{col.label}</span>
        <span className="rounded-full bg-white/8 px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">{items.length}</span>
      </div>
      <div className="min-h-[60px] space-y-2">
        {items.map((t) => (
          <Card key={t.id} todo={t} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

function Card({ todo, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: todo.id })
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-3"
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-0.5 cursor-grab text-[var(--text-dim)] active:cursor-grabbing">
          <GripVertical size={14} />
        </button>
        <span className="text-sm">{PRIORITY_META[todo.priority]?.dot}</span>
        <p className="flex-1 text-sm text-[var(--text-primary)]/90">{todo.text}</p>
        <button onClick={() => onDelete(todo.id)} className="text-[var(--text-dim)] opacity-0 transition-opacity hover:text-[var(--accent-red)] group-hover:opacity-100">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 pl-6 text-[10px] text-[var(--text-secondary)]">
        {todo.phase && <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono">{PHASE_LABELS[todo.phase]}</span>}
        <span className="rounded bg-white/5 px-1.5 py-0.5">{todo.type}</span>
        {todo.due && <span className="font-mono">📅 {todo.due}</span>}
      </div>
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-void)] px-2.5 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)] [color-scheme:dark]"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  )
}
