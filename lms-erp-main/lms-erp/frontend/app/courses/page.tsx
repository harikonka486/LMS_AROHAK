'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Search, BookOpen, Users, HelpCircle, Filter, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const LEVEL_COLORS: Record<string, string> = {
  beginner:     'bg-emerald-500',
  intermediate: 'bg-blue-500',
  advanced:     'bg-rose-500',
}

export default function CoursesPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel]       = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['courses', search, category, level],
    queryFn: () => api.get('/courses', { params: { search, category, level, limit: 50 } }).then(r => r.data),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  })

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => api.post('/enrollments', { courseId }),
    onSuccess: () => { toast.success('Enrolled successfully!'); qc.invalidateQueries({ queryKey: ['my-enrollments'] }) },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Enrollment failed'),
  })

  const courses = data?.courses ?? []

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Catalog</h1>
            <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} courses available</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search courses..." className="input pl-10" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="input w-auto min-w-36">
              <option value="">All Categories</option>
              {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={level} onChange={e => setLevel(e.target.value)} className="input w-auto min-w-32">
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-40 rounded-none" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-8 w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">No courses found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course: any) => (
              <div key={course.id} className="course-card flex flex-col">
                {/* Thumbnail */}
                <div className="h-40 relative overflow-hidden flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3d0a0a 0%, #8B1A1A 55%, #C0392B 100%)' }}>
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={(() => {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
                        // Handle both relative and absolute paths
                        if (course.thumbnail.startsWith('/uploads/')) {
                          return `${apiUrl}${course.thumbnail}`
                        } else if (course.thumbnail.startsWith('http')) {
                          return course.thumbnail
                        } else {
                          return `${apiUrl}/uploads/thumbnails/${course.thumbnail.split('/').pop()}`
                        }
                      })()} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Image failed to load:', course.thumbnail)
                        const target = e.target as HTMLImageElement
                        target.src = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/placeholder-course.jpg`
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', course.thumbnail)
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(212,160,23,0.25) 0%, transparent 60%)' }} />
                  {/* Level badge */}
                  <div className="absolute top-3 left-3">
                    <span className={cn('text-[10px] font-bold text-white px-2.5 py-1 rounded-full uppercase tracking-wide', LEVEL_COLORS[course.level] ?? 'bg-gray-500')}>
                      {course.level}
                    </span>
                  </div>
                  {/* Category */}
                  {course.category_name && (
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] text-white/80 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {course.category_name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 mb-1">{course.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">By {course.instructor_name}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {course.enrollment_count} enrolled
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {course.quiz_count} quizzes
                    </span>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Link href={`/courses/${course.id}`} className="btn-secondary text-xs py-2 flex-1 justify-center">
                      Details
                    </Link>
                    {user?.role === 'employee' && (
                      <button
                        onClick={() => enrollMutation.mutate(course.id)}
                        disabled={enrollMutation.isPending}
                        className="btn-primary text-xs py-2 flex-1 justify-center">
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
