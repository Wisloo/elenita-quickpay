function ContactPage() {
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

      {/* MVP: Form UI only (no backend submission logic yet). */}
      <form
        className="mt-8 space-y-5 rounded-2xl bg-white p-6 ring-1 ring-slate-200"
        onSubmit={(e) => {
          // Prevent a full page reload. Hook Firebase/Firestore submission here later.
          e.preventDefault()
        }}
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-900"
          >
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
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-900"
          >
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
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-slate-900"
          >
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
        </div>

        <button
          type="submit"
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Send Message
        </button>
      </form>

      {/* Placeholder for additional contact details */}
      <section className="mt-8 rounded-2xl bg-slate-50 p-6 border border-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          Additional Contact Details (Placeholder)
        </h2>
        <ul className="mt-3 text-sm text-slate-800 space-y-1">
          <li>
            <span className="font-semibold">Barangay Office:</span> (Placeholder)
            (0XX) XXX-XXXX
          </li>
          <li>
            <span className="font-semibold">Email:</span> (Placeholder)
            barangay@example.com
          </li>
          <li>
            <span className="font-semibold">Address:</span> (Placeholder)
            Barangay Hall, Elenita
          </li>
        </ul>
      </section>
    </div>
  )
}

export default ContactPage
