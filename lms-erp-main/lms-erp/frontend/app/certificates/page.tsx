'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Award, ExternalLink } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import api from '@/lib/api'

export default function CertificatesPage() {
  const { data: certs, isLoading } = useQuery({
    queryKey: ['my-certs'],
    queryFn: () => api.get('/certificates/my').then(r => r.data),
  })

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Certificates</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2].map(i => <div key={i} className="card h-40 animate-pulse bg-gray-100" />)}
          </div>
        ) : certs?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certs.map((cert: any) => (
              <div key={cert.id} className="card p-6 border-l-4 border-yellow-400">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{cert.course_title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Issued: {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{cert.certificate_number}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/certificates/${cert.id}`} className="btn-primary text-xs py-1.5 flex-1 justify-center">
                    View Certificate
                  </Link>
                  <Link href={`/certificates/verify/${cert.certificate_number}`} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Verify
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-16 text-center text-gray-500">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-semibold mb-2">No certificates yet</h2>
            <p className="text-sm">Complete all quizzes in a course to earn your certificate.</p>
            <Link href="/courses" className="btn-primary mt-4 inline-flex">Browse Courses</Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
