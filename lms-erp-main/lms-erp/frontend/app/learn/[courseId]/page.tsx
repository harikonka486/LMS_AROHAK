'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle, Circle, ChevronLeft, ChevronRight, FileText, HelpCircle, Download, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'

type Tab = 'lesson' | 'documents' | 'quiz'

export default function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [tab, setTab] = useState<Tab>('lesson')
  const [activeQuiz, setActiveQuiz] = useState<any>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [quizResult, setQuizResult] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  useEffect(() => { if (!user) router.push('/login') }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: course } = useQuery({
    queryKey: ['learn-course', courseId],
    queryFn: () => api.get(`/courses/${courseId}`).then(r => r.data),
    enabled: !!user,
  })

  const { data: progress } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => api.get(`/progress/course/${courseId}`).then(r => r.data),
    enabled: !!user,
  })

  const { data: quizzes } = useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: () => api.get(`/quizzes/course/${courseId}`).then(r => r.data),
    enabled: !!user,
  })

  useEffect(() => {
    if (course?.sections?.[0]?.lessons?.[0] && !activeLesson) {
      setActiveLesson(course.sections[0].lessons[0])
    }
  }, [course, activeLesson])

  const markComplete = useMutation({
    mutationFn: (lessonId: string) => api.post(`/progress/lesson/${lessonId}/complete`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress', courseId] })
      qc.invalidateQueries({ queryKey: ['my-enrollments'] })
      toast.success('Lesson completed!')
    },
  })

  const submitQuiz = useMutation({
    mutationFn: ({ quizId, answers }: { quizId: string; answers: number[] }) =>
      api.post(`/quizzes/${quizId}/submit`, { answers }),
    onSuccess: (res) => {
      setQuizResult(res.data)
      qc.invalidateQueries({ queryKey: ['quizzes', courseId] })
      qc.invalidateQueries({ queryKey: ['progress', courseId] })
      qc.invalidateQueries({ queryKey: ['my-enrollments'] })
      if (res.data.passed) {
        toast.success(`Quiz passed! Score: ${res.data.score.toFixed(0)}%`)
        qc.invalidateQueries({ queryKey: ['my-certs'] })
        // Check after a short delay if all quizzes are now passed
        setTimeout(() => {
          qc.invalidateQueries({ queryKey: ['quizzes', courseId] })
        }, 800)
      } else {
        toast.error(`Score: ${res.data.score.toFixed(0)}% — Need ${res.data.passingScore}% to pass`)
      }
    },
  })

  const isCompleted = (lessonId: string) =>
    progress?.progress?.some((p: any) => p.lesson_id === lessonId && p.completed)

  const allLessons = course?.sections?.flatMap((s: any) => s.lessons) ?? []
  const currentIndex = allLessons.findIndex((l: any) => l.id === activeLesson?.id)

  // Check if all lessons are completed
  const allLessonsCompleted = allLessons.length > 0 && allLessons.every(lesson => isCompleted(lesson.id))

  // Check if all quizzes are passed
  const allQuizzesPassed = quizzes?.length > 0 && quizzes.every((quiz: any) => quiz.passed)

  // Course is truly completed only when both lessons and quizzes are done
  const isCourseFullyCompleted = allLessonsCompleted && allQuizzesPassed
  // File URL helper — Cloudinary URLs are absolute, local ones need the API base prepended
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace('/api', '')
  const fileUrl = (url: string) =>
    url?.startsWith('http') ? url : `${apiBase}${url}`

  // Convert YouTube watch URL to embed URL
  function getYouTubeEmbedUrl(url: string): string | null {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  // Convert SharePoint video URL to embed URL
  function getSharePointEmbedUrl(url: string): string | null {
    if (!url) return null
    
    try {
      // Already an embed/stream URL — use as-is
      if (url.includes('/_layouts/15/embed.aspx') ||
          url.includes('/_layouts/15/stream.aspx') ||
          url.includes('/embed') ||
          url.includes('microsoftstream.com/embed')) {
        return url
      }

      // SharePoint direct video file
      if (url.includes('sharepoint.com') || url.includes('sharepointonline.com')) {
        // For standard SharePoint video URLs, try to convert to embed format
        if (url.includes('/:v:/')) {
          // Replace /:v:/ share link with stream embed
          return url.replace('/:v:/', '/_layouts/15/stream.aspx?id=')
            .replace('/s/', '/sites/')
        }
        
        // For other SharePoint formats, return as-is
        return url
      }

      return null
    } catch {
      return url
    }
  }

  // Convert Google Drive video URL to embed URL
  function getGoogleDriveEmbedUrl(url: string): string | null {
    if (!url) return null
    
    try {
      if (url.includes('drive.google.com/file/d/')) {
        const afterFileD = url.split('/file/d/')[1]
        if (afterFileD) {
          const fileId = afterFileD.split('/')[0]?.split('?')[0]
          if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`
        }
      }
      if (url.includes('drive.google.com/uc?id=')) {
        const urlParams = new URL(url)
        const fileId = urlParams.searchParams.get('id')
        if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`
      }
      if (url.includes('drive.google.com/open?id=')) {
        const urlParams = new URL(url)
        const fileId = urlParams.searchParams.get('id')
        if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`
      }
      if (url.includes('/preview')) return url
      return null
    } catch {
      return url
    }
  }

  function getVideoEmbed(url: string): { type: 'youtube' | 'sharepoint' | 'googledrive' | 'iframe' | 'video'; src: string } | null {
    if (!url) return null
    const yt = getYouTubeEmbedUrl(url)
    if (yt) return { type: 'youtube', src: yt }
    const sp = getSharePointEmbedUrl(url)
    if (sp) return { type: 'sharepoint', src: sp }
    const gd = getGoogleDriveEmbedUrl(url)
    if (gd) return { type: 'googledrive', src: gd }

    // Vimeo
    const vimeo = url.match(/vimeo\.com\/(\d+)/)
    if (vimeo) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` }
    return null
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f0e1a' }}>
      {/* Sidebar */}
      <div className="w-72 flex flex-col flex-shrink-0 overflow-y-auto" style={{ background: '#1a1830' }}>
        <div className="p-4 border-b border-gray-700">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-3">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </button>
          <h2 className="text-white font-semibold text-sm line-clamp-2">{course?.title}</h2>
          {progress && (
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${progress.percentage}%`, background: '#C0392B' }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{progress.percentage}% complete</p>
            </div>
          )}
          {/* Course completed badge in sidebar */}
          {isCourseFullyCompleted && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-emerald-400">Course Completed!</span>
            </div>
          )}
        </div>

        {/* Lessons */}
        {course?.sections?.map((section: any) => (
          <div key={section.id}>
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-750">
              {section.title}
            </div>
            {section.lessons.map((lesson: any) => (
              <button key={lesson.id} onClick={() => { setActiveLesson(lesson); setTab('lesson'); setQuizResult(null) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${activeLesson?.id === lesson.id ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                style={activeLesson?.id === lesson.id ? { background: '#8B1A1A' } : {}}>
                {isCompleted(lesson.id)
                  ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  : <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                <span className="truncate text-xs">{lesson.title}</span>
              </button>
            ))}
          </div>
        ))}

        {/* Quizzes in sidebar */}
        {quizzes?.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Assessments</div>
            {quizzes.map((quiz: any) => (
              <button key={quiz.id} onClick={() => { setActiveQuiz(quiz); setTab('quiz'); setAnswers([]); setQuizResult(null); setCurrentQuestion(0) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${activeQuiz?.id === quiz.id && tab === 'quiz' ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                style={activeQuiz?.id === quiz.id && tab === 'quiz' ? { background: '#8B1A1A' } : {}}>
                {quiz.passed
                  ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  : <HelpCircle className="w-4 h-4 flex-shrink-0 text-gray-400" />}
                <span className="truncate text-xs">{quiz.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Materials in sidebar */}
        {course?.documents?.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Materials</div>
            <button onClick={() => { setTab('documents'); setActiveQuiz(null) }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${tab === 'documents' ? 'text-white' : 'text-gray-300 hover:bg-gray-700'}`}
              style={tab === 'documents' ? { background: '#8B1A1A' } : {}}>
              <FileText className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span className="truncate text-xs">Course Materials</span>
            </button>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`flex-1 text-white ${tab === 'quiz' && activeQuiz && !quizResult ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`} style={{ background: '#0f0e1a' }}>

          {/* Lesson tab */}
          {tab === 'lesson' && activeLesson && (
            <div className="max-w-4xl mx-auto p-6">
              <h1 className="text-xl font-bold mb-4">{activeLesson.title}</h1>

              {(activeLesson.video_file || activeLesson.video_url || activeLesson.sharepoint_video_url || activeLesson.google_drive_url) ? (
                <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
                  {activeLesson.video_file ? (
                    <video src={fileUrl(activeLesson.video_file)} controls className="w-full h-full" />
                  ) : (() => {
                    const videoUrl = activeLesson.video_url || activeLesson.sharepoint_video_url || activeLesson.google_drive_url
                    const embed = getVideoEmbed(videoUrl)
                    if (!embed) {
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <div className="text-center text-gray-400">
                            <p className="text-sm">Unsupported video format</p>
                            <p className="text-xs mt-1">URL: {videoUrl}</p>
                            <p className="text-xs mt-1">Please check the video URL</p>
                          </div>
                        </div>
                      )
                    }
                    
                    if (embed?.type === 'youtube' || embed?.type === 'iframe' || embed?.type === 'googledrive') {
                      return (
                        <iframe
                          src={embed.src}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )
                    }
                    // SharePoint - use direct video element
                    return <video src={embed.src} controls className="w-full h-full" />
                  })()}
                </div>
              ) : (
                <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-center text-gray-500">
                    <Play className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">No video for this lesson</p>
                  </div>
                </div>
              )}

              {activeLesson.description && <p className="text-gray-300 mb-6">{activeLesson.description}</p>}

              <div className="flex items-center justify-between">
                <button onClick={() => currentIndex > 0 && setActiveLesson(allLessons[currentIndex - 1])}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-600">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button onClick={() => markComplete.mutate(activeLesson.id)}
                  disabled={isCompleted(activeLesson.id) || markComplete.isPending}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium ${isCompleted(activeLesson.id) ? 'bg-green-700 text-green-100' : 'text-white'}`}
                  style={!isCompleted(activeLesson.id) ? { background: '#8B1A1A' } : {}}>
                  <CheckCircle className="w-4 h-4" />
                  {isCompleted(activeLesson.id) ? 'Completed' : 'Mark Complete'}
                </button>

                <button onClick={() => currentIndex < allLessons.length - 1 && setActiveLesson(allLessons[currentIndex + 1])}
                  disabled={currentIndex === allLessons.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-600">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Documents tab */}
          {tab === 'documents' && (
            <div className="max-w-4xl mx-auto p-6">
              <h2 className="text-lg font-semibold mb-4">Course Materials</h2>
              {course?.documents?.length > 0 ? (
                <div className="space-y-3">
                  {course.documents.map((doc: any) => (
                    <a key={doc.id} href={fileUrl(doc.file_url)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#8B1A1A' }}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{doc.title}</p>
                        <p className="text-xs text-gray-400">{doc.file_type}</p>
                      </div>
                      <Download className="w-5 h-5 text-gray-400" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3" />
                  <p>No materials uploaded yet</p>
                </div>
              )}
            </div>
          )}

          {/* Quiz tab */}
          {tab === 'quiz' && activeQuiz && (
            <div className="flex flex-col h-full">
              {/* Quiz header */}
              <div className="flex-shrink-0 px-8 pt-6 pb-4 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{activeQuiz.title}</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Passing score: {activeQuiz.passing_score}%</p>
                  </div>
                  {!quizResult && (
                    <div className="flex items-center gap-2">
                      {activeQuiz.questions?.map((_: any, i: number) => (
                        <button key={i} onClick={() => setCurrentQuestion(i)}
                          className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                            i === currentQuestion ? 'text-white' :
                            answers[i] !== undefined ? 'bg-green-600 text-white' :
                            'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                          style={i === currentQuestion ? { background: '#C0392B' } : {}}>
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quiz body */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {quizResult ? (
                  /* Results screen */
                  <div className="flex-1 overflow-y-auto px-8 py-6">
                    {quizResult.passed ? (
                      /* Passed */
                      <div className="max-w-lg mx-auto space-y-4">
                        <div className="rounded-2xl p-8 text-center"
                          style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)', border: '1px solid rgba(16,185,129,0.4)' }}>
                          <div className="w-16 h-16 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-9 h-9 text-emerald-400" />
                          </div>
                          <p className="text-emerald-300 font-bold text-2xl mb-1">🎉 Passed!</p>
                          <p className="text-5xl font-bold text-white my-3">{quizResult.score.toFixed(0)}%</p>
                          <p className="text-emerald-400/70 text-sm">
                            {quizResult.correct}/{quizResult.total} correct · Passing score: {quizResult.passingScore}%
                          </p>
                          <p className="text-emerald-300/80 text-sm mt-2">
                            You've completed <span className="font-semibold">{course?.title}</span>. Your certificate has been issued.
                          </p>
                        </div>
                        <button onClick={() => router.push('/certificates')}
                          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg,#8B1A1A,#C0392B)' }}>
                          View Certificate
                        </button>
                        <button onClick={() => { setQuizResult(null); setAnswers([]); setCurrentQuestion(0) }}
                          className="w-full py-3 bg-gray-700 rounded-xl text-sm hover:bg-gray-600 font-medium text-gray-300">
                          Retake Assessment
                        </button>
                      </div>
                    ) : (
                      /* Failed — show score and retake */
                      <div>
                        <div className="rounded-2xl p-8 mb-6 text-center bg-red-900/30 border border-red-700">
                          <p className="text-5xl font-bold mb-2">{quizResult.score.toFixed(0)}%</p>
                          <p className="text-xl font-semibold text-red-400">❌ Not Passed</p>
                          <p className="text-sm text-gray-400 mt-2">{quizResult.correct}/{quizResult.total} correct — need {quizResult.passingScore}% to pass</p>
                        </div>
                        <button onClick={() => { setQuizResult(null); setAnswers([]); setCurrentQuestion(0) }}
                          className="w-full py-3 bg-gray-700 rounded-xl text-sm hover:bg-gray-600 font-medium">
                          Retake Quiz
                        </button>
                      </div>
                    )}
                  </div>
                ) : activeQuiz?.passed ? (
                  /* Already passed — show passed state with retake option */
                  <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="max-w-lg mx-auto space-y-4">
                      <div className="rounded-2xl p-8 text-center"
                        style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)', border: '1px solid rgba(16,185,129,0.4)' }}>
                        <div className="w-16 h-16 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-9 h-9 text-emerald-400" />
                        </div>
                        <p className="text-emerald-300 font-bold text-2xl mb-1">✅ Already Passed</p>
                        <p className="text-emerald-400/70 text-sm mt-2">
                          You have already passed this assessment for <span className="font-semibold text-emerald-300">{course?.title}</span>.
                        </p>
                      </div>
                      <button onClick={() => router.push('/certificates')}
                        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg,#8B1A1A,#C0392B)' }}>
                        View Certificate
                      </button>
                      <button onClick={() => { setAnswers([]); setCurrentQuestion(0); setQuizResult(null); setActiveQuiz({ ...activeQuiz, passed: false }) }}
                        className="w-full py-3 bg-gray-700 rounded-xl text-sm hover:bg-gray-600 font-medium text-gray-300">
                        Retake Assessment
                      </button>
                    </div>
                  </div>
                ) : (
                  /* One question at a time */
                  <div className="flex-1 flex flex-col px-8 py-6">
                    {/* Progress bar */}
                    <div className="flex-shrink-0 mb-6">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Question {currentQuestion + 1} of {activeQuiz.questions?.length}</span>
                        <span>{answers.filter(a => a !== undefined).length} answered</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ background: '#C0392B', width: `${((currentQuestion + 1) / (activeQuiz.questions?.length || 1)) * 100}%` }} />
                      </div>
                    </div>

                    {/* Question card — fills remaining space */}
                    {activeQuiz.questions?.[currentQuestion] && (() => {
                      const q = activeQuiz.questions[currentQuestion]
                      const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
                      return (
                        <div className="flex-1 flex flex-col">
                          <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto">
                            <p className="text-lg font-semibold text-white mb-6">
                              {currentQuestion + 1}. {q.text}
                            </p>
                            <div className="space-y-3">
                              {opts.map((opt: string, oi: number) => (
                                <label key={oi}
                                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                    answers[currentQuestion] === oi
                                      ? 'text-white border-red-600'
                                      : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                                  }`}
                                  style={answers[currentQuestion] === oi ? { borderColor: '#C0392B', background: 'rgba(192,57,43,0.15)' } : {}}>
                                  <input type="radio" name={`q-${currentQuestion}`}
                                    checked={answers[currentQuestion] === oi}
                                    onChange={() => { const a = [...answers]; a[currentQuestion] = oi; setAnswers(a) }}
                                    className="sr-only" />
                                  <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                                    answers[currentQuestion] === oi ? 'border-brand-400 bg-brand-500 text-white' : 'border-gray-500 text-gray-400'
                                  }`}>
                                    {String.fromCharCode(65 + oi)}
                                  </span>
                                  <span className="text-sm">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Navigation */}
                          <div className="flex-shrink-0 flex items-center justify-between pt-6 border-t border-gray-700/50 mt-4">
                            <button
                              onClick={() => setCurrentQuestion(q => Math.max(0, q - 1))}
                              disabled={currentQuestion === 0}
                              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-600 font-medium">
                              <ChevronLeft className="w-4 h-4" /> Previous
                            </button>

                            {currentQuestion < (activeQuiz.questions?.length ?? 0) - 1 ? (
                              <button
                                onClick={() => setCurrentQuestion(q => q + 1)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-sm font-medium text-white">
                                Next <ChevronRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => submitQuiz.mutate({ quizId: activeQuiz.id, answers })}
                                disabled={answers.filter(a => a !== undefined).length < (activeQuiz.questions?.length ?? 0) || submitQuiz.isPending}
                                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-medium text-white disabled:opacity-50">
                                {submitQuiz.isPending ? 'Submitting...' : 'Submit Quiz'}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
