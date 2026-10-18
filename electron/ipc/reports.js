import { z } from 'zod'
import { and, eq, gte, lt } from 'drizzle-orm'
import { getActor, toIso, toPesos } from './helpers.js'
import { getDb, schema } from '../db/index.js'
import * as paymentsIpc from './payments.js'

const dailySchema = z.object({
  actorId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')
})

const rangeSchema = z.object({
  actorId: z.number().int().positive(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')
})

function dayBounds(dateIso) {
  const start = new Date(`${dateIso}T00:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

function summarize(rows) {
  const byMethod = { cash: 0, gcash: 0 }
  const byCashier = {}
  let totalCents = 0
  const payments = rows.map((r) => {
    const cents = r.payment.amountCents
    totalCents += cents
    byMethod[r.payment.method] = (byMethod[r.payment.method] ?? 0) + cents
    const cashier = r.cashierName ?? 'Unknown'
    byCashier[cashier] = (byCashier[cashier] ?? 0) + cents
    return {
      id: r.payment.id,
      receiptNumber: r.payment.receiptNumber,
      amount: toPesos(cents),
      method: r.payment.method,
      reference: r.payment.reference ?? '',
      paidAt: toIso(r.payment.paidAt),
      billNumber: r.billNumber ?? '',
      customerName: r.customerName ?? '',
      accountNumber: r.accountNumber ?? '',
      cashierName: r.cashierName ?? ''
    }
  })
  return {
    total: toPesos(totalCents),
    count: payments.length,
    byMethod: { cash: toPesos(byMethod.cash ?? 0), gcash: toPesos(byMethod.gcash ?? 0) },
    byCashier: Object.entries(byCashier).map(([name, cents]) => ({
      name,
      total: toPesos(cents)
    })),
    payments
  }
}

export function daily(arg) {
  const { actorId, date } = dailySchema.parse(arg)
  getActor(actorId)
  const { start, end } = dayBounds(date)
  const rows = paymentsIpc.forDay(date)
  const billsThatDay = getDb()
    .select()
    .from(schema.bills)
    .where(and(gte(schema.bills.createdAt, start), lt(schema.bills.createdAt, end)))
    .all()

  return {
    date,
    ...summarize(rows),
    billsIssued: billsThatDay.length
  }
}

export function range(arg) {
  const { actorId, from, to } = rangeSchema.parse(arg)
  getActor(actorId)
  if (from > to) throw new Error('Start date must be on or before end date')
  const rows = paymentsIpc.between(from, to)

  const byDay = {}
  for (const r of rows) {
    const d = new Date(r.payment.paidAt).toISOString().slice(0, 10)
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(r)
  }

  const days = Object.entries(byDay)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, dayRows]) => {
      const s = summarize(dayRows)
      return { date, total: s.total, count: s.count, byMethod: s.byMethod }
    })

  const all = summarize(rows)
  return { from, to, total: all.total, count: all.count, byMethod: all.byMethod, days }
}
