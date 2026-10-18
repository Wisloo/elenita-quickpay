import { useEffect, useState } from 'react'
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  KeyIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import api from '../lib/api.js'
import { getSession } from '../lib/session.js'
import { Badge, ErrorNote, Field, Spinner, SuccessNote, Tabs } from '../components/ui.jsx'
import { toast } from '../lib/toast.jsx'

export default function Settings({ user }) {
  const [tab, setTab] = useState('store')
  const [isAdmin] = useState(user.role === 'admin')

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { value: 'store', label: 'Store Info' },
          { value: 'rates', label: 'Rates' },
          { value: 'users', label: 'Users' },
          { value: 'account', label: 'My Account' },
          { value: 'data', label: 'Backup & Data' }
        ]}
      />
      {tab === 'store' ? <StoreTab user={user} /> : null}
      {tab === 'rates' ? <RatesTab user={user} /> : null}
      {tab === 'users' ? <UsersTab user={user} /> : null}
      {tab === 'account' ? <AccountTab user={user} /> : null}
      {tab === 'data' ? <DataTab user={user} /> : null}
      {!isAdmin ? null : null}
    </div>
  )
}

function StoreTab({ user }) {
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.settings
      .get(user.id)
      .then(setForm)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <ErrorNote>{error}</ErrorNote>
  if (!form) return <Spinner />

  const set = (key) => (e) => {
    setSaved(false)
    setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      for (const [key, value] of Object.entries(form)) {
        await api.settings.set({ actorId: user.id, key, value })
      }
      sessionStorage.setItem('pos.store', JSON.stringify(form))
      setSaved(true)
      toast('Store info saved')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="card anim-in flex max-w-2xl flex-col gap-3 p-4">
      <h2 className="section-title">Store Information</h2>
      <p className="text-[0.8125rem] text-ink-soft">Shown on printed receipts and reports.</p>
      <ErrorNote>{error}</ErrorNote>
      <SuccessNote>{saved ? 'Store info saved.' : ''}</SuccessNote>
      <Field label="Store Name">
        <input className="input" value={form.storeName} onChange={set('storeName')} />
      </Field>
      <Field label="Address">
        <input className="input" value={form.storeAddress} onChange={set('storeAddress')} />
      </Field>
      <Field label="Contact Number">
        <input className="input" value={form.storeContact} onChange={set('storeContact')} />
      </Field>
      <Field label="Receipt Footer Message">
        <input className="input" value={form.receiptFooter} onChange={set('receiptFooter')} />
      </Field>
      <div className="mt-1">
        <button className="btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save Store Info'}
        </button>
      </div>
    </form>
  )
}

function RatesTab({ user }) {
  const [rows, setRows] = useState(null)
  const [form, setForm] = useState({ name: '', perCubicMeter: '', fixedFee: '0', effectiveFrom: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () =>
    api.rates
      .list({ actorId: user.id })
      .then(setRows)
      .catch((err) => toast(err.message, 'error'))

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.rates.create({
        actorId: user.id,
        name: form.name,
        perCubicMeter: Number(form.perCubicMeter),
        fixedFee: Number(form.fixedFee || 0),
        effectiveFrom: form.effectiveFrom
      })
      toast('Rate added — activate it to use it')
      setForm({ name: '', perCubicMeter: '', fixedFee: '0', effectiveFrom: '' })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const activate = async (id) => {
    try {
      await api.rates.setActive({ actorId: user.id, id })
      toast('Active rate updated')
      load()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (!rows) return <Spinner />

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <form onSubmit={submit} className="card anim-in flex h-fit flex-col gap-3 p-4">
        <h2 className="section-title">Add Rate</h2>
        <ErrorNote>{error}</ErrorNote>
        <Field label="Rate Name *">
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </Field>
        <Field label="Per Cubic Meter (₱) *">
          <input
            className="input font-bold"
            type="number"
            min="0"
            step="0.01"
            value={form.perCubicMeter}
            onChange={(e) => setForm((f) => ({ ...f, perCubicMeter: e.target.value }))}
            required
          />
        </Field>
        <Field label="Fixed Fee (₱)">
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={form.fixedFee}
            onChange={(e) => setForm((f) => ({ ...f, fixedFee: e.target.value }))}
          />
        </Field>
        <Field label="Effective From">
          <input
            className="input"
            type="date"
            value={form.effectiveFrom}
            onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
          />
        </Field>
        <button className="btn-primary" disabled={busy}>
          <PlusIcon className="h-5 w-5" />
          Add Rate
        </button>
      </form>

      <div className="card anim-in overflow-hidden lg:col-span-2">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="section-title">Rate Table</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Name</th>
              <th className="th text-right">Per cu.m</th>
              <th className="th text-right">Fixed fee</th>
              <th className="th">Effective</th>
              <th className="th">Status</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-mist/60">
                <td className="td font-semibold">{r.name}</td>
                <td className="td text-right font-bold">₱{r.perCubicMeter}</td>
                <td className="td text-right">₱{r.fixedFee}</td>
                <td className="td text-ink-soft">{r.effectiveFrom || '—'}</td>
                <td className="td">
                  <Badge tone={r.active ? 'active' : 'inactive'}>{r.active ? 'active' : 'inactive'}</Badge>
                </td>
                <td className="td text-right">
                  {!r.active ? (
                    <button
                      className="text-[0.6875rem] font-bold tracking-wider text-primary uppercase hover:underline"
                      onClick={() => activate(r.id)}
                    >
                      Activate
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UsersTab({ user }) {
  const [rows, setRows] = useState(null)
  const [form, setForm] = useState({ username: '', fullName: '', password: '', role: 'cashier' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () =>
    api.users
      .list({ actorId: user.id })
      .then(setRows)
      .catch((err) => toast(err.message, 'error'))

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.users.create({ actorId: user.id, ...form })
      toast(`User ${form.username} created`)
      setForm({ username: '', fullName: '', password: '', role: 'cashier' })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (u) => {
    try {
      await api.users.toggleActive({ actorId: user.id, id: u.id })
      load()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const reset = async (u) => {
    const password = window.prompt(`New password for ${u.username}:`)
    if (!password) return
    try {
      await api.users.resetPassword({ actorId: user.id, id: u.id, newPassword: password })
      toast('Password reset')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (!rows) return <Spinner />

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <form onSubmit={submit} className="card anim-in flex h-fit flex-col gap-3 p-4">
        <h2 className="section-title">Add User</h2>
        <ErrorNote>{error}</ErrorNote>
        <Field label="Username *">
          <input
            className="input"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            required
          />
        </Field>
        <Field label="Full Name *">
          <input
            className="input"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            required
          />
        </Field>
        <Field label="Password *">
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />
        </Field>
        <Field label="Role">
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="cashier">Cashier</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <button className="btn-primary" disabled={busy}>
          <PlusIcon className="h-5 w-5" />
          Add User
        </button>
      </form>

      <div className="card anim-in overflow-hidden lg:col-span-2">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="section-title">Users</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Username</th>
              <th className="th">Full Name</th>
              <th className="th">Role</th>
              <th className="th">Status</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-mist/60">
                <td className="td font-semibold">{u.username}</td>
                <td className="td">{u.fullName}</td>
                <td className="td">
                  <Badge tone={u.role}>{u.role}</Badge>
                </td>
                <td className="td">
                  <Badge tone={u.active ? 'active' : 'inactive'}>{u.active ? 'active' : 'disabled'}</Badge>
                </td>
                <td className="td text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      className="text-[0.6875rem] font-bold tracking-wider text-primary uppercase hover:underline"
                      onClick={() => reset(u)}
                    >
                      Reset password
                    </button>
                    {u.id !== user.id ? (
                      <button
                        className={`text-[0.6875rem] font-bold tracking-wider uppercase hover:underline ${
                          u.active ? 'text-red-500' : 'text-aqua-deep'
                        }`}
                        onClick={() => toggle(u)}
                      >
                        {u.active ? 'Disable' : 'Enable'}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AccountTab({ user }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    if (newPassword !== confirm) {
      setError('New passwords do not match')
      return
    }
    setBusy(true)
    try {
      await api.auth.changePassword({ userId: user.id, oldPassword, newPassword })
      setSaved(true)
      setOldPassword('')
      setNewPassword('')
      setConfirm('')
      toast('Password changed')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="card anim-in flex max-w-md flex-col gap-3 p-4">
      <h2 className="section-title">Change My Password</h2>
      <p className="text-[0.8125rem] text-ink-soft">
        Signed in as <strong>{user.username}</strong> ({user.role})
      </p>
      <ErrorNote>{error}</ErrorNote>
      <SuccessNote>{saved ? 'Password changed.' : ''}</SuccessNote>
      <Field label="Current Password">
        <input
          className="input"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
      </Field>
      <Field label="New Password">
        <input
          className="input"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          required
        />
      </Field>
      <Field label="Confirm New Password">
        <input
          className="input"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </Field>
      <button className="btn-primary" disabled={busy}>
        <KeyIcon className="h-5 w-5" />
        {busy ? 'Saving…' : 'Change Password'}
      </button>
    </form>
  )
}

function DataTab({ user }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [lastBackup, setLastBackup] = useState('')

  const doBackup = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await api.backup.create({ actorId: user.id })
      if (!res.canceled) {
        setLastBackup(res.path)
        toast(`Backup saved to ${res.path}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const doRestore = async () => {
    setError('')
    try {
      const picked = await api.backup.pickFile({ actorId: user.id })
      if (picked.canceled) return
      const ok = window.confirm(
        'Restoring will REPLACE all current data with the backup. The app will restart. Continue?'
      )
      if (!ok) return
      setBusy(true)
      await api.backup.restoreFrom({ actorId: user.id, path: picked.path })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="card anim-in flex max-w-2xl flex-col gap-4 p-4">
      <h2 className="section-title">Backup & Restore</h2>
      <p className="text-[0.8125rem] text-ink-soft">
        The database is a single SQLite file stored in this computer's app data folder. Keep regular
        backups on a USB drive or network share.
      </p>
      <ErrorNote>{error}</ErrorNote>
      {lastBackup ? (
        <SuccessNote>Last backup: {lastBackup}</SuccessNote>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={doBackup} disabled={busy}>
          <ArrowDownTrayIcon className="h-5 w-5" />
          Backup Now…
        </button>
        <button className="btn-danger" onClick={doRestore} disabled={busy}>
          <ArrowUpTrayIcon className="h-5 w-5" />
          Restore from Backup…
        </button>
      </div>
    </div>
  )
}
