import { useEffect, useState } from 'react'
import { BanknotesIcon, PrinterIcon } from '@heroicons/react/24/outline'
import api from '../lib/api.js'
import { getSession } from '../lib/session.js'
import { peso, formatDateTime, todayIso } from '../lib/format.js'
import { Badge, EmptyState, ErrorNote, Spinner, StatCard } from '../components/ui.jsx'

export default function Reports() {
  const user = getSession()
  const [date, setDate] = useState(todayIso())
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setError('')
    setData(null)
    ;(async () => {
      try {
        const daily = await api.reports.daily({ actorId: user.id, date })
        if (!cancelled) setData(daily)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [date])

  const store = JSON.parse(sessionStorage.getItem('pos.store') || '{}')

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="label !mb-0">Report date</label>
          <input className="input w-auto" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={() => window.print()} disabled={!data}>
          <PrinterIcon className="h-5 w-5" />
          Print Z-Report
        </button>
      </div>

      <ErrorNote>{error}</ErrorNote>

      {!data ? (
        error ? null : (
          <Spinner />
        )
      ) : (
        <div className="print-sheet flex flex-col gap-4">
          <div className="card px-5 py-4">
            <p className="stat-label">End of Day · Z-Report</p>
            <h2 className="mt-1 text-[1.75rem] font-bold tracking-tight text-ink">
              {new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
            <p className="mt-1 text-[0.75rem] font-medium tracking-[0.12em] text-ink-soft uppercase">
              {store.storeName ?? 'Elenita Heights Water Billing'} · generated{' '}
              {formatDateTime(new Date().toISOString())}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Collected" value={peso(data.total)} accent="aqua" />
            <StatCard label="Payments" value={data.count} accent="primary" />
            <StatCard label="Cash" value={peso(data.byMethod.cash)} accent="orange" />
            <StatCard label="GCash" value={peso(data.byMethod.gcash)} accent="purple" />
          </div>

          {data.byCashier.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="section-title">By Cashier</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="th">Cashier</th>
                    <th className="th text-right">Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byCashier.map((c) => (
                    <tr key={c.name}>
                      <td className="td font-semibold">{c.name}</td>
                      <td className="td text-right font-bold">{peso(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="section-title">Transactions</h3>
              <p className="text-[0.75rem] font-bold tracking-wider text-ink-soft uppercase">
                {data.billsIssued} bill{data.billsIssued === 1 ? '' : 's'} issued
              </p>
            </div>
            {data.payments.length === 0 ? (
              <EmptyState
                title="No transactions on this day"
                hint="Pick another date or record payments to see them here."
                icon={<BanknotesIcon className="h-10 w-10" />}
              />
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="th">Receipt</th>
                    <th className="th">Time</th>
                    <th className="th">Customer</th>
                    <th className="th">Bill</th>
                    <th className="th">Method</th>
                    <th className="th">Cashier</th>
                    <th className="th text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-mist/60">
                      <td className="td font-semibold text-primary">{p.receiptNumber}</td>
                      <td className="td text-ink-soft">{formatDateTime(p.paidAt)}</td>
                      <td className="td">
                        {p.customerName}
                        <span className="ml-2 text-[0.6875rem] text-ink-soft">#{p.accountNumber}</span>
                      </td>
                      <td className="td">{p.billNumber}</td>
                      <td className="td">
                        <Badge tone={p.method}>{p.method}</Badge>
                      </td>
                      <td className="td text-ink-soft">{p.cashierName}</td>
                      <td className="td text-right font-bold">{peso(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
