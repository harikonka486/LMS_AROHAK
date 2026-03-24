'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, GraduationCap, Award,
  BookOpen, Users, LogOut, ChevronDown, Menu, X,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const A = { red: '#8B1A1A', crimson: '#C0392B', gold: '#D4A017', cream: '#FFF8F0', dark: '#3d0a0a' }
const BTN_BG = `linear-gradient(135deg, ${A.red}, ${A.crimson})`

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  employee: 'Employee',
}

const ROLE_COLORS: Record<string, string> = {
  admin:    'bg-amber-100 text-amber-800',
  employee: 'bg-red-100 text-red-800',
}

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',   icon: LayoutDashboard, roles: ['admin','employee'] },
  { href: '/courses',      label: 'Courses',      icon: BookOpen,        roles: ['admin','employee'] },
  { href: '/my-learning',  label: 'My Learning',  icon: GraduationCap,   roles: ['employee'] },
  { href: '/certificates', label: 'Certificates', icon: Award,           roles: ['admin','employee'] },
  { href: '/admin/users',  label: 'Users',        icon: Users,           roles: ['admin'] },
]

export default function Navbar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { user, clearAuth } = useAuthStore()
  const [userOpen,   setUserOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleLogout = () => { clearAuth(); router.push('/login') }
  const visibleItems = navItems.filter(item => user && item.roles.includes(user.role))
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white"
        style={{ borderBottom: `1px solid #f0d9c8`, boxShadow: '0 1px 8px rgba(139,26,26,0.08)' }}>
        <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center flex-shrink-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/arohak-logo.png" alt="Arohak"
              className="object-contain transition-transform group-hover:scale-105"
              style={{ height: '36px', width: 'auto' }} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {visibleItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link key={href} href={href}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                    active
                      ? 'text-red-800 bg-red-50'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  )}
                >
                  <Icon className={cn('w-4 h-4', active ? 'text-red-700' : 'text-gray-400')} />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">

            {/* User menu */}
            <div className="relative" ref={dropRef}>
              <button onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: BTN_BG }}>
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[11px] text-gray-400 leading-none mt-0.5">{ROLE_LABELS[user?.role ?? 'employee']}</p>
                </div>
                <ChevronDown className={cn('w-3.5 h-3.5 text-gray-400 transition-transform hidden sm:block', userOpen && 'rotate-180')} />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl overflow-hidden z-50 animate-pop"
                  style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>

                  {/* Profile header */}
                  <div className="p-4 border-b border-gray-50" style={{ background: `linear-gradient(135deg, ${A.cream}, #fdebd0)` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0"
                        style={{ background: BTN_BG }}>
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <span className={cn('inline-flex items-center mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full', ROLE_COLORS[user?.role ?? 'employee'])}>
                          {ROLE_LABELS[user?.role ?? 'employee']}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  {(user?.employee_id || user?.department) && (
                    <div className="px-4 py-2.5 border-b border-gray-50 space-y-1.5">
                      {user?.employee_id && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Employee ID</span>
                          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">{user.employee_id}</span>
                        </div>
                      )}
                      {user?.department && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Department</span>
                          <span className="text-xs font-medium text-gray-700">{user.department}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sign out */}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-white border-b border-gray-100 shadow-lg md:hidden animate-fade-up">
          <nav className="px-4 py-3 space-y-0.5">
            {visibleItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link key={href} href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    active ? 'bg-red-50 text-red-800' : 'text-gray-600 hover:bg-gray-50'
                  )}>
                  <Icon className={cn('w-4 h-4', active ? 'text-red-700' : 'text-gray-400')} />
                  {label}
                </Link>
              )
            })}
            <div className="pt-2 mt-2 border-t border-gray-100">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
