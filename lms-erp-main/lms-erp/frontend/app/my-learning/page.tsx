'use client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, CheckCircle, Play, Award, ArrowRight, Search } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

export default function MyLearningPage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<'enrolled' | 'completed'>('enrolled')
  const [search, setSearch] = useState('')

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => api.get('/enrollments/my').then(r => r.data),
    enabled: !!user,
  })

  const enrolled  = enrollments?.filter((e: any) => e.status === 'active') ?? []
  const completed = enrollments?.filter((e: any) => e.status === 'completed') ?? []
  const filtered  = (tab === 'enrolled' ? enrolled : completed).filter((e: any) =>
    !search || e.course_title?.toLowerCase().includes(search.toLowerCase())
  )
  const current = filtered

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your progress across all enrolled courses</p>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setTab('enrolled')}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all',
              tab === 'enrolled'
                ? 'text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            )}
            style={tab === 'enrolled' ? { background: 'linear-gradient(135deg,#8B1A1A,#C0392B)' } : {}}
          >
            <BookOpen className="w-4 h-4" />
            Enrolled
            {enrolled.length > 0 && (
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold',
                tab === 'enrolled' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700')}>
                {enrolled.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('completed')}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all',
              tab === 'completed'
                ? 'text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            )}
            style={tab === 'completed' ? { background: 'linear-gradient(135deg,#8B1A1A,#C0392B)' } : {}}
          >
            <CheckCircle className="w-4 h-4" />
            Completed
            {completed.length > 0 && (
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold',
                tab === 'completed' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700')}>
                {completed.length}
              </span>
            )}
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="input pl-10 w-full"
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="card p-5 space-y-3 animate-pulse">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-2 w-full" />
                <div className="skeleton h-9 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && current.length === 0 && (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#FFF8F0' }}>
              {tab === 'enrolled'
                ? <BookOpen className="w-8 h-8" style={{ color: '#8B1A1A' }} />
                : <CheckCircle className="w-8 h-8 text-emerald-500" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {tab === 'enrolled' ? 'No enrolled courses' : 'No completed courses yet'}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              {tab === 'enrolled'
                ? 'Browse the catalog and start your learning journey'
                : 'Complete your enrolled courses to see them here'}
            </p>
            {tab === 'enrolled' && (
              <Link href="/courses" className="btn-primary inline-flex">
                Browse Courses <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

        {/* Course cards */}
        {!isLoading && current.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {current.map((e: any) => <EnrollmentCard key={e.id} enrollment={e} isCompleted={tab === 'completed'} />)}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function EnrollmentCard({ enrollment: e, isCompleted }: { enrollment: any; isCompleted: boolean }) {
  const total = Number(e.total_lessons)
  const done  = Number(e.completed_lessons)
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '')
  const thumbSrc = e.thumbnail
    ? (e.thumbnail.startsWith('http') ? e.thumbnail : `${apiBase}${e.thumbnail}`)
    : null

  return (
    <div className="card overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      {/* Course thumbnail */}
      <div className="h-52 relative bg-gradient-to-br from-red-900 to-red-700 flex-shrink-0">
        {thumbSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbSrc} alt={e.course_title} className="w-full h-full object-contain bg-white"
            onError={(ev) => { (ev.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white/40" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={cn('badge flex-shrink-0', isCompleted ? 'badge-green' : 'badge-blue')}>
            {isCompleted ? 'Completed' : 'Enrolled'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-sm text-gray-900 truncate">{e.course_title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{e.instructor_name}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-400">{done}/{total} lessons</span>
            <span className="font-semibold text-gray-700">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all"
              style={{ width: `${pct}%`, background: isCompleted ? '#10b981' : '#8B1A1A' }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <span>Enrolled: {new Date(e.enrolled_at).toLocaleDateString()}</span>
          {isCompleted && e.completed_at && (
            <span className="text-emerald-600 flex items-center gap-1 font-medium">
              <Award className="w-3.5 h-3.5" />
              {new Date(e.completed_at).toLocaleDateString()}
            </span>
          )}
        </div>

        <Link href={`/learn/${e.course_id}`}
          className="btn-primary w-full justify-center py-2.5 text-xs">
          <Play className="w-3.5 h-3.5" />
          {isCompleted ? 'Review Course' : 'Continue Learning'}
        </Link>
      </div>
    </div>
  )
}
