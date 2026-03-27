'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { Award, ExternalLink, Trash2, User, BookOpen, Calendar, Search } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function CertificatesPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const isAdmin = user?.role === 'admin'
  const [search, setSearch] = useState('')

  const { data: certs, isLoading } = useQuery({
    queryKey: ['certs', isAdmin],
    queryFn: () => api.get(isAdmin ? '/certificates/all' : '/certificates/my').then(r => r.data),
  })

  const deleteCert = useMutation({
    mutationFn: (id: string) => api.delete(`/certificates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['certs'] }),
  })

  const filtered = isAdmin && certs
    ? certs.filter((c: any) => {
        const q = search.toLowerCase()
        return !q ||
          c.user_name?.toLowerCase().includes(q) ||
          c.user_email?.toLowerCase().includes(q) ||
          c.employee_id?.toLowerCase().includes(q) ||
          c.department?.toLowerCase().includes(q) ||
          c.course_title?.toLowerCase().includes(q) ||
          c.certificate_number?.toLowerCase().includes(q)
      })
    : certs

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{isAdmin ? 'All Certificates' : 'My Certificates'}</h1>
            {isAdmin && <p className="text-sm text-gray-500 mt-1">All certificates earned by users across all courses</p>}
          </div>
          {isAdmin && certs?.length > 0 && (
            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-sm font-semibold rounded-full border border-amber-200">
              {filtered?.length} / {certs.length} total
            </span>
          )}
        </div>

        {isAdmin && (
          <div className="card p-4 mb-5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, employee ID, department or course..."
                className="input pl-10 w-full"
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
          </div>
        ) : certs?.length > 0 ? (
          isAdmin ? (
            /* ── Admin table view ── */
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">User</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Course</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Certificate No.</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Issued</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Score</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No results found for "{search}"</td></tr>
                  ) : filtered?.map((cert: any) => (
                    <tr key={cert.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-red-700" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{cert.user_name}</p>
                            <p className="text-xs text-gray-400">{cert.user_email}</p>
                            {cert.employee_id && <p className="text-xs text-gray-400">{cert.employee_id} {cert.department ? `· ${cert.department}` : ''}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-800 line-clamp-1">{cert.course_title}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 ml-6">by {cert.instructor_name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{cert.certificate_number}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs">{new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {cert.score != null
                          ? <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">{Math.round(cert.score)}%</span>
                          : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Link href={`/certificates/${cert.id}`} className="text-xs text-blue-600 hover:underline">View</Link>
                          <button onClick={() => deleteCert.mutate(cert.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* ── Employee card view ── */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certs.map((cert: any) => (
                <div key={cert.id} className="card p-6 border-l-4 border-amber-500">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-amber-600" />
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
          )
        ) : (
          <div className="card p-16 text-center text-gray-500">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-semibold mb-2">{isAdmin ? 'No certificates issued yet' : 'No certificates yet'}</h2>
            <p className="text-sm">{isAdmin ? 'Certificates will appear here once users complete courses.' : 'Complete all quizzes in a course to earn your certificate.'}</p>
            {!isAdmin && <Link href="/courses" className="btn-primary mt-4 inline-flex">Browse Courses</Link>}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
