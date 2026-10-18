import { useEffect, useRef, useState } from 'react'
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import api from '../lib/api.js'

export default function CustomerPicker({ value, onSelect, placeholder }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const fn = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('mousedown', fn)
    return () => window.removeEventListener('mousedown', fn)
  }, [open])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const t = setTimeout(async () => {
      try {
        const rows = await api.customers.list({ search: query || undefined })
        if (!cancelled) setResults(rows.slice(0, 8))
      } catch {
        if (!cancelled) setResults([])
      }
    }, 180)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, open])

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-[0.5rem] border border-aqua/40 bg-aqua/10 px-3 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <UserCircleIcon className="h-6 w-6 shrink-0 text-aqua-deep" />
          <div className="min-w-0">
            <p className="truncate text-[0.875rem] font-bold text-ink">{value.name}</p>
            <p className="text-[0.75rem] font-medium text-ink-soft">
              #{value.accountNumber}
              {value.meterNumber ? ` · Meter ${value.meterNumber}` : ''}
            </p>
          </div>
        </div>
        <button type="button" className="btn-ghost !py-1" onClick={() => onSelect(null)}>
          Change
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={boxRef}>
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input !pl-9"
          placeholder={placeholder ?? 'Search name, account #, or meter #…'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && results.length > 0 ? (
        <div className="card absolute z-200 mt-1 max-h-72 w-full overflow-y-auto">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              className="flex w-full cursor-pointer items-center justify-between border-b border-slate-100 px-3 py-2 text-left transition-colors duration-150 last:border-0 hover:bg-mist"
              onClick={() => {
                onSelect(c)
                setOpen(false)
                setQuery('')
              }}
            >
              <span className="text-[0.8125rem] font-semibold text-ink">{c.name}</span>
              <span className="text-[0.75rem] font-medium text-ink-soft">#{c.accountNumber}</span>
            </button>
          ))}
        </div>
      ) : null}
      {open && query && results.length === 0 ? (
        <div className="card absolute z-200 mt-1 w-full px-3 py-2 text-[0.8125rem] text-ink-soft">
          No customers found
        </div>
      ) : null}
    </div>
  )
}
