import { useState } from 'react'
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'
import api from '../lib/api.js'
import logo from '../assets/elenitaheightslogo.png'
import { ErrorNote, Field } from '../components/ui.jsx'
import { toast } from '../lib/toast.jsx'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const user = await api.auth.login({ username, password })
      toast(`Welcome, ${user.fullName}`)
      onLogin(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-ink p-6">
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rotate-12 bg-primary opacity-60" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 -rotate-12 bg-orange opacity-80" />
      <div className="pointer-events-none absolute right-24 bottom-24 h-40 w-40 rounded-full border-8 border-aqua opacity-70" />
      <div className="pointer-events-none absolute top-32 left-32 h-24 w-24 rotate-45 bg-purple opacity-70" />

      <form onSubmit={submit} className="card anim-in relative z-10 w-full max-w-sm px-6 py-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src={logo} alt="Elenita Heights" className="h-16 w-16 rounded-[0.5rem] object-cover" />
          <div>
            <h1 className="text-[1.375rem] font-bold tracking-tight text-ink">QuickPay POS</h1>
            <p className="mt-1 text-[0.6875rem] font-bold tracking-[0.18em] text-primary uppercase">
              Elenita Heights Water Billing
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <ErrorNote>{error}</ErrorNote>
          <Field label="Username">
            <div className="relative">
              <UserIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input !pl-9"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          </Field>
          <Field label="Password">
            <div className="relative">
              <LockClosedIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input !pl-9"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </Field>
          <button className="btn-primary mt-2 w-full !py-2.5" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="text-center text-[0.6875rem] text-ink-soft">
            Default: admin / admin — change it in Settings
          </p>
        </div>
      </form>
    </div>
  )
}
