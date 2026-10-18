export function peso(value) {
  const n = Number(value || 0)
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: '2-digit' })
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return `${d.toLocaleDateString('en-PH', { month: 'short', day: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}`
}

export function formatCuM(value) {
  const n = Number(value || 0)
  return `${n.toLocaleString('en-PH', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} cu.m`
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function monthIso() {
  return todayIso().slice(0, 7)
}
