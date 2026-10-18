import { useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { getSession, setSession } from './lib/session.js'
import { ToastHost } from './lib/toast.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Payment from './pages/Payment.jsx'
import Receipt from './pages/Receipt.jsx'
import Customers from './pages/Customers.jsx'
import CustomerDetail from './pages/CustomerDetail.jsx'
import Readings from './pages/Readings.jsx'
import Billing from './pages/Billing.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  const [user, setUser] = useState(getSession())

  if (!user) {
    return (
      <>
        <Login
          onLogin={(u) => {
            setSession(u)
            setUser(u)
          }}
        />
        <ToastHost />
      </>
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout user={user} onLogout={() => setUser(null)} />}>
          <Route index element={<Dashboard />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/receipt/:id" element={<Receipt />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/readings" element={<Readings />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/reports" element={<Reports />} />
          {user.role === 'admin' ? <Route path="/settings" element={<Settings user={user} />} /> : null}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </HashRouter>
  )
}
