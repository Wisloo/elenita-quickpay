'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import elenitaheightslogo from '../assets/elenitaheightslogo.png'
import { signOut } from 'next-auth/react'

function Header({ session }) {
  const pathname = usePathname()

  const getNavLinkClassName = (href) => {
    const base = 'px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
    const active = 'bg-indigo-600 text-white'
    const inactive = 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'

    return `${base} ${isActive ? active : inactive}`
  }

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-900 whitespace-nowrap" aria-label="QuickPay Elenita Home">
            <Image src={elenitaheightslogo} alt="Elenita Heights Logo" className="h-10 w-10 rounded-full" width={40} height={40} /> 
            <span className="hidden sm:inline-block">QuickPay Elenita</span>
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-1 flex-wrap">
            <Link href="/" className={getNavLinkClassName('/')}>
              Home
            </Link>
            <Link href="/how-to-pay" className={getNavLinkClassName('/how-to-pay')}>
              How to Pay
            </Link>
            <Link href="/contact" className={getNavLinkClassName('/contact')}>
              Contact
            </Link>

            {session ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
                <span className="text-sm font-medium text-slate-700 hidden md:inline-block">
                  Hi, {session.user.name.split(' ')[0]}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 pl-2 border-l border-slate-200 ml-1">
                <Link href="/login" className={getNavLinkClassName('/login')}>
                  Sign In
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
