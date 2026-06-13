import { useCallback } from 'react'
import useStore from '../store/useStore'

export function useCopy() {
  const addToast = useStore((s) => s.addToast)
  return useCallback(
    async (text, label = 'Copied!') => {
      try {
        await navigator.clipboard.writeText(text)
        addToast(label, 'success')
      } catch {
        addToast('Copy failed', 'danger')
      }
    },
    [addToast]
  )
}

export default useCopy
