import '../index.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { auth } from '../auth.js'

export const metadata = {
  title: 'QuickPay Elenita',
  description: 'Easy and secure water bill payments for Elenita Heights residents.',
}

export default async function RootLayout({ children }) {
  const session = await auth()

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
          <Header session={session} />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
