import { z } from 'zod'
import { and, desc, eq, inArray, like, or } from 'drizzle-orm'
import { getDb, schema, formatNumbered, nextSequence } from '../db/index.js'
import { getActor, requireAdmin, toCents, toIso, toPesos } from './helpers.js'

const listSchema = z.object({
  status: z.enum(['all', 'unpaid', 'partial', 'paid', 'void']).optional().default('all'),
  customerId: z.number().int().positive().optional(),
  search: z.string().trim().optional(),
  limit: z.number().int().positive().max(500).optional().default(200)
})

const createSchema = z.object({
  actorId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  amount: z.number().positive('Amount must be greater than zero'),
  period: z.string().trim().optional().default(''),
  dueDate: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default('')
})

function shape(b, customer) {
  return {
    id: b.id,
    billNumber: b.billNumber,
    customerId: b.customerId,
    customerName: customer?.name ?? '',
    accountNumber: customer?.accountNumber ?? '',
    period: b.period ?? '',
    amountDue: toPesos(b.amountDueCents),
    paid: toPesos(b.paidCents),
    remaining: toPesos(Math.max(0, b.amountDueCents - b.paidCents)),
    dueDate: b.dueDate ?? '',
    status: b.status,
    createdAt: toIso(b.createdAt)
  }
}

export function list(arg) {
  getActor(arg?.actorId)
  const { status, customerId, search, limit } = listSchema.parse(arg ?? {})
  const db = getDb()
  const conds = []
  if (status !== 'all' && status !== 'partial') conds.push(eq(schema.bills.status, status))
  if (status === 'partial') conds.push(inArray(schema.bills.status, ['unpaid', 'partial']))
  if (customerId) conds.push(eq(schema.bills.customerId, customerId))
  if (search) {
    const q = `%${search}%`
    conds.push(
      or(like(schema.bills.billNumber, q), like(schema.customers.name, q), like(schema.customers.accountNumber, q))
    )
  }
  const query = db
    .select({
      bill: schema.bills,
      customerName: schema.customers.name,
      accountNumber: schema.customers.accountNumber
    })
    .from(schema.bills)
    .innerJoin(schema.customers, eq(schema.bills.customerId, schema.customers.id))
  const rows = (conds.length ? query.where(and(...conds)) : query)
    .orderBy(desc(schema.bills.id))
    .limit(limit)
    .all()
  return rows.map((r) => shape(r.bill, { name: r.customerName, accountNumber: r.accountNumber }))
}

export function create(arg) {
  const data = createSchema.parse(arg)
  getActor(data.actorId)
  const db = getDb()
  const customer = db
    .select()
    .from(schema.customers)
    .where(eq(schema.customers.id, data.customerId))
    .get()
  if (!customer) throw new Error('Customer not found')
  if (!customer.active) throw new Error('Customer account is inactive')

  const seq = nextSequence('billSeq')
  const year = new Date().getFullYear()
  const inserted = db
    .insert(schema.bills)
    .values({
      billNumber: formatNumbered(`B${year}`, seq),
      customerId: data.customerId,
      readingId: null,
      period: data.period || null,
      amountDueCents: toCents(data.amount),
      paidCents: 0,
      dueDate: data.dueDate || null,
      status: 'unpaid'
    })
    .returning()
    .get()
  return shape(inserted, customer)
}

export function voidBill(arg) {
  const { actorId, id } = z
    .object({ actorId: z.number().int().positive(), id: z.number().int().positive() })
    .parse(arg)
  requireAdmin(actorId)
  const db = getDb()
  const bill = db.select().from(schema.bills).where(eq(schema.bills.id, id)).get()
  if (!bill) throw new Error('Bill not found')
  if (bill.status === 'paid' || bill.paidCents > 0) {
    throw new Error('Cannot void a bill that already has payments')
  }
  const updated = db
    .update(schema.bills)
    .set({ status: 'void' })
    .where(eq(schema.bills.id, id))
    .returning()
    .get()
  return shape(updated)
}
