'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, BookOpen, Award, X, Trophy } from 'lucide-react'

type ModalType = 'enrolled' | 'lesson' | 'course' | 'quiz'

interface CenterModalProps {
  type: ModalType
  courseName?: string
  courseId?: string
  lessonName?: string
  quizScore?: number
  onClose: () => void
}

const CONFIG = {
  enrolled: {
    icon: BookOpen,
    iconBg: 'rgba(139,26,26,0.2)',
    iconColor: '#C0392B',
    title: '🎉 Successfully Enrolled!',
    getMessage: (courseName?: string) =>
      `You have been enrolled in "${courseName}". Start learning and track your progress from My Learning.`,
    btnColor: '#C0392B',
    btnHover: '#8B1A1A',
    btnText: 'Start Learning',
    showButton: true,
  },
  lesson: {
    icon: CheckCircle,
    iconBg: 'rgba(16,185,129,0.15)',
    iconColor: '#10b981',
    title: '✅ Lesson Completed!',
    getMessage: (courseName?: string, lessonName?: string) =>
      `Great job! You've completed "${lessonName}". Keep going to finish the course.`,
    btnColor: '#10b981',
    btnHover: '#059669',
    btnText: 'Continue',
    showButton: true,
  },
  course: {
    icon: Award,
    iconBg: 'rgba(212,160,23,0.15)',
    iconColor: '#D4A017',
    title: '🏆 Course Completed!',
    getMessage: (courseName?: string) =>
      `Congratulations! You have successfully completed "${courseName}". Your certificate has been issued — check your Certificates page.`,
    btnColor: '#D4A017',
    btnHover: '#b8860b',
    btnText: 'View Certificate',
    showButton: true,
  },
  quiz: {
    icon: Trophy,
    iconBg: 'rgba(16,185,129,0.15)',
    iconColor: '#10b981',
    title: '🎯 Quiz Passed!',
    getMessage: (courseName?: string, lessonName?: string, quizScore?: number) =>
      `Excellent work! You scored ${quizScore}% on the quiz. Keep up the great momentum!`,
    btnColor: '#10b981',
    btnHover: '#059669',
    btnText: 'Continue Learning',
    showButton: false,
  },
}

export default function CenterModal({ type, courseName, courseId, lessonName, quizScore, onClose }: CenterModalProps) {
  const cfg = CONFIG[type]
  const Icon = cfg.icon
  const router = useRouter()

  const handleAction = () => {
    onClose()
    if (type === 'enrolled' && courseId) {
      router.push(`/learn/${courseId}`)
    } else if (type === 'course') {
      router.push('/certificates')
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8 text-center shadow-2xl animate-pop"
        style={{ background: '#1a1830', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: cfg.iconBg }}
        >
          <Icon className="w-10 h-10" style={{ color: cfg.iconColor }} />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-3">{cfg.title}</h2>

        {/* Message */}
        <p className="text-gray-400 text-sm leading-relaxed mb-7">
          {type === 'lesson'
            ? cfg.getMessage(courseName, lessonName)
            : type === 'quiz'
            ? cfg.getMessage(courseName, lessonName, quizScore)
            : cfg.getMessage(courseName)}
        </p>

        {/* Button */}
        {cfg.showButton !== false && (
          <button
            onClick={handleAction}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: cfg.btnColor }}
          >
            {cfg.btnText}
          </button>
        )}
      </div>
    </div>
  )
}
