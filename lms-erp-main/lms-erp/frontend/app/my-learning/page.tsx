'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { BookOpen, Clock, CheckCircle, Award, Play, ArrowRight } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

export default function MyLearningPage() {
  const { user } = useAuthStore()

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => api.get('/enrollments/my').then(r => r.data),
    enabled: !!user,
  })

  const active    = enrollments?.filter((e: any) => e.status === 'active') ?? []
  const completed = enrollments?.filter((e: any) => e.status === 'completed') ?? []

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your progress across all enrolled courses</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: BookOpen,    label: 'Total Enrolled', value: enrollments?.length ?? 0, bg: 'bg-indigo-50',  color: 'text-indigo-600' },
            { icon: Clock,       label: 'In Progress',    value: active.length,            bg: 'bg-amber-50',   color: 'text-amber-600' },
            { icon: CheckCircle, label: 'Completed',      value: completed.length,         bg: 'bg-emerald-50', color: 'text-emerald-600' },
          ].map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                <Icon className={cn('w-5 h-5', color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="card p-5 space-y-3">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-2 w-full" />
                <div className="skeleton h-9 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !enrollments?.length && (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-brand-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No courses yet</h3>
            <p className="text-sm text-gray-400 mb-5">Browse the catalog and start your learning journey</p>
            <Link href="/courses" className="btn-primary inline-flex">
              Browse Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* In Progress */}
        {active.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="section-title">In Progress</h2>
              <span className="badge badge-yellow">{active.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {active.map((e: any) => <EnrollmentCard key={e.id} enrollment={e} />)}
            </div>
          </section>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="section-title">Completed</h2>
              <span className="badge badge-green">{completed.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completed.map((e: any) => <EnrollmentCard key={e.id} enrollment={e} />)}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  )
}

function EnrollmentCard({ enrollment: e }: { enrollment: any }) {
  const total       = Number(e.total_lessons)
  const done        = Number(e.completed_lessons)
  const pct         = total > 0 ? Math.round((done / total) * 100) : 0
  const quizPassed  = Number(e.total_quizzes) > 0 && Number(e.passed_quizzes) >= Number(e.total_quizzes)
  const isCompleted = e.status === 'completed'

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 truncate">{e.course_title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{e.instructor_name}</p>
        </div>
        <span className={cn('badge flex-shrink-0', isCompleted ? 'badge-green' : 'badge-blue')}>
          {isCompleted ? 'Completed' : 'Active'}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-400">{done}/{total} lessons</span>
          <span className="font-semibold text-gray-700">{pct}%</span>
        </div>
        <div className="progress-bar h-2">
          <div className="progress-fill h-2" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>Enrolled {new Date(e.enrolled_at).toLocaleDateString()}</span>
        {quizPassed && (
          <span className="text-emerald-600 flex items-center gap-1 font-medium">
            <Award className="w-3.5 h-3.5" /> Quizzes passed
          </span>
        )}
      </div>

      <Link href={`/learn/${e.course_id}`}
        className="btn-primary w-full justify-center py-2.5 text-xs">
        <Play className="w-3.5 h-3.5" />
        {isCompleted ? 'Review Course' : 'Continue Learning'}
      </Link>
    </div>
  )
}
