'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Award, CheckCircle, Printer } from 'lucide-react'
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

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-4">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print Certificate
          </button>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none" id="certificate">
          {/* Header band */}
          <div className="bg-gradient-to-r from-brand-900 via-brand-700 to-brand-800 p-8 text-white text-center">
            <Award className="w-14 h-14 mx-auto mb-3 text-yellow-300" />
            <p className="text-brand-200 uppercase tracking-widest text-xs font-semibold">LMS Training Portal</p>
            <h1 className="text-3xl font-bold mt-2">Certificate of Completion</h1>
          </div>

          {/* Body */}
          <div className="p-10 text-center border-x-4 border-b-4 border-brand-700 rounded-b-2xl">
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-3">This certifies that</p>
            <h2 className="text-4xl font-bold text-brand-700 mb-1">{cert.user_name}</h2>
            {cert.employee_id && <p className="text-gray-400 text-sm mb-1">Employee ID: {cert.employee_id}</p>}
            {cert.department && <p className="text-gray-400 text-sm mb-6">{cert.department}</p>}

            <p className="text-gray-600 mb-2">has successfully completed</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{cert.course_title}</h3>

            <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">All assessments passed</span>
            </div>

            <div className="border-t border-gray-200 pt-6 flex items-center justify-between text-sm text-gray-500">
              <div>
                <p className="font-medium text-gray-700">{cert.instructor_name}</p>
                <p>Course Instructor</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-gray-400">{cert.certificate_number}</p>
                <p className="text-xs">Certificate ID</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-700">{format(new Date(cert.issued_at), 'MMMM d, yyyy')}</p>
                <p>Date Issued</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
