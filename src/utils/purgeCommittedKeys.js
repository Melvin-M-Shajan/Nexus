// SHA-256 hashes of API keys that were once committed to source.
// Compared at startup so raw secrets never live in the repo.
const KNOWN_COMMITTED_KEY_HASHES = new Set([
  '84a4fed10fc036c9e5bc12e31549f5a075aa19af2d08c0f05896af7ea3d5e47e',
  '75327755c311046c99881a4172d6ea5abb449e5f6e38912aebb89ae227ff15cd',
])

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Remove any previously-committed Gemini keys still sitting in localStorage. */
export async function purgeCommittedKeys() {
  const stored = localStorage.getItem('nexus_gemini_key')
  if (!stored) return
  try {
    const decoded = atob(stored)
    const hash = await sha256Hex(decoded)
    if (KNOWN_COMMITTED_KEY_HASHES.has(hash)) {
      localStorage.removeItem('nexus_gemini_key')
    }
  } catch {
    /* ignore malformed values */
  }
}
