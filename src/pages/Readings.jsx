import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BoltIcon } from '@heroicons/react/24/outline'
import api from '../lib/api.js'
import { getSession } from '../lib/session.js'
import { peso, formatDate, formatCuM, todayIso } from '../lib/format.js'
import CustomerPicker from '../components/CustomerPicker.jsx'
import { ErrorNote, Field, Spinner, SuccessNote } from '../components/ui.jsx'
import { toast } from '../lib/toast.jsx'

export default function Readings() {
  const user = getSession()
  const [customer, setCustomer] = useState(null)
  const [readingDate, setReadingDate] = useState(todayIso())
  const [currentReading, setCurrentReading] = useState('')
  const [notes, setNotes] = useState('')
  const [createBill, setCreateBill] = useState(true)
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [rows, setRows] = useState(null)

  const load = async () => {
    try {
      const data = await api.readings.list({ actorId: user.id, limit: 25 })
      setRows(data)
    } catch {
      setRows([])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!customer) return
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const result = await api.readings.create({
        actorId: user.id,
        customerId: customer.id,
        readingDate,
        currentReading: Number(currentReading),
        notes: notes.trim(),
        createBill,
        dueDate: createBill ? dueDate : ''
      })
      const msg = result.bill
        ? `Reading saved — bill ${result.bill.billNumber} for ${peso(result.bill.amount)} created`
        : 'Reading saved'
      toast(msg)
      setSuccess(msg)
      setCurrentReading('')
      setNotes('')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <form onSubmit={submit} className="card anim-in flex h-fit flex-col gap-4 p-4 xl:col-span-2">
        <h2 className="section-title">New Meter Reading</h2>
        <ErrorNote>{error}</ErrorNote>
        <SuccessNote>{success}</SuccessNote>

        <CustomerPicker value={customer} onSelect={setCustomer} />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Reading Date">
            <input
              className="input"
              type="date"
              value={readingDate}
              onChange={(e) => setReadingDate(e.target.value)}
              required
            />
          </Field>
          <Field label="Current Reading (cu.m)">
            <input
              className="input text-[1rem] font-bold"
              type="number"
              min="0"
              step="0.1"
              value={currentReading}
              onChange={(e) => setCurrentReading(e.target.value)}
              required
            />
          </Field>
        </div>

        <Field label="Notes (optional)">
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. meter replaced" />
        </Field>

        <label className="flex cursor-pointer items-center gap-2 text-[0.8125rem] font-semibold text-ink">
          <input
            type="checkbox"
            checked={createBill}
            onChange={(e) => setCreateBill(e.target.checked)}
            className="h-4 w-4 accent-[#005691]"
          />
          Create a bill from this reading (uses active rate)
        </label>

        {createBill ? (
          <Field label="Due Date (optional)">
            <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        ) : null}

        <button className="btn-primary mt-1 w-full !py-2.5" disabled={!customer || busy}>
          <BoltIcon className="h-5 w-5" />
          {busy ? 'Saving…' : 'Save Reading'}
        </button>
        {!customer ? (
          <p className="text-center text-[0.75rem] text-ink-soft">Select a customer first</p>
        ) : null}
      </form>

      <div className="card anim-in overflow-hidden xl:col-span-3">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="section-title">Recent Readings</h2>
          <Link to="/billing" className="text-[0.75rem] font-bold tracking-wider text-primary uppercase hover:underline">
            All bills
          </Link>
        </div>
        {rows === null ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-[0.8125rem] text-ink-soft">No readings recorded yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Date</th>
                <th className="th">Customer</th>
                <th className="th text-right">Prev</th>
                <th className="th text-right">Current</th>
                <th className="th text-right">Used</th>
                <th className="th text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className="anim-in hover:bg-mist/60"
                  style={{ animationDelay: `${Math.min(i, 10) * 80}ms` }}
                >
                  <td className="td">{formatDate(r.readingDate)}</td>
                  <td className="td">
                    <Link
                      to={`/customers/${r.customerId}`}
                      className="font-semibold text-ink hover:text-primary hover:underline"
                    >
                      {r.customerName}
                    </Link>
                    <span className="ml-2 text-[0.6875rem] text-ink-soft">#{r.accountNumber}</span>
                  </td>
                  <td className="td text-right text-ink-soft">{formatCuM(r.previousReading)}</td>
                  <td className="td text-right font-semibold">{formatCuM(r.currentReading)}</td>
                  <td className="td text-right font-bold text-primary">{formatCuM(r.consumption)}</td>
                  <td className="td text-right font-bold">{peso(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
