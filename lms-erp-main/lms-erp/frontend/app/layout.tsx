import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LMS — Employee Training Portal',
  description: 'Employee Learning Management System',
  icons: { icon: '/arohak-logo.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Global animated background — visible on every page */}
        <div className="bg-animated" aria-hidden="true">
          <div className="bg-grid" />
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
          <div className="bg-orb bg-orb-4" />
          <div className="bg-orb bg-orb-5" />
          <div className="bg-particles">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-particle" />
            ))}
          </div>
        </div>
        <div className="page-content">
          <Providers>{children}</Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              success: {
                style: {
                  background: 'linear-gradient(135deg,#8B1A1A,#C0392B)',
                  color: '#fff',
                  fontWeight: '600',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  boxShadow: '0 4px 20px rgba(139,26,26,0.4)',
                },
                iconTheme: { primary: '#fff', secondary: '#8B1A1A' },
              },
              error: {
                style: {
                  background: '#1a1a2e',
                  color: '#fff',
                  fontWeight: '600',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1px solid rgba(192,57,43,0.5)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                },
                iconTheme: { primary: '#C0392B', secondary: '#fff' },
              },
            }}
          />
        </div>
      </body>
    </html>
  )
}
