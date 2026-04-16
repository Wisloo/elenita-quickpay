import { Link, NavLink } from 'react-router-dom'
import elenitaheightslogo from '../assets/elenitaheightslogo.png'

// Simple mobile-first header with a title/logo and primary navigation.
// Tip: Replace the text title with an image logo if/when you have one.

const navLinkClassName = ({ isActive }) => {
  const base =
    'px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'

  const active = 'bg-indigo-600 text-white'
  const inactive = 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'

  return `${base} ${isActive ? active : inactive}`
}

function Header() {
  return (
    // logo
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link to ="/" className="flex items-center gap-2 font semibold tracking-tight text-slate-900 whitespace-nowrap" aria-label="QuickPay Elenita Home">
          <img src={elenitaheightslogo} alt="Elenita Heights Logo" className="h-10 w-10 rounded-full"/> 
          <span className="hidden sm:inline-block"> QuickPay Elenita</span>
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-1 flex-wrap">
            <NavLink to="/" end className={navLinkClassName}>
              Home
            </NavLink>
            <NavLink to="/how-to-pay" className={navLinkClassName}>
              How to Pay
            </NavLink>
            <NavLink to="/contact" className={navLinkClassName}>
              Contact
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
