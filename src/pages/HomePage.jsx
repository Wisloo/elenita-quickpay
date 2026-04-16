import { Link } from 'react-router-dom'
import elenitasignboard from '../assets/elenitasignboard.png'

function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              QuickPay Elenita
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-700">
              Simplify water bill payments for Elenita residents — skip the lines,
              pay with clear guidance, and stay informed with community updates.
            </p>

            {/* Call to Action */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/how-to-pay"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                How to Pay (Water Bill)
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Contact Us
              </Link>
            </div>

            {/* Key benefits */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <h2 className="text-base font-semibold text-slate-900">
                  Skip the Lines
                </h2>
                <p className="mt-1 text-sm text-slate-700">
                  Know your options and avoid unnecessary trips.
                </p>
              </div>
              <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <h2 className="text-base font-semibold text-slate-900">
                  Pay from Your Phone
                </h2>
                <p className="mt-1 text-sm text-slate-700">
                  Use official online channels when available.
                </p>
              </div>
              <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <h2 className="text-base font-semibold text-slate-900">
                  Stay Informed
                </h2>
                <p className="mt-1 text-sm text-slate-700">
                  Get important community and utility reminders.
                </p>
              </div>
            </div>
          </div>

          {/* image for elenita */}
          <div className="rounded-2xl bg-white p-6 sm:p-8 ring-1 ring-slate-200">
            <div className="aspect-[4/3] w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
              <img
                src={elenitasignboard}
                alt="Elenita Signboard"
                className="w-full h-full object-cover object-center rounded-xl                git remote remove origin
                git remote add origin https://github.com/Wisloo/elenita-quickpay.git"
              />
            </div>

            <div className="mt-6">
              <h2 className="text-base font-semibold text-slate-900">
                Quick Reminder
              </h2>
              <p className="mt-1 text-sm text-slate-700">
                Always use official payment channels and keep your receipt for
                reference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Optional space for future community info */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-12">
        <div className="rounded-2xl bg-indigo-50 p-6 ring-1 ring-indigo-100">
          <h2 className="text-lg font-semibold text-slate-900">
            Community Information (Coming Soon)
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Placeholder for announcements, schedules, and important notices for
            Elenita residents.
          </p>
        </div>
      </section>
    </div>
  )
}

export default HomePage
