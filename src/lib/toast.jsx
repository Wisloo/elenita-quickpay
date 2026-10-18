import { useEffect, useState } from 'react'

let listeners = new Set()
let seq = 0

export function toast(message, tone = 'ok') {
  const id = ++seq
  listeners.forEach((fn) => fn({ id, message, tone }))
}

export function ToastHost() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const fn = (item) => {
      setItems((prev) => [...prev, item])
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id))
      }, 3200)
    }
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])

  if (items.length === 0) return null

  return (
    <div className="toast-layer fixed right-6 bottom-6 flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`anim-in rounded-[0.5rem] border px-4 py-3 text-[0.8125rem] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.18)] ${
            item.tone === 'error'
              ? 'border-red-300 bg-red-600 text-white'
              : 'border-aqua bg-ink text-aqua'
          }`}
        >
          {item.message}
        </div>
      ))}
    </div>
  )
}
