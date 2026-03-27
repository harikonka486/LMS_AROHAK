'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Printer } from 'lucide-react'
import { format } from 'date-fns'
import AppLayout from '@/components/layout/AppLayout'
import api from '@/lib/api'

export default function CertificatePage() {
  const { id } = useParams<{ id: string }>()
  const { data: cert, isLoading } = useQuery({
    queryKey: ['certificate', id],
    queryFn: () => api.get(`/certificates/${id}`).then(r => r.data),
  })

  if (isLoading) return <AppLayout><div className="animate-pulse h-96 bg-gray-200 rounded-xl" /></AppLayout>
  if (!cert) return <AppLayout><p className="text-center text-gray-500 py-20">Certificate not found</p></AppLayout>

  const issuedDate = format(new Date(cert.issued_at), 'MMMM d, yyyy')

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4 print:hidden">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print Certificate
          </button>
        </div>

        {/* Certificate — landscape style */}
        <div id="certificate" style={{
          background: '#fff',
          border: '6px solid #8B1A1A',
          borderRadius: '4px',
          padding: '0',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(139,26,26,0.15)',
        }}>
          {/* Inner border */}
          <div style={{
            position: 'absolute', inset: '10px',
            border: '1.5px solid #D4A017',
            borderRadius: '2px',
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          {/* Watermark */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 0, pointerEvents: 'none',
          }}>
            <span style={{
              fontSize: '96px', fontWeight: 900, color: 'rgba(139,26,26,0.06)',
              letterSpacing: '12px', textTransform: 'uppercase', userSelect: 'none',
            }}>AROHAK</span>
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, padding: '48px 64px' }}>

            {/* Header pill */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{
                display: 'inline-block',
                background: '#8B1A1A',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                padding: '10px 32px',
                borderRadius: '50px',
              }}>
                Arohak Learning Portal
              </span>
            </div>

            {/* Gold divider */}
            <div style={{ borderTop: '2px solid #D4A017', margin: '0 0 24px' }} />

            {/* Certificate title */}
            <p style={{ textAlign: 'center', color: '#8B1A1A', fontWeight: 700, fontSize: '18px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px' }}>
              Certificate of Completion
            </p>

            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
              This is to certify that
            </p>

            {/* Name */}
            <h2 style={{ textAlign: 'center', fontSize: '42px', fontWeight: 800, color: '#1a1a1a', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>
              {cert.user_name}
            </h2>
            {/* Gold underline */}
            <div style={{ width: '120px', borderBottom: '3px solid #D4A017', margin: '0 auto 12px' }} />

            {/* Department */}
            {cert.department && (
              <p style={{ textAlign: 'center', color: '#8B1A1A', fontSize: '13px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
                {cert.department}
              </p>
            )}

            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
              has successfully completed the course
            </p>

            {/* Course title */}
            <h3 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 700, color: '#8B1A1A', marginBottom: '20px' }}>
              {cert.course_title}
            </h3>

            {/* Score badge */}
            {cert.score != null && (
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <span style={{
                  display: 'inline-block',
                  border: '1.5px solid #D4A017',
                  borderRadius: '50px',
                  padding: '6px 24px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#8B1A1A',
                }}>
                  Score: {Math.round(cert.score)}% &nbsp;·&nbsp; Pass
                </span>
              </div>
            )}

            {/* Footer */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>{issuedDate}</p>
                <p style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase' }}>Date of Completion</p>
              </div>
              {cert.certificate_number && (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '10px', fontFamily: 'monospace', color: '#9ca3af' }}>{cert.certificate_number}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase' }}>Certificate ID</p>
                </div>
              )}
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>Arohak Learning Portal</p>
                <p style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase' }}>Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate, #certificate * { visibility: visible; }
          #certificate { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </AppLayout>
  )
}
