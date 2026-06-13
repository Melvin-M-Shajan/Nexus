import { useEffect, useRef, useState } from 'react'
import { Bot, X, Send, Trash2, Square, AlertTriangle, Loader2, Sparkles, KeyRound, Lightbulb } from 'lucide-react'
import { Link } from 'react-router-dom'
import useStore from '../../store/useStore'
import useProgress from '../../hooks/useProgress'
import { useGemini, GEMINI_MODEL_LABEL } from '../../hooks/useGemini'
import { useAI, SECTION_QUICK_ACTIONS } from './AIContext'

// --- lightweight markdown renderer (headings, lists, bold, code) ---
function renderInline(text) {
  const out = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) out.push(<strong key={`${m.index}-b`}>{tok.slice(2, -2)}</strong>)
    else out.push(<code key={`${m.index}-c`}>{tok.slice(1, -1)}</code>)
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out.length ? out : text
}

function renderContent(text) {
  const nodes = []
  const lines = text.split('\n')
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // fenced code block
    if (line.trim().startsWith('```')) {
      const body = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        body.push(lines[i])
        i++
      }
      i++
      nodes.push(
        <pre key={key++}>
          <code>{body.join('\n')}</code>
        </pre>
      )
      continue
    }

    // headings
    const h3 = line.match(/^###\s+(.+)/)
    const h2 = line.match(/^##\s+(.+)/)
    const h1 = line.match(/^#\s+(.+)/)
    if (h3 || h2 || h1) {
      const content = (h3 || h2 || h1)[1]
      const Tag = h1 ? 'h3' : 'h4'
      nodes.push(
        <Tag key={key++} className="chat-md-heading">
          {renderInline(content)}
        </Tag>
      )
      i++
      continue
    }

    // bullet list (-, *, •)
    if (/^[\*\-•]\s+/.test(line.trim())) {
      const items = []
      while (i < lines.length && /^[\*\-•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[\*\-•]\s+/, ''))
        i++
      }
      nodes.push(
        <ul key={key++} className="chat-md-list">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    // numbered list
    if (/^\d+\.\s+/.test(line.trim())) {
      const items = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      nodes.push(
        <ol key={key++} className="chat-md-list chat-md-list--num">
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>
      )
      continue
    }

    // horizontal rule / empty
    if (/^---+$/.test(line.trim()) || line.trim() === '') {
      i++
      continue
    }

    // paragraph
    nodes.push(
      <p key={key++} className="chat-md-p">
        {renderInline(line)}
      </p>
    )
    i++
  }

  return nodes.length ? nodes : text
}

const PANEL_SIZE_KEY = 'nexus_chat_panel_size'
const PANEL_DEFAULTS = { width: 400, heightVh: 90 }
const PANEL_LIMITS = { minW: 300, maxW: 720, minH: 45, maxH: 95 }

function loadPanelSize() {
  try {
    const raw = localStorage.getItem(PANEL_SIZE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        width: Math.min(PANEL_LIMITS.maxW, Math.max(PANEL_LIMITS.minW, parsed.width ?? PANEL_DEFAULTS.width)),
        heightVh: Math.min(PANEL_LIMITS.maxH, Math.max(PANEL_LIMITS.minH, parsed.heightVh ?? PANEL_DEFAULTS.heightVh)),
      }
    }
  } catch {
    /* ignore */
  }
  return { ...PANEL_DEFAULTS }
}

export default function GeminiChat() {
  const { open, closeAI, section, extraContext, pending, consumePending } = useAI()
  const chatHistory = useStore((s) => s.chatHistory)
  const setChatHistory = useStore((s) => s.setChatHistory)
  const clearChat = useStore((s) => s.clearChat)
  const currentPath = useStore((s) => s.currentPath)
  const { overall, currentPhase } = useProgress()
  const { generate, loading, error, hasKey } = useGemini()

  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [panelSize, setPanelSize] = useState(loadPanelSize)
  const abortRef = useRef(null)
  const scrollRef = useRef(null)
  const taRef = useRef(null)
  const panelSizeRef = useRef(panelSize)
  const resizingRef = useRef(null) // 'width' | 'height' | null

  panelSizeRef.current = panelSize

  useEffect(() => {
    const onMove = (e) => {
      const mode = resizingRef.current
      if (!mode) return
      if (mode === 'width') {
        const maxW = Math.min(PANEL_LIMITS.maxW, Math.round(window.innerWidth * 0.75))
        const w = Math.min(maxW, Math.max(PANEL_LIMITS.minW, window.innerWidth - e.clientX))
        setPanelSize((s) => ({ ...s, width: w }))
      } else {
        const vh = ((window.innerHeight - e.clientY) / window.innerHeight) * 100
        const h = Math.min(PANEL_LIMITS.maxH, Math.max(PANEL_LIMITS.minH, vh))
        setPanelSize((s) => ({ ...s, heightVh: Math.round(h * 10) / 10 }))
      }
    }
    const onUp = () => {
      if (!resizingRef.current) return
      resizingRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      localStorage.setItem(PANEL_SIZE_KEY, JSON.stringify(panelSizeRef.current))
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  function startResize(mode) {
    resizingRef.current = mode
    document.body.style.cursor = mode === 'width' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }

  const quickActions = SECTION_QUICK_ACTIONS[section] || SECTION_QUICK_ACTIONS.default

  const systemPrompt = `You are NEXUS AI, an expert AI Engineering mentor integrated into a personal learning roadmap app.
The user is following the ${currentPath.toUpperCase()} path for AI Engineering.
Their current phase: ${currentPhase?.title || 'unknown'} (${currentPhase?.number || '?'})
Their overall progress: ${Math.round(overall * 100)}% complete.
Current section they're viewing: ${section}.
${extraContext ? `Relevant context the user is looking at:\n"""${extraContext}"""` : ''}

Help them learn, answer questions about the roadmap, explain concepts, suggest what to study next, review their understanding, or help debug their projects. Reference specific resources from their roadmap when relevant.

RESPONSE STYLE (critical — follow exactly):

DEFAULT (short) answers — use unless the user explicitly asks to "explain in detail":
- Hard cap: ~80 words or 4 bullet lines. No exceptions.
- Format exactly:
  **Answer:** <one crisp line>
  • **Keyword:** value
  • **Keyword:** value
  • **Why:** one short line
- NO headings (# / ###). NO numbered lists. NO multi-paragraph text. NO long examples.
- NO preamble or filler ("Let's complete…", "Here's a breakdown", "Given that…", "Continued").
- Use the • bullet character only — never raw * or - at line start.
- Bold only the label before each colon (**Size:**, **Overlap:**, **Why:**).

DETAIL mode — only when the user asks to explain in detail / elaborate / go deeper:
- Then use ### headings, numbered steps, and full examples.
- Keep markdown clean: headings, bullets, bold labels — never walls of asterisks.

Never echo or continue a prior partial answer unless the user asks. Each reply stands alone.`

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }

  useEffect(() => {
    if (open) scrollToBottom()
  }, [open, chatHistory, streaming])

  // auto-grow the textarea up to a max height, then scroll internally
  const autoSize = () => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }
  useEffect(() => {
    autoSize()
  }, [input, open])

  async function send(text) {
    const trimmed = (text ?? input).trim()
    if (!trimmed || loading) return
    setInput('')
    const newHistory = [...chatHistory, { role: 'user', content: trimmed }]
    setChatHistory(newHistory)
    setStreaming('')

    const controller = new AbortController()
    abortRef.current = controller
    try {
      const full = await generate({
        history: newHistory,
        system: systemPrompt,
        signal: controller.signal,
        onToken: (t) => {
          setStreaming(t)
          scrollToBottom()
        },
      })
      setChatHistory([...newHistory, { role: 'assistant', content: full }])
      setStreaming('')
    } catch (e) {
      if (e.name === 'AbortError') {
        if (streaming) setChatHistory([...newHistory, { role: 'assistant', content: streaming + ' …(stopped)' }])
      }
      setStreaming('')
    } finally {
      abortRef.current = null
    }
  }

  function stop() {
    abortRef.current?.abort()
  }

  const lastUser = chatHistory.filter((m) => m.role === 'user').slice(-1)[0]?.content?.toLowerCase() || ''
  const askedForDetail = /explain.*detail|in full detail|elaborate|go deeper/.test(lastUser)

  function explainDetail() {
    send('Yes — explain your previous answer in full detail, with examples, context, and step-by-step reasoning.')
  }

  // auto-send a pending prompt when the panel is opened from elsewhere
  useEffect(() => {
    if (open && pending) {
      const p = pending
      consumePending()
      send(p.text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pending])

  if (!open) return null

  return (
    <>
      {/* mobile scrim */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={closeAI} />

      <aside
        className="chat-panel fixed z-50 flex flex-col border-l border-[var(--border-glow)] bg-[var(--bg-deep)]/95 backdrop-blur-xl
                   inset-x-0 bottom-0 rounded-t-2xl slide-up
                   md:inset-y-0 md:right-0 md:left-auto md:rounded-none md:slide-in-right"
        style={{ '--chat-w': `${panelSize.width}px`, '--chat-h': `${panelSize.heightVh}vh` }}
      >
        {/* mobile: drag top edge to resize height */}
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize chat panel height"
          onPointerDown={(e) => {
            e.preventDefault()
            startResize('height')
          }}
          className="chat-panel-resize-y absolute inset-x-0 top-0 z-10 flex h-5 cursor-row-resize items-center justify-center md:hidden"
        >
          <span className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* desktop: drag left edge to resize width */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize chat panel width"
          onPointerDown={(e) => {
            e.preventDefault()
            startResize('width')
          }}
          className="chat-panel-resize-x absolute bottom-0 left-0 top-0 z-10 hidden w-2 cursor-col-resize md:block"
        />
        {/* header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 pb-3 pt-5 md:py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)]">
              <Bot size={18} />
            </span>
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)]">NEXUS AI</div>
              <div className="font-mono text-[10px] text-[var(--text-secondary)]">{GEMINI_MODEL_LABEL}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={clearChat} title="Clear chat" className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]">
              <Trash2 size={16} />
            </button>
            <button onClick={closeAI} title="Close" className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {!hasKey && (
            <div className="rounded-xl border border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/10 p-4 text-sm">
              <div className="mb-1 flex items-center gap-2 font-semibold text-[var(--accent-gold)]">
                <KeyRound size={15} /> No Gemini key set
              </div>
              <p className="text-[var(--text-secondary)]">
                Add your Gemini API key in{' '}
                <Link to="/settings" onClick={closeAI} className="text-[var(--accent-cyan)] underline">
                  Settings
                </Link>{' '}
                to chat. It stays in your browser.
              </p>
            </div>
          )}

          {chatHistory.length === 0 && !streaming && (
            <div className="mt-6 text-center text-[var(--text-secondary)]">
              <Sparkles size={28} className="mx-auto mb-2 text-[var(--accent-cyan)]" />
              <p className="text-sm">Ask me anything about your roadmap, a concept, or a project.</p>
            </div>
          )}

          {chatHistory.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`chat-bubble max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-br-md bg-[var(--accent-cyan)]/15 text-[var(--text-primary)]'
                    : 'rounded-bl-md border border-[var(--border-subtle)] bg-white/[0.03] text-[var(--text-primary)]/95'
                }`}
              >
                {renderContent(m.content)}
              </div>
            </div>
          ))}

          {!loading && !streaming && hasKey && !askedForDetail && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'assistant' && (
            <div className="flex justify-start">
              <button
                onClick={explainDetail}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-cyan)]/40 bg-[var(--accent-cyan)]/10 px-3 py-1.5 text-xs font-medium text-[var(--accent-cyan)] transition-colors hover:bg-[var(--accent-cyan)]/20"
              >
                <Lightbulb size={13} /> Should I explain this in detail?
              </button>
            </div>
          )}

          {streaming && (
            <div className="flex justify-start">
              <div className="chat-bubble max-w-[85%] rounded-2xl rounded-bl-md border border-[var(--border-subtle)] bg-white/[0.03] px-3.5 py-2.5 text-sm leading-relaxed text-[var(--text-primary)]/95">
                {renderContent(streaming)}
                <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-[var(--accent-cyan)] align-middle" />
              </div>
            </div>
          )}

          {loading && !streaming && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Loader2 size={15} className="spin" /> Thinking…
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-[var(--accent-red)]/40 bg-[var(--accent-red)]/10 p-3 text-sm">
              <div className="mb-1 flex items-center gap-2 font-semibold text-[var(--accent-red)]">
                <AlertTriangle size={15} /> Something went wrong
              </div>
              <p className="text-[var(--text-secondary)]">{error}</p>
              <button
                onClick={() => send(chatHistory.filter((m) => m.role === 'user').slice(-1)[0]?.content)}
                className="mt-2 rounded-lg border border-[var(--border-glow)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-cyan)] hover:bg-white/5"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* quick actions */}
        <div className="flex flex-wrap gap-1.5 border-t border-[var(--border-subtle)] px-3 py-2">
          {quickActions.map((qa) => (
            <button
              key={qa.label}
              onClick={() => send(qa.prompt)}
              disabled={loading || !hasKey}
              className="rounded-full border border-[var(--border-subtle)] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-cyan)] hover:text-[var(--text-primary)] disabled:opacity-40"
            >
              {qa.label}
            </button>
          ))}
        </div>

        {/* input */}
        <div className="border-t border-[var(--border-subtle)] px-3 pt-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="flex items-end gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-void)] p-2 focus-within:border-[var(--accent-cyan)]">
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder={hasKey ? 'Ask NEXUS AI…' : 'Add a Gemini key in Settings first'}
              disabled={!hasKey}
              className="block max-h-32 min-h-[36px] flex-1 resize-none self-center overflow-y-auto bg-transparent px-1 py-[7px] text-sm leading-snug text-[var(--text-primary)] outline-none placeholder:text-[var(--text-dim)]"
            />
            {loading ? (
              <button onClick={stop} title="Stop" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-red)]/20 text-[var(--accent-red)]">
                <Square size={15} />
              </button>
            ) : (
              <button
                onClick={() => send()}
                disabled={!input.trim() || !hasKey}
                title="Send"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-cyan)] text-[#02060d] transition-opacity disabled:opacity-30"
              >
                <Send size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
