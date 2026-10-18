import { useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export function Field({ label, error, children }) {
  return (
    <div>
      {label ? <label className="label">{label}</label> : null}
      {children}
      {error ? <p className="mt-1 text-[0.75rem] font-medium text-red-600">{error}</p> : null}
    </div>
  )
}

export function Modal({ open, title, onClose, children, wide }) {
  useEffect(() => {
    if (!open) return
    const fn = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="overlay fixed inset-0 flex items-center justify-center bg-ink/50 p-6">
      <div
        className={`anim-in card max-h-[90vh] w-full overflow-y-auto ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
      >
        <div className="no-print sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          <h2 className="text-[1rem] font-bold tracking-tight text-ink">{title}</h2>
          <button className="btn-ghost !border-0 !px-2" onClick={onClose} title="Close">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

const BADGE_TONES = {
  paid: 'bg-aqua/15 text-aqua-deep border-aqua/40',
  unpaid: 'bg-yellow/20 text-ink border-yellow',
  partial: 'bg-orange/15 text-orange-deep border-orange/40',
  void: 'bg-slate-200 text-slate-500 border-slate-300',
  cash: 'bg-primary/10 text-primary border-primary/30',
  gcash: 'bg-purple/10 text-purple border-purple/30',
  admin: 'bg-purple/10 text-purple border-purple/30',
  cashier: 'bg-primary/10 text-primary border-primary/30',
  active: 'bg-aqua/15 text-aqua-deep border-aqua/40',
  inactive: 'bg-slate-200 text-slate-500 border-slate-300'
}

export function Badge({ tone = 'unpaid', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-bold tracking-wider uppercase ${BADGE_TONES[tone] ?? BADGE_TONES.unpaid}`}
    >
      {children}
    </span>
  )
}

export function StatCard({ label, value, sub, accent = 'primary', icon }) {
  const accents = {
    primary: 'bg-primary',
    aqua: 'bg-aqua',
    orange: 'bg-orange',
    purple: 'bg-purple'
  }
  return (
    <div className="card anim-in relative overflow-hidden px-4 py-3">
      <div className={`absolute top-0 left-0 h-full w-1 ${accents[accent] ?? accents.primary}`} />
      <div className="flex items-start justify-between pl-2">
        <div>
          <p className="stat-label">{label}</p>
          <p className="mt-1 text-[1.5rem] font-bold tracking-tight text-ink">{value}</p>
          {sub ? <p className="mt-0.5 text-[0.75rem] text-ink-soft">{sub}</p> : null}
        </div>
        {icon ? <div className="text-slate-300">{icon}</div> : null}
      </div>
    </div>
  )
}

export function EmptyState({ title, hint, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      {icon ? <div className="text-slate-300">{icon}</div> : null}
      <p className="text-[0.9375rem] font-semibold text-ink">{title}</p>
      {hint ? <p className="max-w-md text-[0.8125rem] text-ink-soft">{hint}</p> : null}
      {action}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-[0.8125rem] font-semibold text-ink-soft">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
      Loading…
    </div>
  )
}

export function ErrorNote({ children }) {
  if (!children) return null
  return (
    <div className="rounded-[0.5rem] border border-red-300 bg-red-50 px-3 py-2 text-[0.8125rem] font-medium text-red-700">
      {children}
    </div>
  )
}

export function SuccessNote({ children }) {
  if (!children) return null
  return (
    <div className="rounded-[0.5rem] border border-aqua/40 bg-aqua/10 px-3 py-2 text-[0.8125rem] font-medium text-aqua-deep">
      {children}
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-[0.5rem] border border-slate-200 bg-white p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`rounded-[0.375rem] px-3 py-1.5 text-[0.8125rem] font-semibold tracking-wide transition-all duration-200 ${
            active === tab.value
              ? 'bg-primary text-aqua shadow-[0_2px_8px_rgba(0,86,145,0.25)]'
              : 'text-ink-soft hover:bg-mist'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
