'use client'

import { useActionState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from './actions.js'

function LoginFields() {
  const [state, formAction, isPending] = useActionState(loginUser, null)
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')

  return (
    <div className="bg-white rounded-2xl p-8 ring-1 ring-slate-200 shadow-sm">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign In
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to your QuickPay account to continue.
        </p>
      </header>

      {registered && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-green-700 text-sm font-medium text-center border border-green-200">
          Account created! Please log in below.
        </div>
      )}

      {state?.error && (
        <div className="mb-4 text-red-600 text-sm font-medium text-center">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-900">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-900">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      <footer className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 underline-offset-4 hover:underline">
          Register here
        </Link>
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <LoginFields />
      </Suspense>
    </div>
  )
}
