import { useState, useCallback } from 'react'
import useStore from '../store/useStore'

// The spec references gemini-1.5-flash (now retired); we use the current free-tier
// flash model that has quota. Change here to swap models everywhere.
export const GEMINI_MODEL = 'gemini-2.5-flash'
export const GEMINI_MODEL_LABEL = 'gemini-2.5-flash (free tier)'

const ENDPOINT = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`

const toGeminiRole = (role) => (role === 'assistant' || role === 'model' ? 'model' : 'user')

export function useGemini() {
  const geminiKey = useStore((s) => s.geminiKey)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generate = useCallback(
    async ({ history = [], system, onToken, signal } = {}) => {
      if (!geminiKey) {
        const e = new Error('No Gemini API key set. Add one in Settings.')
        setError(e.message)
        throw e
      }
      setError(null)
      setLoading(true)

      // Drop a leading assistant message — Gemini requires the first turn be "user".
      const cleaned = [...history]
      while (cleaned.length && toGeminiRole(cleaned[0].role) === 'model') cleaned.shift()

      try {
        const res = await fetch(ENDPOINT(GEMINI_MODEL, geminiKey), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal,
          body: JSON.stringify({
            contents: cleaned.map((m) => ({
              role: toGeminiRole(m.role),
              parts: [{ text: m.content }],
            })),
            systemInstruction: system ? { parts: [{ text: system }] } : undefined,
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        })

        if (!res.ok) {
          let detail = ''
          try {
            const errJson = await res.json()
            detail = errJson?.error?.message || ''
          } catch {
            /* ignore */
          }
          throw new Error(detail || `Gemini request failed (${res.status})`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let full = ''
        let buffer = ''

        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop()
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const payload = trimmed.slice(5).trim()
            if (!payload || payload === '[DONE]') continue
            try {
              const json = JSON.parse(payload)
              const text =
                json.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
              if (text) {
                full += text
                onToken?.(full)
              }
            } catch {
              /* partial json chunk, ignore */
            }
          }
        }

        if (!full) throw new Error('Empty response from Gemini. Try again.')
        return full
      } catch (e) {
        if (e.name === 'AbortError') throw e
        setError(e.message)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [geminiKey]
  )

  return { generate, loading, error, setError, hasKey: !!geminiKey }
}

export default useGemini
