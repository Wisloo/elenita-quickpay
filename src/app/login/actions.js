'use server'

import { signIn } from '../../auth.js'
import { AuthError } from 'next-auth'

export async function loginUser(prevState, formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    return {
      success: false,
      error: 'Please enter both email and password.',
    }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/',
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password.' }
        default:
          return { success: false, error: 'Authentication failed. Please try again.' }
      }
    }
    throw error
  }
}
