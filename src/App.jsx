import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

import HomePage from './pages/HomePage.jsx'
import PaymentPage from './pages/PaymentPage.jsx'
import ContactPage from './pages/ContactPage.jsx'

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
