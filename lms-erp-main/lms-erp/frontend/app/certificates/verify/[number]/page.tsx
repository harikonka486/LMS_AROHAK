'use client'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { CheckCircle, XCircle, Award, Shield } from 'lucide-react'
import api from '@/lib/api'

export default function VerifyCertificatePage() {
  const { number } = useParams<{ number: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['verify-cert', number],
    queryFn: () => api.get(`/certificates/verify/${number}`).then(r => r.data),
    enabled: !!number,
  })

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f5f3ff 100%)' }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="text-gray-500 mt-1 text-sm">LMS ERP Training Portal</p>
        </div>

        <div className="card p-8">
          {isLoading && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Verifying certificate...</p>
            </div>
          )}

          {!isLoading && data?.valid && (
            <div>
              <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Valid Certificate</p>
                  <p className="text-sm text-green-600">This certificate is authentic and verified.</p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Certificate Number</span>
                  <span className="font-mono font-medium text-gray-900">{data.certificate.certificate_number}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Issued To</span>
                  <span className="font-medium text-gray-900">{data.certificate.user_name}</span>
                </div>
                {data.certificate.employee_id && (
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">Employee ID</span>
                    <span className="font-medium text-gray-900">{data.certificate.employee_id}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Course</span>
                  <span className="font-medium text-gray-900 text-right max-w-xs">{data.certificate.course_title}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-500">Issue Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(data.certificate.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!isLoading && data && !data.valid && (
            <div>
              <div className="flex items-center gap-3 mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">Invalid Certificate</p>
                  <p className="text-sm text-red-600">No certificate found with this number.</p>
                </div>
              </div>
              <p className="text-center text-gray-500 text-sm">
                Certificate number <span className="font-mono font-medium">{number}</span> does not exist in our system.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Verified by LMS ERP Training Portal
        </p>
      </div>
    </div>
  )
}
