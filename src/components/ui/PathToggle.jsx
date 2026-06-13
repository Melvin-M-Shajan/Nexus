import useStore from '../../store/useStore'

// Animated pill toggle: FREE (green) / UDEMY (gold).
export default function PathToggle({ size = 'md' }) {
  const currentPath = useStore((s) => s.currentPath)
  const setPath = useStore((s) => s.setPath)
  const isFree = currentPath === 'free'

  const dims =
    size === 'sm'
      ? { w: 200, h: 34, font: 'text-[11px]' }
      : { w: 248, h: 40, font: 'text-xs' }

  return (
    <div
      role="tablist"
      aria-label="Learning path"
      className="relative grid grid-cols-2 select-none rounded-full p-1"
      style={{
        width: dims.w,
        height: dims.h,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* sliding thumb */}
      <span
        aria-hidden
        className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          left: isFree ? '4px' : '50%',
          width: 'calc(50% - 4px)',
          background: isFree
            ? 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(16,185,129,0.6))'
            : 'linear-gradient(135deg, rgba(245,158,11,0.95), rgba(245,158,11,0.6))',
          boxShadow: isFree ? '0 0 16px rgba(16,185,129,0.5)' : '0 0 16px rgba(245,158,11,0.5)',
        }}
      />
      <button
        role="tab"
        aria-selected={isFree}
        onClick={() => setPath('free')}
        className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full font-bold uppercase tracking-wider ${dims.font} ${
          isFree ? 'text-[#04130d]' : 'text-[var(--text-secondary)]'
        }`}
      >
        <span className="text-[8px]">{isFree ? '◉' : '○'}</span> Free
      </button>
      <button
        role="tab"
        aria-selected={!isFree}
        onClick={() => setPath('udemy')}
        className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full font-bold uppercase tracking-wider ${dims.font} ${
          !isFree ? 'text-[#1a1203]' : 'text-[var(--text-secondary)]'
        }`}
      >
        <span className="text-[8px]">{!isFree ? '◉' : '○'}</span> Udemy
      </button>
    </div>
  )
}
