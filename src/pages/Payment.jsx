import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import api from '../lib/api.js'
import { getSession } from '../lib/session.js'
import { peso } from '../lib/format.js'
import CustomerPicker from '../components/CustomerPicker.jsx'
import { Badge, ErrorNote, Field, Spinner } from '../components/ui.jsx'
import { toast } from '../lib/toast.jsx'

export default function Payment() {
  const navigate = useNavigate()
  const user = getSession()

  const [customer, setCustomer] = useState(null)
  const [bills, setBills] = useState([])
  const [loadingBills, setLoadingBills] = useState(false)
  const [billId, setBillId] = useState(null)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!customer) {
      setBills([])
      setBillId(null)
      return
    }
    let cancelled = false
    setLoadingBills(true)
    ;(async () => {
      try {
        const rows = await api.bills.list({
          actorId: user.id,
          customerId: customer.id,
          status: 'partial'
        })
        const open = rows.filter((b) => b.status === 'unpaid' || b.status === 'partial')
        if (!cancelled) setBills(open)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoadingBills(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [customer])

  const selectedBill = bills.find((b) => b.id === billId) || null

  useEffect(() => {
    if (selectedBill) setAmount(String(selectedBill.remaining))
  }, [selectedBill?.id])

  const submit = async (e) => {
    e.preventDefault()
    if (!selectedBill) return
    setBusy(true)
    setError('')
    try {
      const payment = await api.payments.record({
        actorId: user.id,
        billId: selectedBill.id,
        amount: Number(amount),
        method,
        reference: method === 'gcash' ? reference.trim() : ''
      })
      toast(`Payment recorded — ${payment.receiptNumber}`)
      navigate(`/receipt/${payment.id}`)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <div className="flex flex-col gap-6 xl:col-span-3">
        <div className="card anim-in p-4">
          <h2 className="section-title mb-3">1 · Customer</h2>
          <CustomerPicker
            value={customer}
            onSelect={(c) => {
              setCustomer(c)
              setBillId(null)
              setError('')
            }}
          />
        </div>

        <div className="card anim-in overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="section-title">2 · Unpaid Bills</h2>
          </div>
          {!customer ? (
            <p className="px-4 py-6 text-[0.8125rem] text-ink-soft">
              Select a customer to see their open bills.
            </p>
          ) : loadingBills ? (
            <Spinner />
          ) : bills.length === 0 ? (
            <p className="px-4 py-6 text-[0.8125rem] text-ink-soft">
              No open bills for this account. Create one from Billing or Meter Readings first.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Bill #</th>
                  <th className="th">Period</th>
                  <th className="th">Due date</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Remaining</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr
                    key={b.id}
                    className={`cursor-pointer transition-colors duration-150 ${
                      billId === b.id ? 'bg-primary/5' : 'hover:bg-mist/60'
                    }`}
                    onClick={() => setBillId(b.id)}
                  >
                    <td className="td font-semibold text-primary">{b.billNumber}</td>
                    <td className="td">{b.period || '—'}</td>
                    <td className="td">{b.dueDate || '—'}</td>
                    <td className="td">
                      <Badge tone={b.status}>{b.status}</Badge>
                    </td>
                    <td className="td text-right font-bold">{peso(b.remaining)}</td>
                    <td className="td text-right">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          billId === b.id ? 'border-aqua bg-aqua text-white' : 'border-slate-300'
                        }`}
                      >
                        {billId === b.id ? <CheckCircleIcon className="h-4 w-4" /> : null}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="card anim-in flex h-fit flex-col gap-4 p-4 xl:col-span-2">
        <h2 className="section-title">3 · Amount & Method</h2>
        <ErrorNote>{error}</ErrorNote>

        <Field label="Amount (₱)">
          <input
            className="input text-[1.125rem] font-bold"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!selectedBill}
            required
          />
        </Field>

        {selectedBill ? (
          <p className="rounded-[0.5rem] bg-mist px-3 py-2 text-[0.75rem] font-medium text-ink-soft">
            {selectedBill.billNumber} · due {peso(selectedBill.remaining)}
            {selectedBill.dueDate ? ` · due date ${selectedBill.dueDate}` : ''}
          </p>
        ) : null}

        <div>
          <label className="label">Payment Method</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMethod('cash')}
              className={`btn ${method === 'cash' ? 'btn-primary' : 'btn-ghost'} w-full`}
            >
              Cash
            </button>
            <button
              type="button"
              onClick={() => setMethod('gcash')}
              className={`btn ${method === 'gcash' ? 'btn-primary' : 'btn-ghost'} w-full`}
            >
              GCash
            </button>
          </div>
        </div>

        {method === 'gcash' ? (
          <Field label="GCash Reference Number">
            <input
              className="input"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. 123456789012"
            />
          </Field>
        ) : null}

        <button className="btn-orange mt-2 w-full !py-3" disabled={!selectedBill || busy}>
          <BanknotesIcon className="h-5 w-5" />
          {busy ? 'Recording…' : 'Record Payment'}
        </button>
      </form>
    </div>
  )
}
