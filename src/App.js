import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import HomePage from './pages/HomePage'
import PaymentPage from './pages/PaymentPage'
import ContactPage from './pages/ContactPage'

function App() {
  return (
    // `BrowserRouter` enables client-side navigation (SPA) without full page reloads.
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Header />

        <main className="flex-1">
          {/* `Routes` maps URL paths to page components. */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-to-pay" element={<PaymentPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Fallback: redirect unknown routes back to Home. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
