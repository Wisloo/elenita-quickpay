import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BanknotesIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import api from '../lib/api.js'
import { getSession } from '../lib/session.js'
import { peso, formatDateTime, todayIso } from '../lib/format.js'
import { Badge, EmptyState, Spinner, StatCard } from '../components/ui.jsx'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getSession()
    let cancelled = false
    ;(async () => {
      try {
        const [daily, unpaid, customers] = await Promise.all([
          api.reports.daily({ actorId: user.id, date: todayIso() }),
          api.bills.list({ actorId: user.id, status: 'unpaid', limit: 500 }),
          api.customers.list({})
        ])
        if (!cancelled) setData({ daily, unpaidCount: unpaid.length, customerCount: customers.length })
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return <div className="card px-4 py-3 text-[0.875rem] font-medium text-red-600">{error}</div>
  }
  if (!data) return <Spinner />

  const recent = [...data.daily.payments].reverse().slice(0, 8)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Collections"
          value={peso(data.daily.total)}
          sub={`${data.daily.count} payment${data.daily.count === 1 ? '' : 's'}`}
          accent="aqua"
          icon={<BanknotesIcon className="h-8 w-8" />}
        />
        <StatCard
          label="Unpaid Bills"
          value={data.unpaidCount}
          sub="awaiting payment"
          accent="orange"
          icon={<DocumentTextIcon className="h-8 w-8" />}
        />
        <StatCard
          label="Active Customers"
          value={data.customerCount}
          sub="registered accounts"
          accent="primary"
          icon={<UserGroupIcon className="h-8 w-8" />}
        />
        <StatCard
          label="Bills Issued Today"
          value={data.billsIssued}
          sub={`cash ${peso(data.daily.byMethod.cash)} · gcash ${peso(data.daily.byMethod.gcash)}`}
          accent="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card anim-in p-4 lg:col-span-1">
          <h2 className="section-title mb-3">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <Link to="/payment" className="btn-primary w-full !justify-start">
              <BanknotesIcon className="h-5 w-5" />
              Record a Payment
            </Link>
            <Link to="/readings" className="btn-ghost w-full !justify-start">
              Enter Meter Reading
            </Link>
            <Link to="/billing" className="btn-ghost w-full !justify-start">
              Manage Bills
            </Link>
            <Link to="/reports" className="btn-ghost w-full !justify-start">
              Open Z-Report
            </Link>
          </div>
        </div>

        <div className="card anim-in overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="section-title">Recent Payments</h2>
            <Link to="/reports" className="text-[0.75rem] font-bold tracking-wider text-primary uppercase hover:underline">
              View report
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              title="No payments recorded today"
              hint="Collections you record will appear here in real time."
              icon={<BanknotesIcon className="h-10 w-10" />}
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Receipt</th>
                  <th className="th">Customer</th>
                  <th className="th">Method</th>
                  <th className="th text-right">Amount</th>
                  <th className="th">Time</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id} className="transition-colors duration-150 hover:bg-mist/60">
                    <td className="td font-semibold text-primary">
                      <Link to={`/receipt/${p.id}`} className="hover:underline">
                        {p.receiptNumber}
                      </Link>
                    </td>
                    <td className="td">
                      {p.customerName}
                      <span className="ml-2 text-[0.6875rem] text-ink-soft">#{p.accountNumber}</span>
                    </td>
                    <td className="td">
                      <Badge tone={p.method}>{p.method}</Badge>
                    </td>
                    <td className="td text-right font-bold">{peso(p.amount)}</td>
                    <td className="td text-ink-soft">{formatDateTime(p.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
