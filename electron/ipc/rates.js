import { z } from 'zod'
import { desc, eq } from 'drizzle-orm'
import { getDb, schema } from '../db/index.js'
import { getActor, requireAdmin, toCents, toIso, toPesos } from './helpers.js'

const createSchema = z.object({
  actorId: z.number().int().positive(),
  name: z.string().trim().min(1, 'Rate name is required'),
  perCubicMeter: z.number().nonnegative('Rate must be zero or more'),
  fixedFee: z.number().nonnegative().optional().default(0),
  effectiveFrom: z.string().trim().optional().default('')
})

const updateSchema = createSchema.extend({ id: z.number().int().positive() })

function shape(row) {
  return {
    id: row.id,
    name: row.name,
    perCubicMeter: toPesos(row.perCubicMeterCents),
    fixedFee: toPesos(row.fixedFeeCents),
    active: row.active,
    effectiveFrom: row.effectiveFrom ?? '',
    createdAt: toIso(row.createdAt)
  }
}

export function list(arg) {
  getActor(arg?.actorId)
  const rows = getDb()
    .select()
    .from(schema.rates)
    .orderBy(desc(schema.rates.active), desc(schema.rates.id))
    .all()
  return rows.map(shape)
}

export function create(arg) {
  const data = createSchema.parse(arg)
  getActor(data.actorId)
  const db = getDb()
  const inserted = db
    .insert(schema.rates)
    .values({
      name: data.name,
      perCubicMeterCents: toCents(data.perCubicMeter),
      fixedFeeCents: toCents(data.fixedFee),
      active: false,
      effectiveFrom: data.effectiveFrom || null
    })
    .returning()
    .get()
  return shape(inserted)
}

export function update(arg) {
  const data = updateSchema.parse(arg)
  getActor(data.actorId)
  const db = getDb()
  const updated = db
    .update(schema.rates)
    .set({
      name: data.name,
      perCubicMeterCents: toCents(data.perCubicMeter),
      fixedFeeCents: toCents(data.fixedFee),
      effectiveFrom: data.effectiveFrom || null
    })
    .where(eq(schema.rates.id, data.id))
    .returning()
    .get()
  if (!updated) throw new Error('Rate not found')
  return shape(updated)
}

export function setActive(arg) {
  const { actorId, id } = z
    .object({ actorId: z.number().int().positive(), id: z.number().int().positive() })
    .parse(arg)
  requireAdmin(actorId)
  const db = getDb()
  const row = db.select().from(schema.rates).where(eq(schema.rates.id, id)).get()
  if (!row) throw new Error('Rate not found')
  db.transaction((tx) => {
    tx.update(schema.rates).set({ active: false }).run()
    tx.update(schema.rates).set({ active: true }).where(eq(schema.rates.id, id)).run()
  })
  return shape({ ...row, active: true })
}
