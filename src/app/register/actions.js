'use server'

import { db } from '../../db/index.js'
import { users } from '../../db/schema.js'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function registerUser(prevState, formData) {
  const name = formData.get('name')
  const email = formData.get('email')
  const password = formData.get('password')

  const validatedFields = registerSchema.safeParse({ name, email, password })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      return {
        success: false,
        errors: { email: ['Email already registered'] },
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    })

    return { success: true }
  } catch (error) {
    console.error('Registration database error:', error)
    return {
      success: false,
      errors: { form: 'Registration failed. Please try again.' },
    }
  }
}
