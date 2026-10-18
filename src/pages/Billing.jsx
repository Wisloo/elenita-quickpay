import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import api from '../lib/api.js'
import { getSession } from '../lib/session.js'
import { peso, monthIso } from '../lib/format.js'
import CustomerPicker from '../components/CustomerPicker.jsx'
import { Badge, EmptyState, ErrorNote, Field, Modal, Spinner, Tabs } from '../components/ui.jsx'
import { toast } from '../lib/toast.jsx'

export default function Billing() {
  const user = getSession()
  const [tab, setTab] = useState('open')
  const [rows, setRows] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState(monthIso())
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const statusFor = (t) => (t === 'open' ? 'partial' : t === 'all' ? 'all' : t)

  const load = async (t = tab) => {
    try {
      const data = await api.bills.list({ actorId: user.id, status: statusFor(t) })
      setRows(data)
    } catch (err) {
      toast(err.message, 'error')
      setRows([])
    }
  }

  useEffect(() => {
    load(tab)
  }, [tab])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const bill = await api.bills.create({
        actorId: user.id,
        customerId: customer.id,
        amount: Number(amount),
        period,
        dueDate
      })
      toast(`Bill ${bill.billNumber} created`)
      setModalOpen(false)
      setCustomer(null)
      setAmount('')
      setDueDate('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const voidBill = async (bill) => {
    if (!window.confirm(`Void bill ${bill.billNumber}? This cannot be undone.`)) return
    try {
      await api.bills.voidBill({ actorId: user.id, id: bill.id })
      toast(`Bill ${bill.billNumber} voided`)
      load()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { value: 'open', label: 'Open' },
            { value: 'unpaid', label: 'Unpaid' },
            { value: 'paid', label: 'Paid' },
            { value: 'void', label: 'Voided' },
            { value: 'all', label: 'All' }
          ]}
        />
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <PlusIcon className="h-5 w-5" />
          New Manual Bill
        </button>
      </div>

      <div className="card anim-in overflow-hidden">
        {rows === null ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No bills here"
            hint="Bills are created from meter readings, or manually with the button above."
            icon={<PlusIcon className="h-10 w-10" />}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Bill #</th>
                <th className="th">Customer</th>
                <th className="th">Period</th>
                <th className="th">Due date</th>
                <th className="th">Status</th>
                <th className="th text-right">Due</th>
                <th className="th text-right">Paid</th>
                <th className="th text-right">Remaining</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b, i) => (
                <tr
                  key={b.id}
                  className="anim-in hover:bg-mist/60"
                  style={{ animationDelay: `${Math.min(i, 10) * 80}ms` }}
                >
                  <td className="td font-semibold text-primary">{b.billNumber}</td>
                  <td className="td">
                    <Link
                      to={`/customers/${b.customerId}`}
                      className="font-semibold text-ink hover:text-primary hover:underline"
                    >
                      {b.customerName}
                    </Link>
                    <span className="ml-2 text-[0.6875rem] text-ink-soft">#{b.accountNumber}</span>
                  </td>
                  <td className="td">{b.period || '—'}</td>
                  <td className="td">{b.dueDate || '—'}</td>
                  <td className="td">
                    <Badge tone={b.status}>{b.status}</Badge>
                  </td>
                  <td className="td text-right font-semibold">{peso(b.amountDue)}</td>
                  <td className="td text-right text-aqua-deep">{peso(b.paid)}</td>
                  <td className="td text-right font-bold">{peso(b.remaining)}</td>
                  <td className="td text-right">
                    {b.status === 'unpaid' && user.role === 'admin' ? (
                      <button
                        className="text-[0.6875rem] font-bold tracking-wider text-red-500 uppercase hover:underline"
                        onClick={() => voidBill(b)}
                      >
                        Void
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} title="New Manual Bill" onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <ErrorNote>{error}</ErrorNote>
          <CustomerPicker value={customer} onSelect={setCustomer} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Amount (₱) *">
              <input
                className="input font-bold"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </Field>
            <Field label="Period">
              <input className="input" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
            </Field>
            <Field label="Due Date">
              <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" disabled={!customer || busy}>
              {busy ? 'Saving…' : 'Create Bill'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
