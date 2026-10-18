import { z } from 'zod'
import { and, eq, like, ne, or, desc } from 'drizzle-orm'
import { getDb, schema } from '../db/index.js'
import { getActor, toIso, toPesos } from './helpers.js'

const listSchema = z.object({
  search: z.string().trim().optional(),
  includeInactive: z.boolean().optional()
})

const createSchema = z.object({
  actorId: z.number().int().positive(),
  accountNumber: z.string().trim().min(1, 'Account number is required'),
  name: z.string().trim().min(1, 'Name is required'),
  address: z.string().trim().optional().default(''),
  phone: z.string().trim().optional().default(''),
  meterNumber: z.string().trim().optional().default('')
})

const updateSchema = createSchema.extend({ id: z.number().int().positive() })

function shape(row) {
  return {
    id: row.id,
    accountNumber: row.accountNumber,
    name: row.name,
    address: row.address ?? '',
    phone: row.phone ?? '',
    meterNumber: row.meterNumber ?? '',
    active: row.active,
    createdAt: toIso(row.createdAt)
  }
}

export function list(arg) {
  const { search, includeInactive } = listSchema.parse(arg ?? {})
  const conds = []
  if (!includeInactive) conds.push(eq(schema.customers.active, true))
  if (search) {
    const q = `%${search}%`
    conds.push(
      or(
        like(schema.customers.name, q),
        like(schema.customers.accountNumber, q),
        like(schema.customers.meterNumber, q),
        like(schema.customers.phone, q)
      )
    )
  }
  const query = getDb().select().from(schema.customers)
  const rows = (conds.length ? query.where(and(...conds)) : query)
    .orderBy(schema.customers.name)
    .all()
  return rows.map(shape)
}

export function get(arg) {
  const { id } = z.object({ id: z.number().int().positive() }).parse(arg)
  const row = getDb().select().from(schema.customers).where(eq(schema.customers.id, id)).get()
  if (!row) throw new Error('Customer not found')
  return shape(row)
}

export function create(arg) {
  const data = createSchema.parse(arg)
  getActor(data.actorId)
  const db = getDb()
  const existing = db
    .select()
    .from(schema.customers)
    .where(eq(schema.customers.accountNumber, data.accountNumber))
    .get()
  if (existing) throw new Error(`Account number ${data.accountNumber} already exists`)
  const inserted = db
    .insert(schema.customers)
    .values({
      accountNumber: data.accountNumber,
      name: data.name,
      address: data.address,
      phone: data.phone,
      meterNumber: data.meterNumber,
      active: true
    })
    .returning()
    .get()
  return shape(inserted)
}

export function update(arg) {
  const data = updateSchema.parse(arg)
  getActor(data.actorId)
  const db = getDb()
  const clash = db
    .select()
    .from(schema.customers)
    .where(
      and(
        eq(schema.customers.accountNumber, data.accountNumber),
        ne(schema.customers.id, data.id)
      )
    )
    .get()
  if (clash) throw new Error(`Account number ${data.accountNumber} already exists`)
  const updated = db
    .update(schema.customers)
    .set({
      accountNumber: data.accountNumber,
      name: data.name,
      address: data.address,
      phone: data.phone,
      meterNumber: data.meterNumber
    })
    .where(eq(schema.customers.id, data.id))
    .returning()
    .get()
  if (!updated) throw new Error('Customer not found')
  return shape(updated)
}

export function deactivate(arg) {
  const { actorId, id } = z
    .object({ actorId: z.number().int().positive(), id: z.number().int().positive() })
    .parse(arg)
  getActor(actorId)
  const updated = getDb()
    .update(schema.customers)
    .set({ active: false })
    .where(eq(schema.customers.id, id))
    .returning()
    .get()
  if (!updated) throw new Error('Customer not found')
  return shape(updated)
}

export function statement(arg) {
  const { id } = z.object({ id: z.number().int().positive() }).parse(arg)
  const db = getDb()
  const customer = db.select().from(schema.customers).where(eq(schema.customers.id, id)).get()
  if (!customer) throw new Error('Customer not found')

  const readings = db
    .select()
    .from(schema.readings)
    .where(eq(schema.readings.customerId, id))
    .orderBy(desc(schema.readings.id))
    .limit(50)
    .all()
    .map((r) => ({
      id: r.id,
      readingDate: r.readingDate,
      previousReading: r.previousReading,
      currentReading: r.currentReading,
      consumption: r.consumption,
      amountCents: r.amountCents,
      notes: r.notes ?? '',
      createdAt: toIso(r.createdAt)
    }))

  const billRows = db
    .select()
    .from(schema.bills)
    .where(eq(schema.bills.customerId, id))
    .orderBy(desc(schema.bills.id))
    .limit(50)
    .all()
    .map((b) => ({
      id: b.id,
      billNumber: b.billNumber,
      period: b.period,
      amountDueCents: b.amountDueCents,
      paidCents: b.paidCents,
      dueDate: b.dueDate,
      status: b.status,
      createdAt: toIso(b.createdAt)
    }))

  const paymentRows = db
    .select()
    .from(schema.payments)
    .where(eq(schema.payments.customerId, id))
    .orderBy(desc(schema.payments.id))
    .limit(50)
    .all()
    .map((p) => ({
      id: p.id,
      receiptNumber: p.receiptNumber,
      amountCents: p.amountCents,
      method: p.method,
      reference: p.reference ?? '',
      paidAt: toIso(p.paidAt)
    }))

  const totalBilled = billRows
    .filter((b) => b.status !== 'void')
    .reduce((sum, b) => sum + b.amountDueCents, 0)
  const totalPaid = paymentRows.reduce((sum, p) => sum + p.amountCents, 0)

  return {
    customer: shape(customer),
    readings,
    bills: billRows,
    payments: paymentRows,
    totals: {
      totalBilled: toPesos(totalBilled),
      totalPaid: toPesos(totalPaid),
      balance: toPesos(totalBilled - totalPaid)
    }
  }
}
