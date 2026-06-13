// SVG circular progress ring.
export default function ProgressRing({
  progress = 0, // 0..1
  size = 120,
  stroke = 9,
  color = 'var(--accent-cyan)',
  trackColor = 'rgba(255,255,255,0.07)',
  label,
  sublabel,
  children,
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, progress))
  const offset = circumference * (1 - clamped)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-fill"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <>
            {label != null && (
              <span className="font-mono font-bold text-[var(--text-primary)]" style={{ fontSize: size * 0.2 }}>
                {label}
              </span>
            )}
            {sublabel && (
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">{sublabel}</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
