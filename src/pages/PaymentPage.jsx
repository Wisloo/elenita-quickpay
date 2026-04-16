import gcashqr from '../assets/qrcode.jpeg'
import { useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

function SimplePaymentForm() {
  const [form, setForm] = useState({
    name: '',
    accountNumber: '',
    amount: '',
    reference: '',
    receipt: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value, files } = e.target
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      let receiptUrl = ''
      if (form.receipt) {
        const storage = getStorage()
        const storageRef = ref(storage, `receipts/${Date.now()}_${form.receipt.name}`)
        await uploadBytes(storageRef, form.receipt)
        receiptUrl = await getDownloadURL(storageRef)
      }
      await addDoc(collection(db, 'payments'), {
        name: form.name,
        accountNumber: form.accountNumber,
        amount: form.amount,
        reference: form.reference,
        receipt: receiptUrl,
        timestamp: serverTimestamp(),
      })
      setSuccess(true)
      setForm({
        name: '',
        accountNumber: '',
        amount: '',
        reference: '',
        receipt: null,
      })
    } catch (err) {
      setError('Submission failed. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <section className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-slate-200 max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">Submit Your GCash Payment</h2>
      {success && <div className="mb-4 text-green-600 text-center">Thank you! Your payment was submitted.</div>}
      {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-base font-medium text-slate-900">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-lg"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-slate-900">Account Number</label>
          <input
            type="text"
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-lg"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-slate-900">Amount Paid</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-lg"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-slate-900">GCash Reference Number</label>
          <input
            type="text"
            name="reference"
            value={form.reference}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-lg"
          />
        </div>
        <div>
          <label className="block text-base font-medium text-slate-900">Upload Receipt</label>
          <input
            type="file"
            name="receipt"
            accept="image/*"
            onChange={handleChange}
            required
            className="mt-1 block w-full text-base"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </section>
  )
}

function PaymentPage() {
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

      {/* Step-by-step (high readability) */}
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
        <img
          src={gcashqr}
          alt="GCash QR Code"
          className="w-56 h-56 object-contain mb-4 rounded-xl border border-slate-200 shadow"
        />
        <p className="text-sm text-slate-700 text-center">
          Scan this QR code with your GCash app to pay your water bill.<br />
          Don’t forget to save your reference number and upload your receipt!
        </p>
      </section>

      {/* The form actor */}
      <SimplePaymentForm />
    </div>
  )
}
export default PaymentPage