'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye, EyeOff, Award, BarChart3, GraduationCap,
  Users, HelpCircle, ArrowRight, X,
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
  email: z.string().email(),
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/arohak-logo.png"
        alt="Arohak"
        width={size}
        height={size}
        className="object-contain logo-light"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/arohak-logo.png"
        alt="Arohak"
        width={size}
        height={size}
        className="object-contain rounded-lg"
        style={{ background: 'rgba(255,255,255,0.12)', padding: '4px' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <div>
        <p className="font-bold text-sm leading-none text-white">AROHAK</p>
        <p className="text-[10px] leading-none mt-0.5 uppercase tracking-wide text-white/60">LMS Portal</p>
      </div>
    </div>
  )
}

// ── Contact Modal ─────────────────────────────────────────────────────────────
function ContactModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/contact', form)
      setSent(true)
    } catch {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(61,10,10,0.65)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
        <button onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 z-10">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6" style={{ background: HERO_BG }}>
          <ArohakLogoWhite size={36} />
          <h2 className="text-2xl font-bold text-white mt-4 mb-1">Contact Us</h2>
          <p className="text-white/60 text-sm">We'd love to hear from you</p>
        </div>

        <div className="px-8 py-6" style={{ background: A.cream }}>
          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <p className="font-semibold text-gray-800 mb-1">Message Sent!</p>
              <p className="text-sm text-gray-500 mb-5">We'll get back to you shortly at {form.email}</p>
              <button onClick={onClose} className="text-sm font-medium hover:underline" style={{ color: A.red }}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: A.red }}>Full Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input" placeholder="John Smith" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: A.red }}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: A.red }}>Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input" placeholder="+1 (609) 454 0364" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: A.red }}>Message *</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={3} className="input resize-none" placeholder="How can we help you?" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: BTN_BG }}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes popIn{0%{opacity:0;transform:scale(0.85) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  )
}

// ── Login Modal ───────────────────────────────────────────────────────────────
function LoginModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (user: any) => void }) {
  const { setAuth } = useAuthStore()
  const [loading, setLoading]             = useState(false)
  const [show, setShow]                   = useState(false)
  const [forgotMode, setForgotMode]       = useState(false)
  const [forgotEmail, setForgotEmail]     = useState('')
  const [forgotSent, setForgotSent]       = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotCountdown, setForgotCountdown] = useState(10)

  useEffect(() => {
    if (!forgotSent) return
    setForgotCountdown(10)
    const interval = setInterval(() => {
      setForgotCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setForgotMode(false)
          setForgotSent(false)
          setForgotEmail('')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [forgotSent]) // eslint-disable-line react-hooks/exhaustive-deps
  const [errorMsg, setErrorMsg]           = useState('')
  const [verifyError, setVerifyError]     = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  const onSubmit = async (data: F) => {
    setErrorMsg('')
    setVerifyError(false)
    setLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      setAuth(res.data.user, res.data.token)
      onSuccess(res.data.user)
    } catch (err: any) {
      if (!err.response) {
        setErrorMsg('Cannot connect to server. Please ensure the backend is running.')
      } else {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid email or password'
        const msgStr = Array.isArray(msg) ? msg[0] : msg
        if (msgStr.toLowerCase().includes('verify')) {
          setVerifyError(true)
          setTimeout(() => setVerifyError(false), 30000)
        } else {
          setErrorMsg(msgStr)
        }
      }
    } finally { setLoading(false) }
  }

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail })
      setForgotSent(true)
    } catch {
      setForgotSent(true)
    } finally { setForgotLoading(false) }
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
          <h2 className="text-2xl font-bold text-white mb-1">
            {forgotMode ? 'Reset Password' : 'Welcome back'}
          </h2>
          <p className="text-white/60 text-sm">
            {forgotMode ? 'Enter your email to receive a reset link' : 'Sign in to continue your learning journey'}
          </p>
        </div>

        {/* Email not verified banner */}
        {verifyError && (
          <div className="mx-8 mt-5 px-4 py-4 rounded-xl text-center"
            style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}>
            <p className="text-sm font-semibold text-amber-800 mb-1">📧 Please verify your email</p>
            <p className="text-xs text-amber-700">Check your inbox and click the verification link before signing in.</p>
          </div>
        )}

        {/* Generic error banner */}
        {errorMsg && (
          <div className="mx-8 mt-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: '#fff0f0', border: '1px solid #fca5a5', color: '#991b1b' }}>
            <X className="w-4 h-4 flex-shrink-0 cursor-pointer" onClick={() => setErrorMsg('')} />
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <div key={forgotMode ? 'forgot' : 'login'} className="px-8 py-6" style={{ background: A.cream }}>
          {forgotMode ? (
            forgotSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-semibold text-gray-800 mb-1">Check your inbox</p>
                <p className="text-sm text-gray-500 mb-3">If that email is registered, a reset link has been sent.</p>
                <p className="text-xs text-gray-400 mb-4">Returning to sign in in <span className="font-semibold" style={{ color: A.red }}>{forgotCountdown}s</span>...</p>
                <button onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail('') }}
                  className="text-sm font-medium hover:underline" style={{ color: A.red }}>
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={onForgot} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: A.red }}>Email Address</label>
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                    className="input" placeholder="you@example.com" required />
                </div>
                <button type="submit" disabled={forgotLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: BTN_BG }}>
                  {forgotLoading
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>
                    : 'Send Reset Link'}
                </button>
                <p className="text-center text-sm text-gray-500">
                  <button type="button" onClick={() => setForgotMode(false)}
                    className="font-medium hover:underline" style={{ color: A.red }}>
                    Back to Sign In
                  </button>
                </p>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: A.red }}>Email Address</label>
                <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium" style={{ color: A.red }}>Password</label>
                  <button type="button" onClick={() => { setForgotMode(true); setErrorMsg('') }}
                    className="text-xs hover:underline" style={{ color: A.red }}>
                    Forgot password?
                  </button>
                </div>
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
          )}
          {!forgotMode && (
            <p className="text-center text-sm text-gray-500 mt-5">
              New employee?{' '}
              <Link href="/register" className="font-medium hover:underline" style={{ color: A.red }}>Create account</Link>
            </p>
          )}
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
  const [showContact, setShowContact] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { 
    if (mounted && user) router.replace('/dashboard') 
  }, [mounted, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const STATIC_COURSES = [
    {
      id: 'mft',
      title: 'Managed File Transfer (MFT) Fundamentals',
      description: 'Master MFT protocols (SFTP, FTPS, AS2), encryption, scheduling, monitoring and compliance. Covers IBM Sterling, GoAnywhere and MOVEit.',
      level: 'beginner',
      category_name: 'MFT & File Transfer',
      instructor_name: 'Arohak LMS',
      enrollment_count: 0,
      quiz_count: 1,
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
    },
    {
      id: 'sap-ui5',
      title: 'SAP UI5 & Fiori Development',
      description: 'Build enterprise-grade SAP Fiori apps using SAPUI5 framework — MVC architecture, OData binding, Fiori Elements, SAP BTP deployment and Fiori Launchpad configuration.',
      level: 'intermediate',
      category_name: 'SAP UI5 & Fiori',
      instructor_name: 'Arohak LMS',
      enrollment_count: 0,
      quiz_count: 1,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    },
    {
      id: 'servicenow',
      title: 'ServiceNow Platform Development',
      description: 'Comprehensive training on ServiceNow — ITSM, GlideRecord scripting, Flow Designer, REST integrations, custom apps and Service Portal.',
      level: 'intermediate',
      category_name: 'ServiceNow',
      instructor_name: 'Arohak LMS',
      enrollment_count: 0,
      quiz_count: 1,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    },
    {
      id: 'webmethods',
      title: 'webMethods Integration Platform',
      description: 'End-to-end training on Software AG webMethods — Integration Server, Designer, API Gateway, Universal Messaging, B2B and microservices.',
      level: 'intermediate',
      category_name: 'webMethods Integration',
      instructor_name: 'Arohak LMS',
      enrollment_count: 0,
      quiz_count: 1,
      thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80',
    },
    {
      id: 'fullstack',
      title: 'Full Stack Web Development',
      description: 'Build complete web applications using React, Node.js/Express, REST APIs, MySQL, JWT authentication and deployment on cloud platforms.',
      level: 'intermediate',
      category_name: 'Full Stack Development',
      instructor_name: 'Arohak LMS',
      enrollment_count: 0,
      quiz_count: 1,
      thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&q=80',
    },
    {
      id: 'python',
      title: 'Python Programming — From Beginner to Advanced',
      description: 'Complete Python training covering syntax, OOP, file handling, APIs, automation, data analysis with pandas/numpy, and web development with Flask.',
      level: 'beginner',
      category_name: 'Python Programming',
      instructor_name: 'Arohak LMS',
      enrollment_count: 0,
      quiz_count: 1,
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80',
    },
    {
      id: 'ai-ml',
      title: 'Artificial Intelligence & Machine Learning',
      description: 'Comprehensive AI/ML training covering supervised and unsupervised learning, neural networks, deep learning, NLP, and real-world model deployment.',
      level: 'advanced',
      category_name: 'AI & Machine Learning',
      instructor_name: 'Arohak LMS',
      enrollment_count: 0,
      quiz_count: 1,
      thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
    },
  ]

  const allCourses = STATIC_COURSES
  const [showAllCourses, setShowAllCourses] = useState(false)
  const courses = showAllCourses ? allCourses : allCourses.slice(0, 3)

  const handleSuccess = (u: any) => { setShowLogin(false); router.push('/dashboard') }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {showLogin   && <LoginModal onClose={() => setShowLogin(false)} onSuccess={handleSuccess} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      <div className="min-h-screen flex flex-col">

        {/* ── Navbar ── */}
        <header className="sticky top-0 z-40 border-b"
          style={{ background: 'rgba(255,248,240,0.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderColor: '#f0d9c8', boxShadow: '0 1px 8px rgba(139,26,26,0.08)' }}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <ArohakLogo size={38} />

            {/* Center nav tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm px-4 py-2 rounded-xl font-medium transition-all hover:bg-red-50"
                style={{ color: A.red }}>
                Home
              </button>
              <button onClick={() => scrollTo('courses-section')}
                className="text-sm px-4 py-2 rounded-xl font-medium transition-all hover:bg-red-50"
                style={{ color: A.red }}>
                Courses
              </button>
              <button onClick={() => scrollTo('about-section')}
                className="text-sm px-4 py-2 rounded-xl font-medium transition-all hover:bg-red-50"
                style={{ color: A.red }}>
                About
              </button>
              <button onClick={() => setShowContact(true)}
                className="text-sm px-4 py-2 rounded-xl font-medium transition-all hover:bg-red-50"
                style={{ color: A.red }}>
                Contact
              </button>
            </nav>

            {/* Right actions */}
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/arohak-logo.png"
                alt="Arohak"
                width={90}
                height={90}
                className="object-contain logo-light rounded-xl"
                style={{ background: 'rgba(255,255,255,0.12)', padding: '8px' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
            <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest"
              style={{ background: 'rgba(212,160,23,0.2)', color: A.amber, border: `1px solid ${A.gold}40` }}>
              Arohak Learning Platform
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-5 leading-tight">
              Upskill Your Workforce.<br />
              <span style={{ color: A.amber }}>Learn. Grow. Certify.</span>
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Access structured courses, track your progress, and earn verified certificates — built for Arohak employees.
            </p>

          </div>

          {/* Stats */}
          <div className="relative z-10 mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: BookOpen,      label: 'Courses',      value: '10+' },
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
        <section id="courses-section" className="py-16 px-6" style={{ background: 'rgba(253,243,231,0.7)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2" style={{ color: A.red }}>Available Courses</h2>
              <p className="text-gray-500 text-sm">Browse our training catalog — sign in to enroll</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                  <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group border"
                    style={{ borderColor: '#f0d9c8' }}>
                    {/* Thumbnail */}
                    <div className="h-44 relative overflow-hidden flex-shrink-0" style={{ background: HERO_BG }}>
                      {course.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.thumbnail.startsWith('/uploads/') ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '')}${course.thumbnail}` : course.thumbnail} alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-white/10" />
                        </div>
                      )}
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

            <div className="text-center mt-10">
              <button
                onClick={() => setShowAllCourses(prev => !prev)}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: BTN_BG }}>
                {showAllCourses ? 'Show Less' : 'View All Courses'}
                <ArrowRight className={`w-4 h-4 transition-transform ${showAllCourses ? 'rotate-90' : ''}`} />
              </button>
            </div>

          </div>
        </section>

        {/* ── Features strip ── */}
        <section className="py-12 px-6 border-t" style={{ background: 'rgba(255,255,255,0.7)', borderColor: '#f0d9c8' }}>
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

        {/* ── About Section ── */}
        <section id="about-section" className="py-16 px-6 border-t" style={{ background: 'rgba(255,255,255,0.7)', borderColor: '#f0d9c8' }}>
          <div className="max-w-5xl mx-auto">

            {/* Badge */}
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full mb-3 uppercase tracking-widest"
                style={{ background: `${A.red}15`, color: A.red }}>
                About Us
              </span>
            </div>

            {/* Who We Are — image left, text right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-14">
              <div className="rounded-2xl overflow-hidden shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                  alt="Arohak Team"
                  className="w-full h-72 object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold mb-2" style={{ color: A.dark }}>Who We Are</h2>
                <h3 className="text-base font-semibold mb-4" style={{ color: A.red }}>A dedicated team to grow your company</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  Arohak was born from a simple yet profound belief — that we could make a meaningful impact on the lives of others. Since our inception in 2016, we have been on a relentless journey to turn aspirations into achievements. Today, we proudly stand as a trusted ally, dedicated to delivering innovative solutions that drive success.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  A cornerstone of our values is our "Empowered Team". Our team members aren't just employees; they are cherished contributors and an integral part of our extended family. We cultivate an environment that nurtures positivity, fosters productivity, and encourages collaboration. Arohak is committed to diversity and gender equality, proudly championing female talent within our workforce. Our expertise spans Software Development, UX/UI, Cloud Solutions, IoT, Mobile App Development and Wearables for the enterprise.
                </p>
              </div>
            </div>

            {/* Mission / Vision / Goal — with images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
                  title: 'Our Mission',
                  text: 'Our mission at Arohak is to unlock the potential of businesses through state-of-the-art IT solutions. We prioritize a partnership approach, focusing on our clients\' unique needs to deliver impactful outcomes and build lasting relationships.',
                },
                {
                  img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
                  title: 'Our Drive and Vision',
                  text: 'Our vision is to emerge as a global beacon in transformative IT solutions. We imagine a world where every business can tap into the vast potential of technology to set new benchmarks in innovation and achieve unprecedented growth.',
                },
                {
                  img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80',
                  title: 'The Goal',
                  text: 'Our goal is to instill a culture of ethical excellence and compliance. We empower our team to make decisions grounded in honesty and integrity, with robust controls ensuring strict adherence to both external and internal regulations.',
                },
              ].map(({ img, title, text }) => (
                <div key={title} className="rounded-2xl overflow-hidden border shadow-sm"
                  style={{ borderColor: '#f0d9c8', background: A.cream }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={title} className="w-full h-40 object-cover" />
                  <div className="p-5">
                    <h4 className="font-bold text-sm mb-2" style={{ color: A.red }}>{title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="rounded-2xl px-8 py-8 text-center relative overflow-hidden" style={{ background: HERO_BG }}>
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: GOLD_BG }} />
              <p className="text-white font-bold text-lg mb-1">Ready to grow with Arohak?</p>
              <p className="text-white/60 text-sm mb-5">Join our learning community and take your career to the next level.</p>
              <div className="flex items-center justify-center">
                <button onClick={() => setShowLogin(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90"
                  style={{ background: GOLD_BG, color: A.dark }}>
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

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
                  <li><button onClick={() => scrollTo('courses-section')} className="hover:text-white transition-colors">Browse Courses</button></li>
                  <li><button onClick={() => scrollTo('about-section')} className="hover:text-white transition-colors">About Us</button></li>
                  <li><button onClick={() => setShowContact(true)} className="hover:text-white transition-colors">Contact Us</button></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold mb-4 text-sm" style={{ color: A.amber }}>Contact</h4>
                <ul className="space-y-3 text-sm text-white/50">
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4 flex-shrink-0" style={{ color: A.gold }} />info@arohak.com</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0" style={{ color: A.gold }} />+1 (609) 454 0364</li>
                  <li className="flex items-start gap-2"><MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: A.gold }} />5th Floor, V3 Tech Enclave, Phase 2, HITEC City, Hyderabad, Telangana 500081</li>
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
