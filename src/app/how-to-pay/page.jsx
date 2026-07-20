'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import gcashqr from '../../assets/qrcode.jpeg'
import { submitPayment } from './actions.js'

function SimplePaymentForm() {
  const [state, formAction, isPending] = useActionState(submitPayment, null)

  return (
    <section className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-slate-200 max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">Submit Your GCash Payment</h2>
      {state?.success && <div className="mb-4 text-green-600 text-center font-medium">Thank you! Your payment was submitted.</div>}
      {state?.errors?.form && <div className="mb-4 text-red-600 text-center font-medium">{state.errors.form}</div>}
      
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-base font-medium text-slate-900">Name</label>
          <input
            type="text"
            name="name"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-lg"
          />
          {state?.errors?.name && <span className="text-red-500 text-sm">{state.errors.name[0]}</span>}
        </div>
        <div>
          <label className="block text-base font-medium text-slate-900">Account Number</label>
          <input
            type="text"
            name="accountNumber"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-lg"
          />
          {state?.errors?.accountNumber && <span className="text-red-500 text-sm">{state.errors.accountNumber[0]}</span>}
        </div>
        <div>
          <label className="block text-base font-medium text-slate-900">Amount Paid</label>
          <input
            type="number"
            name="amount"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-lg"
          />
          {state?.errors?.amount && <span className="text-red-500 text-sm">{state.errors.amount[0]}</span>}
        </div>
        <div>
          <label className="block text-base font-medium text-slate-900">GCash Reference Number</label>
          <input
            type="text"
            name="reference"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-lg"
          />
          {state?.errors?.reference && <span className="text-red-500 text-sm">{state.errors.reference[0]}</span>}
        </div>
        <div>
          <label className="block text-base font-medium text-slate-900">Upload Receipt</label>
          <input
            type="file"
            name="receiptFile"
            accept="image/*"
            className="mt-1 block w-full text-base"
          />
          {state?.errors?.receipt && <span className="text-red-500 text-sm">{state.errors.receipt[0]}</span>}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </section>
  )
}

export default function PaymentPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-12">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          How to Pay Your Water Bill
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-700">
          Clear, step-by-step guidance for Elenita residents. Replace the
          placeholders below with official details from your water utility.
        </p>
      </header>

      {/* Step-by-step checklist */}
      <section className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Step-by-step checklist
        </h2>
        <ol className="mt-4 list-decimal pl-5 space-y-2 text-slate-800">
          <li>Prepare your account number and the latest bill (or customer name).</li>
          <li>Pay the exact amount due (or confirm partial payment rules).</li>
          <li>Keep your receipt / reference number and take a photo for backup.</li>
          <li>If needed, confirm your payment status with the utility after processing time.</li>
        </ol>
      </section>

      {/* GCash QR code */}
      <section className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-slate-200 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Pay via GCash</h2>
        <Image
          src={gcashqr}
          alt="GCash QR Code"
          className="w-56 h-56 object-contain mb-4 rounded-xl border border-slate-200 shadow"
        />
        <p className="text-sm text-slate-700 text-center">
          Scan this QR code with your GCash app to pay your water bill.<br />
          Don’t forget to save your reference number and upload your receipt!
        </p>
      </section>

      <SimplePaymentForm />
    </div>
  )
}
