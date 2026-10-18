import { z } from 'zod'
import { desc, eq } from 'drizzle-orm'
import { getDb, schema } from '../db/index.js'
import { getActor, toCents, toIso, toPesos } from './helpers.js'
import { formatNumbered, nextSequence } from '../db/index.js'

const listSchema = z.object({
  customerId: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(200).optional().default(50)
})

const createSchema = z.object({
  actorId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  readingDate: z.string().trim().min(1, 'Reading date is required'),
  currentReading: z.number().nonnegative('Reading must be zero or more'),
  notes: z.string().trim().optional().default(''),
  createBill: z.boolean().optional().default(false),
  dueDate: z.string().trim().optional().default('')
})

export function list(arg) {
  getActor(arg?.actorId)
  const { customerId, limit } = listSchema.parse(arg ?? {})
  const db = getDb()
  const query = db
    .select({
      id: schema.readings.id,
      customerId: schema.readings.customerId,
      readingDate: schema.readings.readingDate,
      previousReading: schema.readings.previousReading,
      currentReading: schema.readings.currentReading,
      consumption: schema.readings.consumption,
      amountCents: schema.readings.amountCents,
      notes: schema.readings.notes,
      createdAt: schema.readings.createdAt,
      customerName: schema.customers.name,
      accountNumber: schema.customers.accountNumber
    })
    .from(schema.readings)
    .innerJoin(schema.customers, eq(schema.readings.customerId, schema.customers.id))
  const rows = (customerId
    ? query.where(eq(schema.readings.customerId, customerId))
    : query
  )
    .orderBy(desc(schema.readings.id))
    .limit(limit)
    .all()
  return rows.map((r) => ({
    ...r,
    notes: r.notes ?? '',
    amount: toPesos(r.amountCents),
    createdAt: toIso(r.createdAt)
  }))
}

export function create(arg) {
  const data = createSchema.parse(arg)
  const actor = getActor(data.actorId)
  const db = getDb()

  const customer = db
    .select()
    .from(schema.customers)
    .where(eq(schema.customers.id, data.customerId))
    .get()
  if (!customer) throw new Error('Customer not found')
  if (!customer.active) throw new Error('Customer account is inactive')

  const rate = db
    .select()
    .from(schema.rates)
    .where(eq(schema.rates.active, true))
    .get()
  if (!rate) throw new Error('No active rate configured. Set one in Settings.')

  const lastReading = db
    .select()
    .from(schema.readings)
    .where(eq(schema.readings.customerId, data.customerId))
    .orderBy(desc(schema.readings.id))
    .limit(1)
    .get()

  const previousReading = lastReading ? lastReading.currentReading : 0
  if (data.currentReading < previousReading) {
    throw new Error(
      `Current reading is below previous reading (${previousReading}). Check the meter.`
    )
  }
  const consumption = Math.round((data.currentReading - previousReading) * 100) / 100
  const amountCents = Math.round(consumption * rate.perCubicMeterCents + rate.fixedFeeCents)

  const result = db.transaction((tx) => {
    const reading = tx
      .insert(schema.readings)
      .values({
        customerId: data.customerId,
        readingDate: data.readingDate,
        previousReading,
        currentReading: data.currentReading,
        consumption,
        rateId: rate.id,
        amountCents,
        notes: data.notes || null,
        userId: actor.id
      })
      .returning()
      .get()

    let bill = null
    if (data.createBill && amountCents > 0) {
      const seq = nextSequence('billSeq')
      bill = tx
        .insert(schema.bills)
        .values({
          billNumber: formatNumbered(`B${data.readingDate.slice(0, 4)}`, seq),
          customerId: data.customerId,
          readingId: reading.id,
          period: data.readingDate.slice(0, 7),
          amountDueCents: amountCents,
          paidCents: 0,
          dueDate: data.dueDate || null,
          status: 'unpaid'
        })
        .returning()
        .get()
    }
    return { reading, bill }
  })

  return {
    reading: {
      id: result.reading.id,
      readingDate: result.reading.readingDate,
      previousReading: result.reading.previousReading,
      currentReading: result.reading.currentReading,
      consumption: result.reading.consumption,
      amount: toPesos(result.reading.amountCents),
      notes: result.reading.notes ?? ''
    },
    bill: result.bill
      ? {
          id: result.bill.id,
          billNumber: result.bill.billNumber,
          amount: toPesos(result.bill.amountDueCents),
          status: result.bill.status
        }
      : null
  }
}
