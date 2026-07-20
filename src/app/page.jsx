import { ShieldCheckIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import Image from 'next/image'
import heroImg from '../assets/elenitasignboard.png'

function Feature({ Icon, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white rounded-full p-4 shadow mb-2">
        <Icon className="w-8 h-8 text-blue-600" />
      </div>
      <span className="text-blue-900 font-semibold">{label}</span>
    </div>
  )
}

export default function LandingHero() {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-blue-100 px-4 py-8 relative">
      {/* Header with Login/Register */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <Link href="/login" className="bg-white text-blue-700 font-semibold px-4 py-2 rounded shadow hover:bg-yellow-300">
          Login
        </Link>
        <Link href="/register" className="bg-yellow-400 text-blue-900 font-bold px-4 py-2 rounded shadow hover:bg-yellow-300">
          Register
        </Link>
      </div>
      {/* Main content */}
      <div className="flex flex-col items-center text-center mt-12 sm:mt-0">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-blue-900 mb-4 leading-tight">
          Easy payment<br />with QuickPay Elenita
        </h1>
        <p className="text-blue-800 mb-6 max-w-md">
          QuickPay provides residents with a secure, fast, and easy way to pay water bills online.
        </p>
        <Link
          href="/how-to-pay"
          className="bg-yellow-400 text-blue-900 font-bold px-8 py-3 rounded-lg shadow hover:bg-yellow-300 mb-8 inline-block"
        >
          Get Started
        </Link>
        <Image src={heroImg} alt="Payment illustration" className="w-64 sm:w-96 mb-8 h-auto" priority />
      </div>
      {/* Features */}
      <div className="flex flex-col sm:flex-row gap-8 mt-4">
        <Feature Icon={ShieldCheckIcon} label="Secure" />
        <Feature Icon={BoltIcon} label="Fast Transaction" />
        <Feature Icon={ChartBarIcon} label="Detailed Report" />
      </div>
    </section>
  )
}
