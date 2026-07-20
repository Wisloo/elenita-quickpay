'use server'

import { db } from '../../db/index.js'
import { contactMessages } from '../../db/schema.js'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
})

export async function submitContact(prevState, formData) {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, message } = validatedFields.data

  try {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL is not set. Simulating contact database write.')
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true }
    }

    await db.insert(contactMessages).values({
      name,
      email,
      message,
    })

    return { success: true }
  } catch (error) {
    console.error('Database error during contact message insertion:', error)
    return {
      success: false,
      errors: { form: 'Failed to send message. Please try again.' },
    }
  }
}
