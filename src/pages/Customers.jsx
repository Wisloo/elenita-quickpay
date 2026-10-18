import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline'
import api from '../lib/api.js'
import { getSession } from '../lib/session.js'
import { formatDate } from '../lib/format.js'
import { Badge, EmptyState, ErrorNote, Field, Modal, Spinner } from '../components/ui.jsx'
import { toast } from '../lib/toast.jsx'

const EMPTY_FORM = { accountNumber: '', name: '', address: '', phone: '', meterNumber: '' }

export default function Customers() {
  const user = getSession()
  const [rows, setRows] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async (q) => {
    try {
      const data = await api.customers.list({ search: q || undefined })
      setRows(data)
    } catch (err) {
      toast(err.message, 'error')
      setRows([])
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load(search), 180)
    return () => clearTimeout(t)
  }, [search])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.customers.create({ actorId: user.id, ...form })
      toast(`Customer ${form.name} added`)
      setModalOpen(false)
      setForm(EMPTY_FORM)
      load(search)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="input max-w-md"
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <PlusIcon className="h-5 w-5" />
          New Customer
        </button>
      </div>

      <div className="card anim-in overflow-hidden">
        {rows === null ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState
            title={search ? 'No matching customers' : 'No customers yet'}
            hint={
              search
                ? 'Try a different name, account number, or meter number.'
                : 'Add your first water account to start recording readings and payments.'
            }
            icon={<UsersIcon className="h-10 w-10" />}
            action={
              !search ? (
                <button className="btn-primary mt-2" onClick={() => setModalOpen(true)}>
                  <PlusIcon className="h-5 w-5" />
                  New Customer
                </button>
              ) : null
            }
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Account #</th>
                <th className="th">Name</th>
                <th className="th">Address</th>
                <th className="th">Meter #</th>
                <th className="th">Phone</th>
                <th className="th">Since</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr
                  key={c.id}
                  className="anim-in transition-colors duration-150 hover:bg-mist/60"
                  style={{ animationDelay: `${Math.min(i, 10) * 80}ms` }}
                >
                  <td className="td font-bold text-primary">{c.accountNumber}</td>
                  <td className="td font-semibold">{c.name}</td>
                  <td className="td text-ink-soft">{c.address || '—'}</td>
                  <td className="td">{c.meterNumber || '—'}</td>
                  <td className="td">{c.phone || '—'}</td>
                  <td className="td text-ink-soft">{formatDate(c.createdAt)}</td>
                  <td className="td text-right">
                    <Link to={`/customers/${c.id}`} className="text-[0.75rem] font-bold tracking-wider text-primary uppercase hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} title="New Customer" onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <ErrorNote>{error}</ErrorNote>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Account Number *">
              <input className="input" value={form.accountNumber} onChange={set('accountNumber')} required autoFocus />
            </Field>
            <Field label="Meter Number">
              <input className="input" value={form.meterNumber} onChange={set('meterNumber')} />
            </Field>
          </div>
          <Field label="Full Name *">
            <input className="input" value={form.name} onChange={set('name')} required />
          </Field>
          <Field label="Address">
            <input className="input" value={form.address} onChange={set('address')} />
          </Field>
          <Field label="Phone">
            <input className="input" value={form.phone} onChange={set('phone')} />
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
