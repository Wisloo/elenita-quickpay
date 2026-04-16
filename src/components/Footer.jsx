import { Link } from 'react-router-dom'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © {year} QuickPay Elenita. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link
              to="/how-to-pay"
              className="text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline"
            >
              How to Pay
            </Link>
            <Link
              to="/contact"
              className="text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
