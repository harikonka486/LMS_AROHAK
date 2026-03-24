'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { BookOpen, Eye, EyeOff, GraduationCap, Award, BarChart3, CheckCircle, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const schema = z.object({
  email: z.string().email().refine(e => e.endsWith('@arohak.com'), {
    message: 'Only @arohak.com email addresses are allowed',
  }),
  password: z.string().min(1),
})
type F = z.infer<typeof schema>

function WelcomeModal({ user, onClose }: { user: any; onClose: () => void }) {
  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    employee: 'Employee',
  }
  const roleColor: Record<string, string> = {
    admin:    'bg-purple-100 text-purple-700',
    employee: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,14,26,0.7)', backdropFilter: 'blur(6px)' }}>
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ animation: 'welcomePop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
      >
        {/* Top gradient band */}
        <div className="px-10 pt-12 pb-8 text-center"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #4f46e5 100%)' }}>
          {/* Avatar circle */}
          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mx-auto mb-5 shadow-xl">
            <span className="text-4xl font-bold text-white">{user.name?.[0]?.toUpperCase()}</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-300 text-sm font-medium">Login successful</p>
          </div>

          <h2 className="text-3xl font-bold text-white mb-1">Welcome back!</h2>
          <p className="text-white/70 text-lg">{user.name}</p>

          <div className="flex items-center justify-center gap-3 mt-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${roleColor[user.role]}`}>
              {roleLabel[user.role] ?? user.role}
            </span>
            {user.employee_id && (
              <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">
                {user.employee_id}
              </span>
            )}
            {user.department && (
              <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">
                {user.department}
              </span>
            )}
          </div>
        </div>

        {/* Bottom white section */}
        <div className="bg-white px-10 py-8 text-center">
          <p className="text-gray-500 text-sm mb-6">
            You're now signed in to the <span className="font-semibold text-gray-800">LMS Training Portal</span>.
            Ready to continue your learning journey?
          </p>

          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes welcomePop {
          0%   { opacity: 0; transform: scale(0.85) translateY(20px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { setAuth, user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [welcomeUser, setWelcomeUser] = useState<any>(null)
  const [slide, setSlide] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (mounted && user) router.replace('/dashboard')
  }, [mounted, user, router])

  const slides = [
    {
      icon: GraduationCap,
      title: 'Structured Learning Paths',
      desc: 'Follow curated courses designed for your role — from onboarding to advanced skills.',
      color: 'from-indigo-600 to-violet-600',
    },
    {
      icon: Award,
      title: 'Auto-Generated Certificates',
      desc: 'Complete a course and instantly receive a verified certificate with a unique number.',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Progress Tracking',
      desc: 'Track lesson completion, quiz scores, and overall progress across all your courses.',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      icon: BookOpen,
      title: 'Video Lessons & Quizzes',
      desc: 'Learn through video content and test your knowledge with interactive assessments.',
      color: 'from-rose-600 to-pink-600',
    },
  ]

  // Auto-advance carousel
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 3500)
    return () => clearInterval(t)
  }, [slides.length])

  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: F) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      setAuth(res.data.user, res.data.token)
      setWelcomeUser(res.data.user)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleWelcomeClose = () => {
    setWelcomeUser(null)
    router.push('/dashboard')
  }

  return (
    <>
      {welcomeUser && <WelcomeModal user={welcomeUser} onClose={handleWelcomeClose} />}

      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-4xl flex gap-6 items-stretch">

          {/* Left — Login Form */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 py-12 bg-white rounded-3xl"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15), -8px 0 30px rgba(0,0,0,0.08)' }}>
            <div className="max-w-sm w-full mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-tight">LMS</p>
                  <p className="text-xs text-gray-400">Training Portal</p>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-gray-500 text-sm mb-8">Sign in to continue your learning journey</p>

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
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                New employee?{' '}
                <Link href="/register" className="text-brand-600 font-medium hover:underline">Create account</Link>
              </p>
            </div>
          </div>

          {/* Right — Carousel */}
          <div className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden rounded-3xl"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #4f46e5 100%)', boxShadow: '0 20px 60px rgba(79,70,229,0.4), 8px 0 30px rgba(0,0,0,0.15)' }}>

            {/* Slide content */}
            <div className="flex-1 flex flex-col items-center justify-center px-10 py-12 text-center relative z-10">
              {slides.map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i}
                    className="absolute inset-0 flex flex-col items-center justify-center px-10 py-12 text-center transition-all duration-700"
                    style={{ opacity: slide === i ? 1 : 0, transform: slide === i ? 'translateY(0)' : 'translateY(16px)', pointerEvents: slide === i ? 'auto' : 'none' }}>
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-8 shadow-xl`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4 leading-snug">{s.title}</h2>
                    <p className="text-white/70 text-sm leading-relaxed max-w-xs">{s.desc}</p>
                  </div>
                )
              })}
            </div>

            {/* Dot indicators */}
            <div className="relative z-10 flex items-center justify-center gap-2 pb-8">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: slide === i ? '24px' : '8px',
                    height: '8px',
                    background: slide === i ? '#ffffff' : 'rgba(255,255,255,0.35)',
                  }} />
              ))}
            </div>

            {/* Decorative circles */}
            <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/5" />
            <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full bg-white/5" />
          </div>

        </div>
      </div>
    </>
  )
}
