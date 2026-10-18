import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PrinterIcon } from '@heroicons/react/24/outline'
import api from '../lib/api.js'
import { peso, formatDateTime } from '../lib/format.js'
import qrcode from '../assets/qrcode.jpeg'
import { Badge, EmptyState, Spinner } from '../components/ui.jsx'

export default function Receipt() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await api.payments.get(Number(id))
        if (!cancelled) setPayment(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return <EmptyState title="Receipt not found" hint={error} />
  }
  if (!payment) return <Spinner />

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="no-print flex items-center justify-between">
        <Link to="/" className="btn-ghost">
          Back to Dashboard
        </Link>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => navigate('/payment')}>
            New Payment
          </button>
          <button className="btn-primary" onClick={() => window.print()}>
            <PrinterIcon className="h-5 w-5" />
            Print Receipt
          </button>
        </div>
      </div>

      <div className="print-area card mx-auto w-full max-w-sm px-6 py-6">
        <div className="border-b-2 border-dashed border-ink pb-3 text-center">
          <p className="text-[1rem] font-bold tracking-tight text-ink">{payment.store.name}</p>
          {payment.store.address ? (
            <p className="text-[0.6875rem] text-ink-soft">{payment.store.address}</p>
          ) : null}
          {payment.store.contact ? (
            <p className="text-[0.6875rem] text-ink-soft">{payment.store.contact}</p>
          ) : null}
          <p className="mt-2 text-[0.6875rem] font-bold tracking-[0.2em] text-primary uppercase">
            Official Receipt
          </p>
        </div>

        <div className="flex flex-col gap-1 border-b-2 border-dashed border-ink py-3 text-[0.75rem]">
          <div className="flex justify-between">
            <span className="text-ink-soft">Receipt #</span>
            <span className="font-bold">{payment.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Date</span>
            <span>{formatDateTime(payment.paidAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Cashier</span>
            <span>{payment.cashier}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-b-2 border-dashed border-ink py-3 text-[0.75rem]">
          <div className="flex justify-between">
            <span className="text-ink-soft">Account</span>
            <span className="font-bold">#{payment.customer.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Name</span>
            <span className="font-semibold">{payment.customer.name}</span>
          </div>
          {payment.customer.meterNumber ? (
            <div className="flex justify-between">
              <span className="text-ink-soft">Meter #</span>
              <span>{payment.customer.meterNumber}</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 border-b-2 border-dashed border-ink py-3 text-[0.75rem]">
          <div className="flex justify-between">
            <span className="text-ink-soft">Bill #</span>
            <span className="font-semibold">{payment.bill.billNumber}</span>
          </div>
          {payment.bill.period ? (
            <div className="flex justify-between">
              <span className="text-ink-soft">Period</span>
              <span>{payment.bill.period}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-ink-soft">Bill amount</span>
            <span>{peso(payment.bill.amountDue)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[0.875rem] font-bold">AMOUNT PAID</span>
            <span className="text-[1.25rem] font-bold text-primary">{peso(payment.amount)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-ink-soft">Method</span>
            <Badge tone={payment.method}>{payment.method}</Badge>
          </div>
          {payment.method === 'gcash' ? (
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-ink-soft">GCash Ref</span>
              <img src={qrcode} alt="GCash QR" className="h-14 w-14 rounded object-cover" />
            </div>
          ) : null}
          {payment.reference ? (
            <div className="flex justify-between">
              <span className="text-ink-soft">Reference</span>
              <span className="font-semibold">{payment.reference}</span>
            </div>
          ) : null}
        </div>

        <p className="pt-3 text-center text-[0.6875rem] text-ink-soft">{payment.store.footer}</p>
      </div>
    </div>
  )
}
