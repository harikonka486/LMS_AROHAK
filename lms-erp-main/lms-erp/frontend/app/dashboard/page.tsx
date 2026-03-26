'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { BookOpen, GraduationCap, Award, TrendingUp, Clock, CheckCircle, ArrowRight, Play, Plus } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = { admin: 'Admin', employee: 'Employee' }

const A = { red: '#8B1A1A', crimson: '#C0392B', gold: '#D4A017', amber: '#F0A500', dark: '#3d0a0a' }
const HERO_BG = `linear-gradient(135deg, ${A.dark} 0%, ${A.red} 55%, ${A.crimson} 100%)`
const GOLD_BG = `linear-gradient(135deg, ${A.gold}, ${A.amber})`


export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: enrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => api.get('/enrollments/my').then(r => r.data),
    enabled: !!user && user.role === 'employee',
  })
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/users/stats').then(r => r.data),
    enabled: !!user && user.role === 'admin',
  })
  const { data: myCourses } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => api.get('/courses/my').then(r => r.data),
    enabled: !!user && user.role === 'admin',
  })
  const { data: certificates } = useQuery({
    queryKey: ['my-certs'],
    queryFn: () => api.get('/certificates/my').then(r => r.data),
    enabled: !!user,
  })

  const isEmployee       = user?.role === 'employee'
  const isAdmin          = user?.role === 'admin'
  const activeEnrollments    = enrollments?.filter((e: any) => e.status === 'active') ?? []
  const completedEnrollments = enrollments?.filter((e: any) => e.status === 'completed') ?? []

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero welcome banner */}
        <div className="relative overflow-hidden rounded-2xl px-8 py-7"
          style={{ background: 'linear-gradient(135deg, #3d0a0a 0%, #8B1A1A 55%, #C0392B 100%)' }}>
          <div className="relative z-10">
            <p className="text-red-200 text-sm font-medium mb-1">{greeting()},</p>
            <h1 className="text-2xl font-bold text-white mb-1">{user?.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {user?.department && <span className="text-red-200 text-sm">{user.department}</span>}
              {user?.department && user?.employee_id && <span className="text-red-400 text-sm">·</span>}
              {user?.employee_id && <span className="text-red-200 text-sm">{user.employee_id}</span>}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 ml-1">
                {ROLE_LABELS[user?.role ?? 'employee']}
              </span>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute right-0 top-0 w-64 h-full opacity-10">
            <div className="absolute top-4 right-8 w-32 h-32 rounded-full border-2 border-white" />
            <div className="absolute top-12 right-20 w-16 h-16 rounded-full border border-white" />
            <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full border border-white" />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isEmployee && <>
            <StatCard icon={BookOpen}    label="Enrolled"     value={enrollments?.length ?? 0}   color="red" />
            <StatCard icon={Clock}       label="In Progress"  value={activeEnrollments.length}    color="amber" />
            <StatCard icon={CheckCircle} label="Completed"    value={completedEnrollments.length} color="emerald" />
            <StatCard icon={Award}       label="Certificates" value={certificates?.length ?? 0}   color="gold" />
          </>}
          {isAdmin && <>
            <StatCard icon={BookOpen}      label="Total Courses"  value={stats?.totalCourses ?? 0}         color="red" />
            <StatCard icon={GraduationCap} label="Total Users"    value={stats?.totalUsers ?? 0}           color="amber" />
            <StatCard icon={TrendingUp}    label="Enrollments"    value={stats?.totalEnrollments ?? 0}     color="emerald" />
            <StatCard icon={Award}         label="Certificates"   value={stats?.totalCertificates ?? 0}    color="gold" />
          </>}
        </div>

        {/* Employee view */}
        {isEmployee && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* My Courses — wider */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">My Courses</h2>
                <Link href="/courses" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: '#8B1A1A' }}>
                  Browse more <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {enrollments?.slice(0, 4).map((e: any) => {
                  const total = Number(e.total_lessons)
                  const done  = Number(e.completed_lessons)
                  const pct   = total > 0 ? Math.round((done / total) * 100) : 0
                  return (
                    <div key={e.id} className="card p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">{e.course_title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{e.instructor_name}</p>
                        </div>
                        <span className={cn('badge flex-shrink-0', e.status === 'completed' ? 'badge-green' : 'badge-blue')}>
                          {e.status === 'completed' ? 'Completed' : 'Active'}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                          <span>{done}/{total} lessons</span>
                          <span className="font-semibold text-gray-600">{pct}%</span>
                        </div>
                        <div className="progress-bar h-1.5">
                          <div className="progress-fill h-1.5" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <Link href={`/learn/${e.course_id}`}
                        className="btn-primary w-full justify-center py-2 text-xs">
                        <Play className="w-3.5 h-3.5" />
                        {e.status === 'completed' ? 'Review' : 'Continue'}
                      </Link>
                    </div>
                  )
                })}
                {!enrollments?.length && (
                  <div className="card p-10 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: '#FFF8F0' }}>
                      <Award className="w-7 h-7 logo-light" style={{ color: '#8B1A1A' }} />
                    </div>
                    <p className="font-semibold text-gray-700 mb-1">No courses yet</p>
                    <p className="text-sm text-gray-400 mb-4">Start your learning journey today</p>
                    <Link href="/courses" className="btn-primary inline-flex">Browse Courses</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Certificates — narrower */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Certificates</h2>
                <Link href="/certificates" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: '#8B1A1A' }}>
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {certificates?.length > 0 ? (
                  certificates.slice(0, 3).map((cert: any) => (
                    <div key={cert.id} className="card p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #8B1A1A, #C0392B)' }}>
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">{cert.course_title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Issued {new Date(cert.issued_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link href={`/certificates/${cert.id}`}
                        className="btn-secondary w-full mt-3 py-2 text-xs">
                        View Certificate
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="card p-8 text-center">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-amber-500 logo-light" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">No certificates yet</p>
                    <p className="text-xs text-gray-400">Complete a course to earn one</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin view */}
        {isAdmin && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">My Courses</h2>
              <Link href="/admin/courses/new" className="btn-primary text-xs py-2">
                <Plus className="w-3.5 h-3.5" /> New Course
              </Link>
            </div>
            <div className="space-y-3">
              {myCourses?.map((c: any) => (
                <div key={c.id} className="card p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #8B1A1A, #C0392B)' }}>
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">{c.title}</h3>
                        <span className={cn('badge flex-shrink-0', c.is_published ? 'badge-green' : 'badge-yellow')}>
                          {c.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{c.enrollment_count} enrolled · {c.quiz_count} quizzes</p>
                    </div>
                  </div>
                  <Link href={`/admin/courses/${c.id}/edit`} className="btn-secondary text-xs py-2 flex-shrink-0">Manage</Link>
                </div>
              ))}
              {!myCourses?.length && (
                <div className="card p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: '#FFF8F0' }}>
                    <BookOpen className="w-7 h-7" style={{ color: '#8B1A1A' }} />
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">No courses yet</p>
                  <p className="text-sm text-gray-400 mb-4">Create your first course to get started</p>
                  <Link href="/admin/courses/new" className="btn-primary inline-flex">
                    <Plus className="w-4 h-4" /> Create Course
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function StatCard({ icon: Icon, label, value, color, trend }: {
  icon: any; label: string; value: number; color: string; trend?: string
}) {
  const styles: Record<string, { bg: string; icon: string }> = {
    red:     { bg: '#FFF8F0', icon: '#8B1A1A' },
    emerald: { bg: '#ecfdf5', icon: '#059669' },
    amber:   { bg: '#fffbeb', icon: '#d97706' },
    gold:    { bg: '#fefce8', icon: '#b45309' },
  }
  const s = styles[color] ?? styles.red
  return (
    <div className="stat-card group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
          <Icon className="w-5 h-5" style={{ color: s.icon }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {trend && <p className="text-xs text-emerald-600 font-medium mt-1">{trend}</p>}
    </div>
  )
}
