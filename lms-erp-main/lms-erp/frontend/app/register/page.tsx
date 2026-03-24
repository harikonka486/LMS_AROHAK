'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { CheckCircle, ArrowRight } from 'lucide-react'
import api from '@/lib/api'

const A = {
  red:     '#8B1A1A',
  crimson: '#C0392B',
  gold:    '#D4A017',
  amber:   '#F0A500',
  cream:   '#FFF8F0',
  dark:    '#3d0a0a',
}
const BTN_BG  = `linear-gradient(135deg, ${A.red}, ${A.crimson})`
const HERO_BG = `linear-gradient(135deg, ${A.dark} 0%, ${A.red} 55%, ${A.crimson} 100%)`

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().refine(e => e.endsWith('@arohak.com'), {
    message: 'Only @arohak.com email addresses are allowed',
  }),
  password: z.string().min(6),
  department: z.string().optional(),
  employee_id: z.string().optional(),
  role: z.enum(['student', 'instructor']),
})
type F = z.infer<typeof schema>

function SuccessModal({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(61,10,10,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
        <div className="px-10 pt-12 pb-8 text-center" style={{ background: HERO_BG }}>
          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center mx-auto mb-5 shadow-xl">
            <CheckCircle className="w-10 h-10 text-amber-300" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-white/70 text-base">Welcome, {name}</p>
        </div>
        <div className="bg-white px-10 py-8 text-center">
          <p className="text-gray-500 text-sm mb-6">
            Your account has been successfully created. Please sign in with your credentials to get started.
          </p>
          <button onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-95"
            style={{ background: BTN_BG }}>
            Go to Login <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn{0%{opacity:0;transform:scale(0.85) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [createdName, setCreatedName] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  })

  const onSubmit = async (data: F) => {
    setLoading(true)
    try {
      await api.post('/auth/register', data)
      setCreatedName(data.name)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <>
      {createdName && <SuccessModal name={createdName} onClose={() => router.push('/login')} />}

      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: A.cream }}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border" style={{ borderColor: '#f0d9c8' }}>

          {/* Logo header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Image src="/arohak-logo.png" alt="Arohak" width={56} height={56} className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: A.red }}>Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join the Arohak LMS training portal</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: A.red }}>Full Name *</label>
                <input {...register('name')} className="input" placeholder="John Smith" />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: A.red }}>Email *</label>
                <input {...register('email')} type="email" className="input" placeholder="you@arohak.com" />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: A.red }}>Password *</label>
                <input {...register('password')} type="password" className="input" placeholder="Min 6 characters" />
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Employee ID</label>
                <input {...register('employee_id')} className="input" placeholder="EMP001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                <input {...register('department')} className="input" placeholder="Finance" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                <select {...register('role')} className="input">
                  <option value="student">Employee (Learner)</option>
                  <option value="instructor">Trainer (Instructor)</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center py-2.5 rounded-xl text-white font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ background: BTN_BG }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: A.red }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}
