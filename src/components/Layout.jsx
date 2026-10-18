import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BanknotesIcon,
  ChartBarIcon,
  BoltIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  ArrowLeftStartOnRectangleIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import logo from '../assets/elenitaheightslogo.png'
import { clearSession } from '../lib/session.js'
import { Badge } from './ui.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/payment', label: 'Record Payment', icon: BanknotesIcon },
  { to: '/customers', label: 'Customers', icon: UsersIcon },
  { to: '/readings', label: 'Meter Readings', icon: BoltIcon },
  { to: '/billing', label: 'Billing', icon: DocumentTextIcon },
  { to: '/reports', label: 'Z-Report', icon: ChartBarIcon }
]

const TITLES = [
  ['/receipt/', 'Receipt'],
  ['/payment', 'Record Payment'],
  ['/customers/', 'Customer Account'],
  ['/customers', 'Customers'],
  ['/readings', 'Meter Readings'],
  ['/billing', 'Billing'],
  ['/reports', 'Z-Report'],
  ['/settings', 'Settings'],
  ['/', 'Dashboard']
]

export default function Layout({ user, onLogout }) {
  const location = useLocation()
  const title =
    TITLES.find(([prefix], i) =>
      prefix === '/' ? location.pathname === '/' : location.pathname.startsWith(prefix)
    )?.[1] ?? 'Dashboard'

  const handleLogout = () => {
    clearSession()
    onLogout()
  }

  return (
    <div className="flex min-h-[100dvh]">
      <aside className="no-print fixed inset-y-0 left-0 z-100 flex w-60 flex-col bg-ink px-3 py-4">
        <div className="flex items-center gap-3 px-2 pb-4">
          <img src={logo} alt="Elenita Heights" className="h-10 w-10 rounded-[0.5rem] object-cover" />
          <div>
            <p className="text-[0.875rem] font-bold tracking-tight text-white">QuickPay POS</p>
            <p className="text-[0.6875rem] font-medium tracking-[0.12em] text-aqua uppercase">
              Elenita Heights
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
          {user.role === 'admin' ? (
            <NavLink
              to="/settings"
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <Cog6ToothIcon className="h-5 w-5 shrink-0" />
              Settings
            </NavLink>
          ) : null}
        </nav>

        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="min-w-0">
              <p className="truncate text-[0.8125rem] font-semibold text-white">{user.fullName}</p>
              <Badge tone={user.role}>{user.role}</Badge>
            </div>
            <button className="btn-ghost !border-0 !px-2 !text-slate-300 hover:!bg-white/10 hover:!text-white" onClick={handleLogout} title="Sign out">
              <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      <div className="ml-60 flex min-h-[100dvh] flex-1 flex-col">
        <header className="no-print sticky top-0 z-100 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded-full bg-orange" />
            <h1 className="text-[1.125rem] font-bold tracking-tight text-ink">{title}</h1>
          </div>
          <p className="text-[0.75rem] font-medium tracking-[0.12em] text-ink-soft uppercase">
            {new Date().toLocaleDateString('en-PH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </header>

        <main key={location.pathname} className="anim-in flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
