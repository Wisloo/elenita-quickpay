import { eq } from 'drizzle-orm'
import { getDb, schema } from '../db/index.js'

export function getActor(actorId) {
  const user = getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, Number(actorId)))
    .get()
  if (!user || !user.active) throw new Error('Session expired. Please sign in again.')
  return user
}

export function requireAdmin(actorId) {
  const user = getActor(actorId)
  if (user.role !== 'admin') throw new Error('Admin privileges required')
  return user
}

export function toCents(pesos) {
  const n = Number(pesos)
  if (!Number.isFinite(n) || n < 0) throw new Error('Invalid amount')
  return Math.round(n * 100)
}

export function toPesos(cents) {
  return (Number(cents || 0) / 100).toFixed(2)
}

export function toIso(value) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
