import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '../db/index.js'
import { requireAdmin } from './helpers.js'

const EDITABLE_KEYS = ['storeName', 'storeAddress', 'storeContact', 'receiptFooter']

const setSchema = z.object({
  actorId: z.number().int().positive(),
  key: z.enum(['storeName', 'storeAddress', 'storeContact', 'receiptFooter']),
  value: z.string().max(500)
})

export function get(arg) {
  requireAdmin(arg?.actorId)
  const rows = getDb().select().from(schema.settings).all()
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  const out = {}
  for (const key of EDITABLE_KEYS) out[key] = map[key] ?? ''
  return out
}

export function set(arg) {
  const data = setSchema.parse(arg)
  requireAdmin(data.actorId)
  getDb()
    .insert(schema.settings)
    .values({ key: data.key, value: data.value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: data.value } })
    .run()
  return { key: data.key, value: data.value }
}
