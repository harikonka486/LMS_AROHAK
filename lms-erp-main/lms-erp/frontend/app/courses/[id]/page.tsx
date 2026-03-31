'use client'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { BookOpen, FileText, HelpCircle, Users, ChevronDown, Lock, Play, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { formatDuration } from '@/lib/utils'

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const router = useRouter()
  const [openSection, setOpenSection] = useState<string | null>(null)

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data),
  })

  const { data: enrollment, refetch } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: () => api.get(`/enrollments/check/${id}`).then(r => r.data),
    enabled: !!user,
  })

  const enrollMutation = useMutation({
    mutationFn: () => api.post('/enrollments', { courseId: id }),
    onSuccess: () => { toast.success('Enrolled!'); refetch(); router.push(`/learn/${id}`) },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data?.error || ''
      if (msg === 'ALREADY_COMPLETED' || msg.includes('ALREADY_COMPLETED')) {
        toast.error('You have already completed this course previously.')
        refetch()
      } else {
        toast.error(msg || 'Failed to enroll')
      }
    },
  })

  if (isLoading) return <AppLayout><div className="animate-pulse h-64 bg-gray-200 rounded-xl" /></AppLayout>
  if (!course) return null

  const totalLessons = course.sections?.reduce((a: number, s: any) => a + s.lessons.length, 0) ?? 0

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="badge-blue mb-2">{course.category_name}</span>
              <h1 className="text-2xl font-bold mt-2 mb-3">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{course.enrollment_count} enrolled</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{totalLessons} lessons</span>
                <span className="flex items-center gap-1"><HelpCircle className="w-4 h-4" />{course.quizzes?.length} quizzes</span>
                <span className="flex items-center gap-1"><FileText className="w-4 h-4" />{course.documents?.length} documents</span>
              </div>
            </div>

            {/* Documents */}
            {course.documents?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Course Materials</h2>
                <div className="space-y-2">
                  {course.documents.map((doc: any) => (
                    <a key={doc.id}
                      href={doc.file_url?.startsWith('http') ? doc.file_url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${doc.file_url}`}
                      target="_blank" rel="noreferrer"
                      className="card p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <FileText className="w-5 h-5 text-brand-600 flex-shrink-0" />
                      <span className="text-sm flex-1">{doc.title}</span>
                      <Download className="w-4 h-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Curriculum</h2>
              <div className="space-y-2">
                {course.sections?.map((section: any) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-left">
                      <span className="font-medium text-sm">{section.title}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{section.lessons.length} lessons</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${openSection === section.id ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {openSection === section.id && (
                      <div className="divide-y divide-gray-100">
                        {section.lessons.map((lesson: any) => (
                          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                            {lesson.is_free ? <Play className="w-4 h-4 text-brand-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                            <span className="flex-1">{lesson.title}</span>
                            {lesson.duration && <span className="text-gray-400 text-xs">{formatDuration(lesson.duration)}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quizzes */}
            {course.quizzes?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Assessments</h2>
                <div className="space-y-2">
                  {course.quizzes.map((quiz: any) => (
                    <div key={quiz.id} className="card p-4 flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-brand-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{quiz.title}</p>
                        <p className="text-xs text-gray-500">Passing score: {quiz.passing_score}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-8 h-8 text-brand-600" />
                </div>
                <p className="text-sm text-gray-500">Instructor: <span className="font-medium text-gray-900">{course.instructor_name}</span></p>
              </div>

              {enrollment?.enrolled ? (
                <button onClick={() => router.push(`/learn/${id}`)} className="btn-primary w-full justify-center py-3">
                  Continue Learning
                </button>
              ) : enrollment?.completed || enrollment?.previouslyCompleted ? (
                <div className="w-full text-center">
                  <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-emerald-700 font-semibold text-sm mb-2"
                    style={{ background: '#d1fae5', border: '1px solid #6ee7b7' }}>
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Already Completed
                  </div>
                  <p className="text-xs text-gray-500">You have previously enrolled and completed this course successfully.</p>
                  <button onClick={() => router.push('/certificates')}
                    className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#8B1A1A,#C0392B)' }}>
                    View Certificate
                  </button>
                </div>
              ) : (
                <button onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}
                  className="btn-primary w-full justify-center py-3">
                  {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now — Free'}
                </button>
              )}

              <div className="mt-5 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Lessons</span><span className="font-medium">{totalLessons}</span></div>
                <div className="flex justify-between"><span>Quizzes</span><span className="font-medium">{course.quizzes?.length}</span></div>
                <div className="flex justify-between"><span>Documents</span><span className="font-medium">{course.documents?.length}</span></div>
                <div className="flex justify-between"><span>Level</span><span className="font-medium capitalize">{course.level}</span></div>
                <div className="flex justify-between"><span>Passing Score</span><span className="font-medium">{course.passing_score}%</span></div>
                <div className="flex justify-between"><span>Certificate</span><span className="font-medium text-green-600">Yes</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
