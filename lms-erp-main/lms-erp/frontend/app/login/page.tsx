'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  BookOpen, Eye, EyeOff, Award, BarChart3, GraduationCap,
  Users, HelpCircle, ArrowRight, CheckCircle, X,
  Mail, Phone, MapPin, Globe,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email().refine(e => e.endsWith('@arohak.com'), {
    message: 'Only @arohak.com email addresses are allowed',
  }),
  password: z.string().min(1),
})
type F = z.infer<typeof schema>

const LEVEL_COLORS: Record<string, string> = {
  beginner:     'bg-emerald-500',
  intermediate: 'bg-blue-500',
  advanced:     'bg-rose-500',
}

// ── Welcome Modal ─────────────────────────────────────────────────────────────
function WelcomeModal({ user, onClose }: { user: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,14,26,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-pop">
        <div className="px-10 pt-12 pb-8 text-center"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #4f46e5 100%)' }}>
          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mx-auto mb-5 shadow-xl">
            <span className="text-4xl font-bold text-white">{user.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-300 text-sm font-medium">Login successful</p>
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">Welcome back!</h2>
          <p className="text-white/70 text-lg">{user.name}</p>
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            <span className={cn('text-xs font-semibold px-3 py-1 rounded-full',
              user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700')}>
              {user.role === 'admin' ? 'Admin' : 'Employee'}
            </span>
            {user.employee_id && <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">{user.employee_id}</span>}
            {user.department  && <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">{user.department}</span>}
          </div>
        </div>
        <div className="bg-white px-10 py-8 text-center">
          <p className="text-gray-500 text-sm mb-6">
            You're signed in to the <span className="font-semibold text-gray-800">LMS Training Portal</span>. Ready to continue?
          </p>
          <button onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
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
      style={{ background: 'rgba(15,14,26,0.65)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-pop">
        <button onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #4f46e5 100%)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white leading-tight">LMS</p>
              <p className="text-xs text-white/60">Training Portal</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-white/60 text-sm">Sign in to continue your learning journey</p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input {...register('email')} type="email" className="input" placeholder="you@arohak.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input {...register('password')} type={show ? 'text' : 'password'} className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-sm font-semibold">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</span>
                : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            New employee?{' '}
            <Link href="/register" className="text-indigo-600 font-medium hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [mounted, setMounted]       = useState(false)
  const [showLogin, setShowLogin]   = useState(false)
  const [welcomeUser, setWelcomeUser] = useState<any>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (mounted && user) router.replace('/dashboard') }, [mounted, user, router])

  const { data } = useQuery({
    queryKey: ['public-courses'],
    queryFn: () => api.get('/courses', { params: { limit: 9 } }).then(r => r.data),
  })

  const courses = data?.courses ?? []

  const handleSuccess = (u: any) => {
    setShowLogin(false)
    setWelcomeUser(u)
  }

  const handleWelcomeClose = () => {
    setWelcomeUser(null)
    router.push('/dashboard')
  }

  return (
    <>
      {welcomeUser && <WelcomeModal user={welcomeUser} onClose={handleWelcomeClose} />}
      {showLogin   && <LoginModal onClose={() => setShowLogin(false)} onSuccess={handleSuccess} />}

      <div className="min-h-screen flex flex-col bg-gray-50">

        {/* ── Navbar ── */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100"
          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

            {/* Logo — left */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm leading-none">LMS</p>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5 uppercase tracking-wide">Training Portal</p>
              </div>
            </div>

            {/* Right — login + register */}
            <div className="flex items-center gap-3">
              <button onClick={() => setShowLogin(true)}
                className="btn-secondary text-sm px-5 py-2">
                Sign In
              </button>
              <Link href="/register"
                className="btn-primary text-sm px-5 py-2">
                Register
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-20 px-6 text-center"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #4f46e5 100%)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 left-16 w-40 h-40 rounded-full border-2 border-white" />
            <div className="absolute top-20 left-32 w-20 h-20 rounded-full border border-white" />
            <div className="absolute bottom-8 right-16 w-56 h-56 rounded-full border-2 border-white" />
            <div className="absolute bottom-20 right-40 w-24 h-24 rounded-full border border-white" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-block text-xs font-semibold text-indigo-300 bg-white/10 px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
              Arohak Learning Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
              Upskill Your Workforce.<br />
              <span className="text-indigo-300">Learn. Grow. Certify.</span>
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Access structured courses, track your progress, and earn verified certificates — all in one platform built for Arohak employees.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                Sign In to Learn <ArrowRight className="w-4 h-4" />
              </button>
              <Link href="/register"
                className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm bg-white text-indigo-700 hover:bg-indigo-50 transition-all active:scale-95">
                Create Account
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="relative z-10 mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: BookOpen,      label: 'Courses',      value: data?.total ?? '10+' },
              { icon: GraduationCap, label: 'Learners',     value: '300+' },
              { icon: Award,         label: 'Certificates', value: '100+' },
              { icon: BarChart3,     label: 'Completion',   value: '95%' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl px-4 py-4 text-center"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Icon className="w-5 h-5 text-indigo-300 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Courses Grid ── */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Courses</h2>
              <p className="text-gray-500 text-sm">Browse our training catalog — sign in to enroll</p>
            </div>

            {courses.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card overflow-hidden">
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
                  <div key={course.id} className="course-card flex flex-col group">
                    {/* Thumbnail */}
                    <div className="h-44 relative overflow-hidden flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 55%, #4f46e5 100%)' }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white/15" />
                      </div>
                      <div className="absolute inset-0"
                        style={{ background: 'radial-gradient(circle at 70% 30%, rgba(139,92,246,0.3) 0%, transparent 60%)' }} />
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
                      <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-400 mb-3">By {course.instructor_name}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {course.enrollment_count} enrolled
                        </span>
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          {course.quiz_count} quizzes
                        </span>
                      </div>
                      <button onClick={() => setShowLogin(true)}
                        className="btn-primary mt-auto w-full justify-center text-xs py-2">
                        Enroll Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View all */}
            {courses.length > 0 && (
              <div className="text-center mt-10">
                <button onClick={() => setShowLogin(true)}
                  className="btn-primary px-8 py-3 text-sm">
                  View All Courses <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Features strip ── */}
        <section className="py-12 px-6 bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: GraduationCap, title: 'Structured Learning', desc: 'Curated courses with sections, video lessons, and downloadable resources.' },
              { icon: Award,         title: 'Auto Certificates',   desc: 'Complete a course and instantly receive a verified certificate.' },
              { icon: BarChart3,     title: 'Progress Tracking',   desc: 'Track lesson completion and quiz scores in real time.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-gray-900 text-white mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white leading-none">LMS</p>
                    <p className="text-xs text-gray-400 leading-none mt-0.5">Training Portal</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  Arohak's internal learning management system — empowering employees with structured training, assessments, and certifications.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><button onClick={() => setShowLogin(true)} className="hover:text-white transition-colors">Sign In</button></li>
                  <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                  <li><button onClick={() => setShowLogin(true)} className="hover:text-white transition-colors">Browse Courses</button></li>
                  <li><button onClick={() => setShowLogin(true)} className="hover:text-white transition-colors">My Certificates</button></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm">Contact</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    hr@arohak.com
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    +91 98765 43210
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    Hyderabad, India
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    www.arohak.com
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <p>© {new Date().getFullYear()} Arohak Technologies. All rights reserved.</p>
              <p>Built with ❤️ for Arohak employees</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
