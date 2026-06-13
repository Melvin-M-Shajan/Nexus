import { useRef } from 'react'

// Glassmorphism card with optional mouse-following spotlight.
export default function GlassCard({
  children,
  className = '',
  spotlight = true,
  as: Tag = 'div',
  style,
  ...rest
}) {
  const ref = useRef(null)

  const onMouseMove = (e) => {
    if (!spotlight || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <Tag
      ref={ref}
      onMouseMove={onMouseMove}
      className={`glass-card ${spotlight ? 'spotlight' : ''} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
