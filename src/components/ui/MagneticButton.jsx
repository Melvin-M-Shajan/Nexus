import { useRef } from 'react'

// Button that subtly follows the cursor on hover (magnetic effect).
export default function MagneticButton({ children, className = '', strength = 0.35, as: Tag = 'button', ...rest }) {
  const ref = useRef(null)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) * strength
    const y = (e.clientY - (r.top + r.height / 2)) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
  }
  const reset = () => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)'
  }

  return (
    <Tag ref={ref} onMouseMove={onMove} onMouseLeave={reset} className={`btn-magnetic ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
