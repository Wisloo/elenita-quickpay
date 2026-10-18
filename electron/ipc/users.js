import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { hashSync } from 'bcryptjs'
import { getDb, schema } from '../db/index.js'
import { requireAdmin } from './helpers.js'

const createSchema = z.object({
  actorId: z.number().int().positive(),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z0-9_.-]+$/, 'Username may only contain lowercase letters, numbers, . _ -'),
  fullName: z.string().trim().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'cashier'])
})

const updateSchema = z.object({
  actorId: z.number().int().positive(),
  id: z.number().int().positive(),
  fullName: z.string().trim().min(1).optional(),
  role: z.enum(['admin', 'cashier']).optional()
})

const toggleSchema = z.object({
  actorId: z.number().int().positive(),
  id: z.number().int().positive()
})

const resetSchema = z.object({
  actorId: z.number().int().positive(),
  id: z.number().int().positive(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
})

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    fullName: row.fullName,
    role: row.role,
    active: row.active
  }
}

export function list(arg) {
  const { actorId } = z.object({ actorId: z.number().int().positive() }).parse(arg)
  requireAdmin(actorId)
  return getDb()
    .select()
    .from(schema.users)
    .orderBy(schema.users.username)
    .all()
    .map(publicUser)
}

export function create(arg) {
  const data = createSchema.parse(arg)
  requireAdmin(data.actorId)
  const db = getDb()
  const username = data.username.toLowerCase()
  const existing = db.select().from(schema.users).where(eq(schema.users.username, username)).get()
  if (existing) throw new Error('Username already exists')
  const inserted = db
    .insert(schema.users)
    .values({
      username,
      passwordHash: hashSync(data.password, 10),
      fullName: data.fullName,
      role: data.role,
      active: true
    })
    .returning()
    .get()
  return publicUser(inserted)
}

export function update(arg) {
  const data = updateSchema.parse(arg)
  const actor = requireAdmin(data.actorId)
  if (actor.id === data.id && data.role && data.role !== 'admin') {
    throw new Error('You cannot remove your own admin role')
  }
  const db = getDb()
  const set = {}
  if (data.fullName !== undefined) set.fullName = data.fullName
  if (data.role !== undefined) set.role = data.role
  const updated = db.update(schema.users).set(set).where(eq(schema.users.id, data.id)).returning().get()
  if (!updated) throw new Error('User not found')
  return publicUser(updated)
}

export function toggleActive(arg) {
  const data = toggleSchema.parse(arg)
  const actor = requireAdmin(data.actorId)
  const db = getDb()
  const user = db.select().from(schema.users).where(eq(schema.users.id, data.id)).get()
  if (!user) throw new Error('User not found')
  if (actor.id === data.id && user.active) throw new Error('You cannot deactivate your own account')
  const updated = db
    .update(schema.users)
    .set({ active: !user.active })
    .where(eq(schema.users.id, data.id))
    .returning()
    .get()
  return publicUser(updated)
}

export function resetPassword(arg) {
  const data = resetSchema.parse(arg)
  requireAdmin(data.actorId)
  const db = getDb()
  const user = db
    .update(schema.users)
    .set({ passwordHash: hashSync(data.newPassword, 10) })
    .where(eq(schema.users.id, data.id))
    .returning()
    .get()
  if (!user) throw new Error('User not found')
  return { reset: true }
}
