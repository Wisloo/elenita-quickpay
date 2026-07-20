'use server'

import { db } from '../../db/index.js'
import { payments } from '../../db/schema.js'
import { z } from 'zod'

const paymentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  accountNumber: z.string().min(5, 'Account number must be at least 5 characters'),
  amount: z.coerce.number().positive('Amount must be positive'),
  reference: z.string().min(5, 'Reference number must be at least 5 characters'),
  receipt: z.string().optional(),
})

export async function submitPayment(prevState, formData) {
  const validatedFields = paymentSchema.safeParse({
    name: formData.get('name'),
    accountNumber: formData.get('accountNumber'),
    amount: formData.get('amount'),
    reference: formData.get('reference'),
    receipt: formData.get('receipt') || undefined,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, accountNumber, amount, reference, receipt } = validatedFields.data

  try {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL is not set. Simulating database write.')
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    }

    await db.insert(payments).values({
      name,
      accountNumber,
      amount: amount.toString(),
      reference,
      receipt: receipt || null,
    })

    return { success: true }
  } catch (error) {
    console.error('Database error during payment insertion:', error)
    return {
      success: false,
      errors: { form: 'Database submission failed. Please try again.' },
    }
  }
}
