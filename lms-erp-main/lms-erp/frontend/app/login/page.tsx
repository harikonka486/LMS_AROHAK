'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, Award, BarChart3, GraduationCap,
  Users, HelpCircle, ArrowRight, CheckCircle, X,
  Mail, Phone, MapPin, Globe, BookOpen,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'

// Arohak brand colors
const A = {
  red:     '#8B1A1A',
  crimson: '#C0392B',
  gold:    '#D4A017',
  amber:   '#F0A500',
  cream:   '#FFF8F0',
  warm:    '#FDF3E7',
  dark:    '#3d0a0a',
}

const HERO_BG   = `linear-gradient(135deg, ${A.dark} 0%, ${A.red} 55%, ${A.crimson} 100%)`
const BTN_BG    = `linear-gradient(135deg, ${A.red}, ${A.crimson})`
const GOLD_BG   = `linear-gradient(135deg, ${A.gold}, ${A.amber})`

const schema = z.object({
  email: z.string().email().refine(e => e.endsWith('@arohak.com'), {
    message: 'Only @arohak.com email addresses are allowed',
  }),
  password: z.string().min(1),
})
type F = z.infer<typeof schema>

const LEVEL_COLORS: Record<string, string> = {
  beginner:     'bg-emerald-500',
  intermediate: 'bg-amber-500',
  advanced:     'bg-rose-600',
}

// ── Arohak Logo Component ─────────────────────────────────────────────────────
function ArohakLogo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/arohak-logo.png" alt="Arohak" width={size} height={size}
        className="object-contain" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' }} />
      {showText && (
        <div>
          <p className="font-bold text-sm leading-none" style={{ color: A.red }}>AROHAK</p>
          <p className="text-[10px] leading-none mt-0.5 uppercase tracking-wide text-gray-400">LMS Portal</p>
        </div>
      )}
    </div>
  )
}

function ArohakLogoWhite({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/arohak-logo.png" alt="Arohak" width={size} height={size}
        className="object-contain brightness-0 invert" />
      <div>
        <p className="font-bold text-sm leading-none text-white">AROHAK</p>
        <p className="text-[10px] leading-none mt-0.5 uppercase tracking-wide text-white/60">LMS Portal</p>
      </div>
    </div>
  )
}

// ── Welcome Modal ─────────────────────────────────────────────────────────────
function WelcomeModal({ user, onClose }: { user: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(61,10,10,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
        <div className="px-10 pt-12 pb-8 text-center" style={{ background: HERO_BG }}>
          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mx-auto mb-5 shadow-xl">
            <span className="text-4xl font-bold text-white">{user.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-amber-300" />
            <p className="text-amber-300 text-sm font-medium">Login successful</p>
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">Welcome back!</h2>
          <p className="text-white/70 text-lg">{user.name}</p>
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            <span className={cn('text-xs font-semibold px-3 py-1 rounded-full',
              user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')}>
              {user.role === 'admin' ? 'Admin' : 'Employee'}
            </span>
            {user.employee_id && <span className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full">{user.employee_id}</span>}
            {user.department  && <span className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full">{user.department}</span>}
          </div>
        </div>
        <div className="bg-white px-10 py-8 text-center">
          <p className="text-gray-500 text-sm mb-6">
            You're signed in to the <span className="font-semibold text-gray-800">Arohak LMS Portal</span>. Ready to continue?
          </p>
          <button onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-95"
            style={{ background: BTN_BG }}>
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn{0%{opacity:0;transform:scale(0.85) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  )
}

// ── Login Modal ───────────────────────────────────────────────────────────────
function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (user: any) => void }) {
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: F) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      setAuth(res.data.user, res.data.token)
      onSuccess(res.data.user)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(61,10,10,0.65)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
        <button onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6" style={{ background: HERO_BG }}>
          <div className="mb-5">
            <ArohakLogoWhite size={36} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-white/60 text-sm">Sign in to continue your learning journey</p>
        </div>

        {/* Form */}
        <div className="px-8 py-7" style={{ background: A.cream }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: A.red }}>Email Address</label>
              <input {...register('email')} type="email" className="input" placeholder="you@arohak.com" />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: A.red }}>Password</label>
              <div className="relative">
                <input {...register('password')} type={show ? 'text' : 'password'} className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ background: BTN_BG }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</>
                : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            New employee?{' '}
            <Link href="/register" className="font-medium hover:underline" style={{ color: A.red }}>Create account</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes popIn{0%{opacity:0;transform:scale(0.85) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [mounted, setMounted]         = useState(false)
  const [showLogin, setShowLogin]     = useState(false)
  const [welcomeUser, setWelcomeUser] = useState<any>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (mounted && user) router.replace('/dashboard') }, [mounted, user, router])

  const { data } = useQuery({
    queryKey: ['public-courses'],
    queryFn: () => api.get('/courses', { params: { limit: 9 } }).then(r => r.data),
  })
  const courses = data?.courses ?? []

  const handleSuccess = (u: any) => { setShowLogin(false); setWelcomeUser(u) }
  const handleWelcomeClose = () => { setWelcomeUser(null); router.push('/dashboard') }

  return (
    <>
      {welcomeUser && <WelcomeModal user={welcomeUser} onClose={handleWelcomeClose} />}
      {showLogin   && <LoginModal onClose={() => setShowLogin(false)} onSuccess={handleSuccess} />}

      <div className="min-h-screen flex flex-col" style={{ background: A.cream }}>

        {/* ── Navbar ── */}
        <header className="sticky top-0 z-40 bg-white border-b"
          style={{ borderColor: '#f0d9c8', boxShadow: '0 1px 8px rgba(139,26,26,0.08)' }}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <ArohakLogo size={38} />
            <div className="flex items-center gap-3">
              <button onClick={() => setShowLogin(true)}
                className="text-sm px-5 py-2 rounded-xl font-medium border transition-all hover:bg-red-50"
                style={{ color: A.red, borderColor: A.red }}>
                Sign In
              </button>
              <Link href="/register"
                className="text-sm px-5 py-2 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ background: BTN_BG }}>
                Register
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-20 px-6 text-center" style={{ background: HERO_BG }}>
          {/* decorative rings */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-8 left-16 w-40 h-40 rounded-full border-2 border-white" />
            <div className="absolute top-20 left-32 w-20 h-20 rounded-full border border-white" />
            <div className="absolute bottom-8 right-16 w-56 h-56 rounded-full border-2 border-white" />
            <div className="absolute bottom-20 right-40 w-24 h-24 rounded-full border border-white" />
          </div>
          {/* gold accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: GOLD_BG }} />

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Logo centered in hero */}
            <div className="flex justify-center mb-6">
              <Image src="/arohak-logo.png" alt="Arohak" width={80} height={80}
                className="object-contain brightness-0 invert opacity-90" />
            </div>
            <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest"
              style={{ background: 'rgba(212,160,23,0.2)', color: A.amber, border: `1px solid ${A.gold}40` }}>
              Arohak Learning Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
              Upskill Your Workforce.<br />
              <span style={{ color: A.amber }}>Learn. Grow. Certify.</span>
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Access structured courses, track your progress, and earn verified certificates — built for Arohak employees.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                Sign In to Learn <ArrowRight className="w-4 h-4" />
              </button>
              <Link href="/register"
                className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: GOLD_BG, color: A.dark }}>
                Create Account
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: BookOpen,      label: 'Courses',      value: data?.total ?? '10+' },
              { icon: GraduationCap, label: 'Learners',     value: '300+' },
              { icon: Award,         label: 'Certificates', value: '100+' },
              { icon: BarChart3,     label: 'Completion',   value: '95%' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl px-4 py-4 text-center"
                style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid rgba(212,160,23,0.25)` }}>
                <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: A.amber }} />
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Courses Grid ── */}
        <section className="py-16 px-6" style={{ background: A.warm }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2" style={{ color: A.red }}>Available Courses</h2>
              <p className="text-gray-500 text-sm">Browse our training catalog — sign in to enroll</p>
            </div>

            {courses.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="skeleton h-40 rounded-none" />
                    <div className="p-4 space-y-2">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                  <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group border"
                    style={{ borderColor: '#f0d9c8' }}>
                    {/* Thumbnail */}
                    <div className="h-44 relative overflow-hidden flex-shrink-0" style={{ background: HERO_BG }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white/10" />
                      </div>
                      <div className="absolute inset-0"
                        style={{ background: `radial-gradient(circle at 70% 30%, ${A.gold}40 0%, transparent 60%)` }} />
                      <div className="absolute top-3 left-3">
                        <span className={cn('text-[10px] font-bold text-white px-2.5 py-1 rounded-full uppercase tracking-wide',
                          LEVEL_COLORS[course.level] ?? 'bg-gray-500')}>
                          {course.level}
                        </span>
                      </div>
                      {course.category_name && (
                        <div className="absolute bottom-3 left-3">
                          <span className="text-[10px] text-white/80 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {course.category_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 mb-1">{course.title}</h3>
                      <p className="text-xs text-gray-400 mb-3">By {course.instructor_name}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{course.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{course.enrollment_count} enrolled</span>
                        <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" />{course.quiz_count} quizzes</span>
                      </div>
                      <button onClick={() => setShowLogin(true)}
                        className="mt-auto w-full py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
                        style={{ background: BTN_BG }}>
                        Enroll Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {courses.length > 0 && (
              <div className="text-center mt-10">
                <button onClick={() => setShowLogin(true)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                  style={{ background: BTN_BG }}>
                  View All Courses <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Features strip ── */}
        <section className="py-12 px-6 bg-white border-t" style={{ borderColor: '#f0d9c8' }}>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: GraduationCap, title: 'Structured Learning', desc: 'Curated courses with sections, video lessons, and downloadable resources.' },
              { icon: Award,         title: 'Auto Certificates',   desc: 'Complete a course and instantly receive a verified certificate.' },
              { icon: BarChart3,     title: 'Progress Tracking',   desc: 'Track lesson completion and quiz scores in real time.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: BTN_BG }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold" style={{ color: A.red }}>{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-auto text-white" style={{ background: A.dark }}>
          <div className="h-1" style={{ background: GOLD_BG }} />
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

              {/* Brand */}
              <div className="md:col-span-2">
                <div className="mb-4">
                  <ArohakLogoWhite size={44} />
                </div>
                <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                  Arohak's internal learning management system — empowering employees with structured training, assessments, and certifications.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4 text-sm" style={{ color: A.amber }}>Quick Links</h4>
                <ul className="space-y-2 text-sm text-white/50">
                  <li><button onClick={() => setShowLogin(true)} className="hover:text-white transition-colors">Sign In</button></li>
                  <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                  <li><button onClick={() => setShowLogin(true)} className="hover:text-white transition-colors">Browse Courses</button></li>
                  <li><button onClick={() => setShowLogin(true)} className="hover:text-white transition-colors">My Certificates</button></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold mb-4 text-sm" style={{ color: A.amber }}>Contact</h4>
                <ul className="space-y-3 text-sm text-white/50">
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4 flex-shrink-0" style={{ color: A.gold }} />hr@arohak.com</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0" style={{ color: A.gold }} />+91 98765 43210</li>
                  <li className="flex items-center gap-2"><MapPin className="w-4 h-4 flex-shrink-0" style={{ color: A.gold }} />Hyderabad, India</li>
                  <li className="flex items-center gap-2"><Globe className="w-4 h-4 flex-shrink-0" style={{ color: A.gold }} />www.arohak.com</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/30"
              style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
              <p>© {new Date().getFullYear()} Arohak Technologies. All rights reserved.</p>
              <p>Built with ❤️ for Arohak employees</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
