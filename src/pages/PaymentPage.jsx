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
          <li>
            Prepare your account number and the latest bill (or customer name).
          </li>
          <li>
            Choose a payment method (payment center or official online option).
          </li>
          <li>Pay the exact amount due (or confirm partial payment rules).</li>
          <li>
            Keep your receipt / reference number and take a photo for backup.
          </li>
          <li>
            If needed, confirm your payment status with the utility after
            processing time.
          </li>
        </ol>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Current Payment Methods */}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Current Payment Methods
          </h2>
          <ul className="mt-4 list-disc pl-5 space-y-2 text-slate-800">
            <li>
              <span className="font-semibold">Official payment centers:</span>{' '}
              Pay in-person at authorized locations.
            </li>
            <li>
              <span className="font-semibold">Official online portal:</span>{' '}
              (Placeholder) If an official portal exists, you can pay online.
            </li>
            <li>
              <span className="font-semibold">Other official options:</span>{' '}
              (Placeholder) e-wallet / bank payment options if supported.
            </li>
          </ul>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Note:</span> Only use payment
              methods confirmed by the water utility / barangay announcements.
            </p>
          </div>
        </section>

        {/* Payment Center Details */}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Payment Center Details
          </h2>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Center A</h3>
              <ul className="mt-2 text-sm text-slate-800 space-y-1">
                <li>
                  <span className="font-semibold">Address:</span> (Placeholder)
                  123 Main Road, Elenita
                </li>
                <li>
                  <span className="font-semibold">Hours:</span> (Placeholder)
                  Mon–Fri 8:00 AM – 5:00 PM
                </li>
                <li>
                  <span className="font-semibold">Contact:</span> (Placeholder)
                  +63 9XX XXX XXXX
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Center B</h3>
              <ul className="mt-2 text-sm text-slate-800 space-y-1">
                <li>
                  <span className="font-semibold">Address:</span> (Placeholder)
                  Barangay Hall Annex, Elenita
                </li>
                <li>
                  <span className="font-semibold">Hours:</span> (Placeholder)
                  Mon–Sat 9:00 AM – 4:00 PM
                </li>
                <li>
                  <span className="font-semibold">Contact:</span> (Placeholder)
                  (0XX) XXX-XXXX
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-amber-50 p-4 border border-amber-200">
              <p className="text-sm text-slate-800">
                <span className="font-semibold">Tip:</span> Arrive early on due
                dates. Ask for a printed receipt and verify the amount paid.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Online Payment Guide */}
      <section className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Online Payment Guide
        </h2>
        <p className="mt-3 text-slate-700">
          (Placeholder) If the water utility has an official website or online
          portal, link it here and provide updated steps.
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-800">
            Official link placeholder:{' '}
            <a
              href="#"
              className="text-indigo-700 underline underline-offset-4"
            >
              https://official-portal.example
            </a>
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Replace the URL above with the real official link.
          </p>
        </div>

        <ul className="mt-4 list-disc pl-5 space-y-2 text-slate-800">
          <li>Log in / create an account (if required).</li>
          <li>Enter your account number and verify the billing details.</li>
          <li>Choose a supported payment method (bank/e-wallet/card).</li>
          <li>Save the receipt / reference number after payment.</li>
        </ul>
      </section>

      {/* Video Tutorial Placeholder */}
      <section className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Video Tutorial (Placeholder)
        </h2>
        <p className="mt-3 text-slate-700">
          Embed an official YouTube tutorial here (from the utility or barangay)
          when available.
        </p>

        <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/*
            Replace VIDEO_ID with the official YouTube video's ID.

            Example:
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          */}
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/VIDEO_ID"
            title="How to Pay Water Bill - QuickPay Elenita"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  )
}

export default PaymentPage
