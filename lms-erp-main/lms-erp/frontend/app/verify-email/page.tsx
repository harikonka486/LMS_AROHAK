'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token found.')
      return
    }
    api.get(`/auth/verify-email`, { params: { token } })
      .then((res) => {
        setStatus('success')
        setMessage(res.data?.message || 'Email verified successfully!')
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid or expired verification link.'
        // Treat "already verified" as success
        if (msg.toLowerCase().includes('already verified')) {
          setStatus('success')
          setMessage('Your email is already verified. You can sign in.')
        } else {
          setStatus('error')
          setMessage(msg)
        }
      })
  }, [token])

  return (
    <div style={{ padding: '40px 32px', textAlign: 'center' }}>
      {status === 'loading' && (
        <>
          <div style={{ width: '48px', height: '48px', border: '3px solid #f0d9c8', borderTopColor: '#8B1A1A', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: '#6b7280', fontSize: '15px' }}>Verifying your email address...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: '#15803d', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Email Verified!</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6, margin: '0 0 28px' }}>
            {message || 'Your email address has been successfully verified. You can now sign in to your account.'}
          </p>
          <Link href="/login"
            style={{ display: 'inline-block', background: 'linear-gradient(135deg,#8B1A1A,#C0392B)', color: '#fff', padding: '13px 32px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
            Sign In →
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ color: '#dc2626', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Verification Failed</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6, margin: '0 0 28px' }}>{message}</p>
          <Link href="/login"
            style={{ display: 'inline-block', background: 'linear-gradient(135deg,#8B1A1A,#C0392B)', color: '#fff', padding: '13px 32px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
            Sign In →
          </Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(139,26,26,0.10)', border: '1px solid #f0d9c8' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#3d0a0a 0%,#8B1A1A 55%,#C0392B 100%)', padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 4px', letterSpacing: '2px', textTransform: 'uppercase' }}>LMS Portal</p>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: 800 }}>Email Verification</h1>
          <div style={{ height: '3px', background: 'linear-gradient(90deg,#D4A017,#F0A500)', borderRadius: '2px', marginTop: '16px' }} />
        </div>

        <Suspense fallback={
          <div style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid #f0d9c8', borderTopColor: '#8B1A1A', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: '#6b7280', fontSize: '15px' }}>Loading...</p>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>

        {/* Footer */}
        <div style={{ background: '#FDF3E7', padding: '16px 32px', textAlign: 'center', borderTop: '1px solid #f0d9c8' }}>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>© {new Date().getFullYear()} LMS Portal. All rights reserved.</p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
