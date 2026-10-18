import { z } from 'zod'
import { and, desc, eq, gte, lt, or, like } from 'drizzle-orm'
import { getDb, schema, formatNumbered, nextSequence } from '../db/index.js'
import { getActor, toCents, toIso, toPesos } from './helpers.js'

const recordSchema = z.object({
  actorId: z.number().int().positive(),
  billId: z.number().int().positive(),
  amount: z.number().positive('Amount must be greater than zero'),
  method: z.enum(['cash', 'gcash']),
  reference: z.string().trim().optional().default('')
})

const listSchema = z.object({
  search: z.string().trim().optional(),
  limit: z.number().int().positive().max(500).optional().default(100)
})

const getSchema = z.object({ id: z.number().int().positive() })

export function record(arg) {
  const data = recordSchema.parse(arg)
  const actor = getActor(data.actorId)
  const db = getDb()

  const bill = db.select().from(schema.bills).where(eq(schema.bills.id, data.billId)).get()
  if (!bill) throw new Error('Bill not found')
  if (bill.status === 'void') throw new Error('This bill has been voided')
  const remaining = bill.amountDueCents - bill.paidCents
  if (remaining <= 0) throw new Error('This bill is already fully paid')
  const amountCents = toCents(data.amount)
  if (amountCents > remaining + 100) {
    throw new Error('Payment amount is larger than the remaining balance')
  }
  if (data.method === 'gcash' && !data.reference) {
    throw new Error('GCash reference number is required')
  }

  const year = new Date().getFullYear()
  const payment = db.transaction((tx) => {
    const seq = nextSequence('receiptSeq')
    const inserted = tx
      .insert(schema.payments)
      .values({
        receiptNumber: formatNumbered(`R${year}`, seq),
        billId: bill.id,
        customerId: bill.customerId,
        amountCents,
        method: data.method,
        reference: data.reference || null,
        userId: actor.id
      })
      .returning()
      .get()

    const newPaid = bill.paidCents + amountCents
    const status = newPaid >= bill.amountDueCents ? 'paid' : 'partial'
    tx.update(schema.bills)
      .set({ paidCents: newPaid, status })
      .where(eq(schema.bills.id, bill.id))
      .run()
    return { ...inserted, billStatus: status }
  })

  return {
    id: payment.id,
    receiptNumber: payment.receiptNumber,
    amount: toPesos(payment.amountCents),
    method: payment.method,
    reference: payment.reference ?? '',
    paidAt: toIso(payment.paidAt),
    billStatus: payment.billStatus
  }
}

export function get(arg) {
  const { id } = getSchema.parse(arg)
  const db = getDb()
  const row = db
    .select({
      payment: schema.payments,
      bill: schema.bills,
      customer: schema.customers,
      cashier: schema.users
    })
    .from(schema.payments)
    .innerJoin(schema.bills, eq(schema.payments.billId, schema.bills.id))
    .innerJoin(schema.customers, eq(schema.payments.customerId, schema.customers.id))
    .leftJoin(schema.users, eq(schema.payments.userId, schema.users.id))
    .where(eq(schema.payments.id, id))
    .get()
  if (!row) throw new Error('Payment not found')

  const settingsRows = db.select().from(schema.settings).all()
  const settingsMap = Object.fromEntries(settingsRows.map((s) => [s.key, s.value]))

  return {
    id: row.payment.id,
    receiptNumber: row.payment.receiptNumber,
    amount: toPesos(row.payment.amountCents),
    method: row.payment.method,
    reference: row.payment.reference ?? '',
    paidAt: toIso(row.payment.paidAt),
    cashier: row.cashier?.fullName ?? '',
    bill: {
      billNumber: row.bill.billNumber,
      period: row.bill.period ?? '',
      amountDue: toPesos(row.bill.amountDueCents),
      dueDate: row.bill.dueDate ?? '',
      status: row.bill.status
    },
    customer: {
      accountNumber: row.customer.accountNumber,
      name: row.customer.name,
      address: row.customer.address ?? '',
      meterNumber: row.customer.meterNumber ?? ''
    },
    store: {
      name: settingsMap.storeName ?? 'Elenita Heights Water Billing',
      address: settingsMap.storeAddress ?? '',
      contact: settingsMap.storeContact ?? '',
      footer: settingsMap.receiptFooter ?? ''
    }
  }
}

export function list(arg) {
  getActor(arg?.actorId)
  const { search, limit } = listSchema.parse(arg ?? {})
  const db = getDb()
  const conds = []
  if (search) {
    const q = `%${search}%`
    conds.push(
      or(
        like(schema.payments.receiptNumber, q),
        like(schema.customers.name, q),
        like(schema.customers.accountNumber, q),
        like(schema.bills.billNumber, q)
      )
    )
  }
  const query = db
    .select({
      payment: schema.payments,
      billNumber: schema.bills.billNumber,
      customerName: schema.customers.name,
      accountNumber: schema.customers.accountNumber,
      cashierName: schema.users.fullName
    })
    .from(schema.payments)
    .innerJoin(schema.bills, eq(schema.payments.billId, schema.bills.id))
    .innerJoin(schema.customers, eq(schema.payments.customerId, schema.customers.id))
    .leftJoin(schema.users, eq(schema.payments.userId, schema.users.id))
  const rows = (conds.length ? query.where(and(...conds)) : query)
    .orderBy(desc(schema.payments.id))
    .limit(limit)
    .all()
  return rows.map((r) => ({
    id: r.payment.id,
    receiptNumber: r.payment.receiptNumber,
    amount: toPesos(r.payment.amountCents),
    method: r.payment.method,
    reference: r.payment.reference ?? '',
    paidAt: toIso(r.payment.paidAt),
    billNumber: r.billNumber,
    customerName: r.customerName,
    accountNumber: r.accountNumber,
    cashierName: r.cashierName ?? ''
  }))
}

export function forDay(dateIso) {
  const start = new Date(`${dateIso}T00:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  const db = getDb()
  return db
    .select({
      payment: schema.payments,
      billNumber: schema.bills.billNumber,
      customerName: schema.customers.name,
      accountNumber: schema.customers.accountNumber,
      cashierName: schema.users.fullName
    })
    .from(schema.payments)
    .innerJoin(schema.bills, eq(schema.payments.billId, schema.bills.id))
    .innerJoin(schema.customers, eq(schema.payments.customerId, schema.customers.id))
    .leftJoin(schema.users, eq(schema.payments.userId, schema.users.id))
    .where(and(gte(schema.payments.paidAt, start), lt(schema.payments.paidAt, end)))
    .orderBy(schema.payments.paidAt)
    .all()
}

export function between(fromIso, toIsoDate) {
  const start = new Date(`${fromIso}T00:00:00`)
  const end = new Date(`${toIsoDate}T00:00:00`)
  end.setDate(end.getDate() + 1)
  const db = getDb()
  return db
    .select({
      payment: schema.payments,
      cashierName: schema.users.fullName
    })
    .from(schema.payments)
    .leftJoin(schema.users, eq(schema.payments.userId, schema.users.id))
    .where(and(gte(schema.payments.paidAt, start), lt(schema.payments.paidAt, end)))
    .orderBy(schema.payments.paidAt)
    .all()
}
