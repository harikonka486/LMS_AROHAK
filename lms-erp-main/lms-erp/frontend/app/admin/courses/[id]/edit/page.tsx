'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Eye, EyeOff, Upload, HelpCircle, CheckCircle } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import ConfirmModal from '@/components/ConfirmModal'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const canDelete = user?.role === 'admin'
  const [newSection, setNewSection] = useState('')
  const [newLesson, setNewLesson] = useState<{ sectionId: string; title: string } | null>(null)
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [quizData, setQuizData] = useState({ title: '', passing_score: 70, questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }] })
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string; label: string } | null>(null)
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const { data: course, isLoading } = useQuery({
    queryKey: ['course-edit', id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['course-edit', id] })

  const togglePublish = useMutation({
    mutationFn: () => api.patch(`/courses/${id}/publish`),
    onSuccess: () => { invalidate(); toast.success('Updated!') },
  })

  const addSection = useMutation({
    mutationFn: (title: string) => api.post(`/sections/course/${id}`, { title }),
    onSuccess: () => { invalidate(); setNewSection('') },
  })

  const deleteSection = useMutation({
    mutationFn: (sid: string) => api.delete(`/sections/${sid}`),
    onSuccess: () => { invalidate(); setConfirmDelete(null); showSuccess('Section deleted successfully.') },
  })

  const addLesson = useMutation({
    mutationFn: ({ sectionId, title }: { sectionId: string; title: string }) =>
      api.post(`/lessons/section/${sectionId}`, { title }),
    onSuccess: () => { invalidate(); setNewLesson(null) },
  })

  const deleteLesson = useMutation({
    mutationFn: (lid: string) => api.delete(`/lessons/${lid}`),
    onSuccess: () => { invalidate(); setConfirmDelete(null); showSuccess('Lesson deleted successfully.') },
  })

  const uploadDoc = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData(); fd.append('file', file); fd.append('title', file.name)
      return api.post(`/documents/course/${id}`, fd)
    },
    onSuccess: () => { invalidate(); toast.success('Document uploaded!') },
  })

  const deleteDoc = useMutation({
    mutationFn: (docId: string) => api.delete(`/documents/${docId}`),
    onSuccess: () => { invalidate(); setConfirmDelete(null); showSuccess('Document deleted successfully.') },
  })

  const addQuiz = useMutation({
    mutationFn: () => api.post(`/quizzes/course/${id}`, {
      title: quizData.title,
      passing_score: quizData.passing_score,
      questions: quizData.questions.map(q => ({ text: q.text, options: q.options, correctAnswer: q.correctAnswer })),
    }),
    onSuccess: () => { invalidate(); setShowQuizForm(false); toast.success('Quiz added!') },
  })

  const deleteCourse = useMutation({
    mutationFn: () => api.delete(`/courses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] })
      qc.invalidateQueries({ queryKey: ['my-courses'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
      router.push('/courses')
    },
  })

  if (isLoading) return <AppLayout><div className="animate-pulse h-64 bg-gray-200 rounded-xl" /></AppLayout>

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{course?.title}</h1>
            <span className={`badge mt-1 ${course?.is_published ? 'badge-green' : 'badge-yellow'}`}>
              {course?.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
          <button onClick={() => togglePublish.mutate()} className="btn-secondary flex items-center gap-2">
            {course?.is_published ? <><EyeOff className="w-4 h-4" />Unpublish</> : <><Eye className="w-4 h-4" />Publish</>}
          </button>
          {!course?.is_published && canDelete && (
            <button onClick={() => setConfirmDeleteCourse(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete Course
            </button>
          )}
        </div>

        {/* Sections & Lessons */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Course Content</h2>
          <div className="space-y-4 mb-4">
            {course?.sections?.map((section: any) => (
              <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-gray-50">
                  <span className="font-medium text-sm">{section.title}</span>
                  <button onClick={() => setConfirmDelete({ type: 'section', id: section.id, label: section.title })} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  {section.lessons.map((lesson: any) => (
                    <div key={lesson.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm">
                      <span>{lesson.title}</span>
                      <button onClick={() => setConfirmDelete({ type: 'lesson', id: lesson.id, label: lesson.title })} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {newLesson?.sectionId === section.id ? (
                    <div className="flex gap-2">
                      <input value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                        placeholder="Lesson title" className="input text-sm py-1.5" />
                      <button onClick={() => addLesson.mutate(newLesson)} className="btn-primary text-sm py-1.5">Add</button>
                      <button onClick={() => setNewLesson(null)} className="btn-secondary text-sm py-1.5">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setNewLesson({ sectionId: section.id, title: '' })}
                      className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Lesson
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newSection} onChange={e => setNewSection(e.target.value)}
              placeholder="New section title" className="input" />
            <button onClick={() => newSection && addSection.mutate(newSection)} className="btn-primary whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>
        </div>

        {/* Documents */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Course Materials</h2>
          <div className="space-y-2 mb-4">
            {course?.documents?.map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                <span className="flex-1">{doc.title}</span>
                <button onClick={() => setConfirmDelete({ type: 'doc', id: doc.id, label: doc.title })} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" /> Upload Document
            <input type="file" className="sr-only" onChange={e => e.target.files?.[0] && uploadDoc.mutate(e.target.files[0])} />
          </label>
        </div>

        {/* Quizzes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Assessments</h2>
            <button onClick={() => setShowQuizForm(!showQuizForm)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add Quiz
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {course?.quizzes?.map((quiz: any) => (
              <div key={quiz.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                <HelpCircle className="w-4 h-4 text-brand-600" />
                <span className="flex-1">{quiz.title}</span>
                <span className="badge-blue">Pass: {quiz.passing_score}%</span>
              </div>
            ))}
          </div>

          {showQuizForm && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <input value={quizData.title} onChange={e => setQuizData({ ...quizData, title: e.target.value })}
                placeholder="Quiz title" className="input" />
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Passing score:</label>
                <input type="number" value={quizData.passing_score} min={1} max={100}
                  onChange={e => setQuizData({ ...quizData, passing_score: Number(e.target.value) })}
                  className="input w-24" />
                <span className="text-sm text-gray-500">%</span>
              </div>

              {quizData.questions.map((q, qi) => (
                <div key={qi} className="border border-gray-100 rounded-lg p-3 space-y-2">
                  <input value={q.text} onChange={e => {
                    const qs = [...quizData.questions]; qs[qi].text = e.target.value; setQuizData({ ...quizData, questions: qs })
                  }} placeholder={`Question ${qi + 1}`} className="input text-sm" />
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi}
                        onChange={() => { const qs = [...quizData.questions]; qs[qi].correctAnswer = oi; setQuizData({ ...quizData, questions: qs }) }} />
                      <input value={opt} onChange={e => {
                        const qs = [...quizData.questions]; qs[qi].options[oi] = e.target.value; setQuizData({ ...quizData, questions: qs })
                      }} placeholder={`Option ${oi + 1}`} className="input text-sm py-1.5" />
                    </div>
                  ))}
                </div>
              ))}

              <div className="flex gap-2">
                <button onClick={() => setQuizData({ ...quizData, questions: [...quizData.questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }] })}
                  className="btn-secondary text-sm">+ Add Question</button>
                <button onClick={() => addQuiz.mutate()} disabled={addQuiz.isPending} className="btn-primary text-sm">
                  {addQuiz.isPending ? 'Saving...' : 'Save Quiz'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmDeleteCourse && (
        <ConfirmModal
          title="Delete Course"
          message={`Are you sure you want to delete "${course?.title}"? This will remove all sections, lessons, and quizzes. This cannot be undone.`}
          onConfirm={() => deleteCourse.mutate()}
          onCancel={() => setConfirmDeleteCourse(false)}
          loading={deleteCourse.isPending}
        />
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <ConfirmModal
          title={`Delete ${confirmDelete.type === 'section' ? 'Section' : confirmDelete.type === 'lesson' ? 'Lesson' : 'Document'}`}
          message={`Are you sure you want to delete "${confirmDelete.label}"? This cannot be undone.`}
          onConfirm={() => {
            if (confirmDelete.type === 'section') deleteSection.mutate(confirmDelete.id)
            else if (confirmDelete.type === 'lesson') deleteLesson.mutate(confirmDelete.id)
            else deleteDoc.mutate(confirmDelete.id)
          }}
          onCancel={() => setConfirmDelete(null)}
          loading={deleteSection.isPending || deleteLesson.isPending || deleteDoc.isPending}
        />
      )}

      {/* Centered success notification */}
      {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 animate-pop border border-emerald-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">Deleted Successfully</p>
            <p className="text-gray-500 text-sm text-center">{successMsg}</p>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
