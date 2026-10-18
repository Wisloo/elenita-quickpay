import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import api from '../lib/api.js'
import { getSession } from '../lib/session.js'
import { peso, formatDate, formatDateTime, formatCuM } from '../lib/format.js'
import { Badge, ErrorNote, Field, Modal, Spinner, StatCard, Tabs } from '../components/ui.jsx'
import { toast } from '../lib/toast.jsx'

export default function CustomerDetail() {
  const { id } = useParams()
  const user = getSession()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('bills')
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [editError, setEditError] = useState('')

  const load = async () => {
    try {
      const stmt = await api.customers.statement(Number(id))
      setData(stmt)
      setForm({
        accountNumber: stmt.customer.accountNumber,
        name: stmt.customer.name,
        address: stmt.customer.address,
        phone: stmt.customer.phone,
        meterNumber: stmt.customer.meterNumber
      })
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  if (error) return <div className="card px-4 py-3 text-[0.875rem] font-medium text-red-600">{error}</div>
  if (!data || !form) return <Spinner />

  const { customer, bills, payments, readings, totals } = data

  const submitEdit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setEditError('')
    try {
      await api.customers.update({ actorId: user.id, id: customer.id, ...form })
      toast('Customer updated')
      setEditOpen(false)
      load()
    } catch (err) {
      setEditError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div className="flex flex-col gap-4">
      <Link to="/customers" className="btn-ghost w-fit">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Customers
      </Link>

      <div className="card anim-in flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="stat-label">Account #{customer.accountNumber}</p>
          <h2 className="mt-1 text-[1.5rem] font-bold tracking-tight text-ink">{customer.name}</h2>
          <p className="mt-1 text-[0.8125rem] text-ink-soft">
            {customer.address || 'No address on file'}
            {customer.phone ? ` · ${customer.phone}` : ''}
            {customer.meterNumber ? ` · Meter ${customer.meterNumber}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={customer.active ? 'active' : 'inactive'}>
            {customer.active ? 'active' : 'inactive'}
          </Badge>
          <button className="btn-ghost" onClick={() => setEditOpen(true)}>
            <PencilSquareIcon className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Billed" value={peso(totals.totalBilled)} accent="primary" />
        <StatCard label="Total Paid" value={peso(totals.totalPaid)} accent="aqua" />
        <StatCard
          label="Balance"
          value={peso(Math.max(0, Number(totals.balance)))}
          accent={Number(totals.balance) > 0 ? 'orange' : 'aqua'}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { value: 'bills', label: `Bills (${bills.length})` },
            { value: 'payments', label: `Payments (${payments.length})` },
            { value: 'readings', label: `Readings (${readings.length})` }
          ]}
        />
        <Link to="/payment" className="btn-primary">
          Record Payment
        </Link>
      </div>

      <div className="card anim-in overflow-hidden">
        {tab === 'bills' ? (
          bills.length === 0 ? (
            <p className="px-4 py-6 text-[0.8125rem] text-ink-soft">No bills yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Bill #</th>
                  <th className="th">Period</th>
                  <th className="th">Due date</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Due</th>
                  <th className="th text-right">Paid</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-mist/60">
                    <td className="td font-semibold text-primary">{b.billNumber}</td>
                    <td className="td">{b.period || '—'}</td>
                    <td className="td">{b.dueDate || '—'}</td>
                    <td className="td">
                      <Badge tone={b.status}>{b.status}</Badge>
                    </td>
                    <td className="td text-right font-semibold">{peso(b.amountDue)}</td>
                    <td className="td text-right font-bold text-aqua-deep">{peso(b.paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : null}

        {tab === 'payments' ? (
          payments.length === 0 ? (
            <p className="px-4 py-6 text-[0.8125rem] text-ink-soft">No payments yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Receipt</th>
                  <th className="th">Date</th>
                  <th className="th">Method</th>
                  <th className="th">Reference</th>
                  <th className="th text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-mist/60">
                    <td className="td font-semibold text-primary">
                      <Link to={`/receipt/${p.id}`} className="hover:underline">
                        {p.receiptNumber}
                      </Link>
                    </td>
                    <td className="td">{formatDateTime(p.paidAt)}</td>
                    <td className="td">
                      <Badge tone={p.method}>{p.method}</Badge>
                    </td>
                    <td className="td text-ink-soft">{p.reference || '—'}</td>
                    <td className="td text-right font-bold">{peso(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : null}

        {tab === 'readings' ? (
          readings.length === 0 ? (
            <p className="px-4 py-6 text-[0.8125rem] text-ink-soft">No readings yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Date</th>
                  <th className="th text-right">Previous</th>
                  <th className="th text-right">Current</th>
                  <th className="th text-right">Consumption</th>
                  <th className="th text-right">Amount</th>
                  <th className="th">Notes</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r) => (
                  <tr key={r.id} className="hover:bg-mist/60">
                    <td className="td">{formatDate(r.readingDate)}</td>
                    <td className="td text-right">{formatCuM(r.previousReading)}</td>
                    <td className="td text-right font-semibold">{formatCuM(r.currentReading)}</td>
                    <td className="td text-right font-bold text-primary">{formatCuM(r.consumption)}</td>
                    <td className="td text-right">{peso(r.amount)}</td>
                    <td className="td text-ink-soft">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : null}
      </div>

      <Modal open={editOpen} title="Edit Customer" onClose={() => setEditOpen(false)}>
        <form onSubmit={submitEdit} className="flex flex-col gap-3">
          <ErrorNote>{editError}</ErrorNote>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Account Number *">
              <input className="input" value={form.accountNumber} onChange={set('accountNumber')} required />
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
            <button type="button" className="btn-ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
