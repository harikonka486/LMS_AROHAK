'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from './Navbar'
import { useAuthStore } from '@/lib/store'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !user) router.push('/login')
  }, [mounted, user]) // eslint-disable-line react-hooks/exhaustive-deps

  // While hydrating, show a spinner — never redirect prematurely
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#8B1A1A', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 max-w-screen-xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
