'use client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Search, User, BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import api from '@/lib/api'

export default function AdminEnrolledPage() {
  const [search, setSearch] = useState('')

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: () => api.get('/enrollments/all').then(r => r.data),
  })

  const filtered = (enrollments ?? []).filter((e: any) => {
    const q = search.toLowerCase()
    return !q ||
      e.user_name?.toLowerCase().includes(q) ||
      e.user_email?.toLowerCase().includes(q) ||
      e.employee_id?.toLowerCase().includes(q) ||
      e.course_title?.toLowerCase().includes(q)
  })

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Enrolled</h1>
          <p className="text-gray-500 mt-1">All enrolled learners across all courses</p>
        </div>

        {/* Search */}
        <div className="card p-4 mb-6" style={{ background: '#FFF8F0', borderColor: '#f0d9c8' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by learner, course or employee ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="card h-44 animate-pulse bg-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center text-gray-400">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{search ? 'No results found' : 'No enrollments yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((e: any) => {
              const total = Number(e.total_lessons)
              const done = Number(e.completed_lessons)
              const isCompleted = e.status === 'completed'
              const courseDeleted = total === 0 && isCompleted
              const pct = total > 0 ? Math.round((done / total) * 100) : (isCompleted ? 100 : 0)

              return (
                <div key={e.enrollment_id} className="card p-5 flex flex-col gap-3 border" style={{ borderColor: '#f0d9c8' }}>
                  {/* User */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#8B1A1A,#C0392B)' }}>
                      {e.user_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{e.user_name}</p>
                      <p className="text-xs text-gray-400 truncate">{e.user_email}</p>
                      {e.employee_id && <p className="text-xs text-gray-400">{e.employee_id}{e.department ? ` · ${e.department}` : ''}</p>}
                    </div>
                  </div>

                  {/* Course */}
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                    <span className="line-clamp-1 font-medium">{e.course_title}</span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{courseDeleted ? `${pct}%` : `${done}/${total} lessons · ${pct}%`}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, background: isCompleted ? '#10b981' : '#8B1A1A' }} />
                    </div>
                  </div>

                  {/* Dates + Status */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Enrolled: {new Date(e.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        In Progress
                      </span>
                    )}
                  </div>
                  {isCompleted && e.completed_at && (
                    <p className="text-xs text-gray-400 -mt-2">
                      Completed: {new Date(e.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
