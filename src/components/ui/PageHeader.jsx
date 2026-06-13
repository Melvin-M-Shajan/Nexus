export default function PageHeader({ icon: Icon, title, subtitle, right, accent = 'var(--accent-cyan)' }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <span
            className="grid h-11 w-11 place-items-center rounded-xl"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}44` }}
          >
            <Icon size={22} />
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}
