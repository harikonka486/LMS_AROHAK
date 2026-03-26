'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import api from '@/lib/api'

const A = { red: '#8B1A1A', crimson: '#C0392B', cream: '#FFF8F0', dark: '#3d0a0a' }
const BTN_BG = `linear-gradient(135deg, ${A.red}, ${A.crimson})`
const HERO_BG = `linear-gradient(135deg, ${A.dark} 0%, ${A.red} 55%, ${A.crimson} 100%)`

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type F = z.infer<typeof schema>

function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token  = params.get('token')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [done, setDone]       = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) })

  useEffect(() => { if (!token) router.replace('/login') }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: F) => {
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password: data.password })
      setDone(true)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired link')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: A.cream }}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center" style={{ background: HERO_BG }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Set New Password</h1>
          <p className="text-white/60 text-sm">Enter your new password below</p>
        </div>

        <div className="px-8 py-7" style={{ background: A.cream }}>
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">Password Updated Successfully!</h2>
              <p className="text-sm text-gray-500 mb-6">Your password has been reset. You can now sign in with your new password.</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: BTN_BG }}>
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: A.red }}>New Password</label>
                <div className="relative">
                  <input {...register('password')} type={showPw ? 'text' : 'password'}
                    className="input pr-10" placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: A.red }}>Confirm Password</label>
                <input {...register('confirm')} type={showPw ? 'text' : 'password'}
                  className="input" placeholder="Repeat password" />
                {errors.confirm && <p className="text-red-600 text-xs mt-1">{errors.confirm.message}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: BTN_BG }}>
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Resetting...</>
                  : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
