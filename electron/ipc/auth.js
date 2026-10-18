import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { compareSync, hashSync } from 'bcryptjs'
import { getDb, schema } from '../db/index.js'

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

const changePasswordSchema = z.object({
  userId: z.number().int().positive(),
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
})

export function login(arg) {
  const { username, password } = loginSchema.parse(arg)
  const user = getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username.toLowerCase()))
    .get()
  if (!user || !user.active || !compareSync(password, user.passwordHash)) {
    throw new Error('Invalid username or password')
  }
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role
  }
}

export function changePassword(arg) {
  const { userId, oldPassword, newPassword } = changePasswordSchema.parse(arg)
  const db = getDb()
  const user = db.select().from(schema.users).where(eq(schema.users.id, userId)).get()
  if (!user || !user.active) throw new Error('User not found')
  if (!compareSync(oldPassword, user.passwordHash)) throw new Error('Current password is incorrect')
  db.update(schema.users)
    .set({ passwordHash: hashSync(newPassword, 10) })
    .where(eq(schema.users.id, userId))
    .run()
  return { changed: true }
}
