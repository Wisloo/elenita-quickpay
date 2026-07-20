'use client'

import { useActionState } from 'react'
import { submitContact } from './actions.js'

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContact, null)

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-12">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Contact Us
        </h1>
        <p className="mt-3 text-slate-700">
          Questions about water bill payments or community information? Send a
          message below.
        </p>
      </header>

      {state?.success && (
        <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-700 font-medium text-center border border-green-200">
          Thank you! Your message was sent successfully.
        </div>
      )}
      {state?.errors?.form && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700 font-medium text-center border border-red-200">
          {state.errors.form}
        </div>
      )}

      <form action={formAction} className="mt-8 space-y-5 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-900">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Your full name"
            required
          />
          {state?.errors?.name && <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-900">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="you@example.com"
            required
          />
          {state?.errors?.email && <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-900">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Write your message here..."
            required
          />
          {state?.errors?.message && <p className="mt-1 text-sm text-red-600">{state.errors.message[0]}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
        >
          {isPending ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      <section className="mt-8 rounded-2xl bg-slate-50 p-6 border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          Additional Contact Details
        </h2>
        <ul className="mt-3 text-sm text-slate-800 space-y-1">
          <li>
            <span className="font-semibold">Barangay Office:</span> (0XX) XXX-XXXX
          </li>
          <li>
            <span className="font-semibold">Email:</span> barangay@example.com
          </li>
          <li>
            <span className="font-semibold">Address:</span> Barangay Hall, Elenita
          </li>
        </ul>
      </section>
    </div>
  )
}
