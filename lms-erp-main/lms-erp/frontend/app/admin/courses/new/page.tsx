'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import AppLayout from '@/components/layout/AppLayout'
import api from '@/lib/api'

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [showSections, setShowSections] = useState(false)
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => { 
        if (k !== 'thumbnail' && v !== undefined && v !== '') fd.append(k, v as string) 
      })
      
      // Add thumbnail file if selected
      if (thumbnailFile) {
        fd.append('thumbnail', thumbnailFile)
      }
      
      // Use the simple courses endpoint
      const res = await api.post('/courses-simple', fd)
      toast.success('Course created!')
      router.push(`/admin/courses/${res.data.id}/edit`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally { setLoading(false) }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Create New Course</h1>
        
        {/* Basic Course Information */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold mb-4">Course Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
              <input {...register('title', { required: true })} className="input" placeholder="e.g. ERP Finance Module Training" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
              <select {...register('level')} className="input">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Description *</label>
            <textarea {...register('description', { required: true })} rows={4} className="input resize-none" placeholder="What will employees learn?" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
            <input {...register('passing_score')} type="number" min="1" max="100" defaultValue={70} className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Thumbnail</label>
            <input 
              type="file" 
              accept="image/*" 
              className="input py-1.5" 
              onChange={handleFileChange}
            />
            {thumbnailFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {thumbnailFile.name}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Course'}</button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>

        {/* Course Structure - Show after creation */}
        {showSections && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Course Structure</h2>
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">Course structure options will be available after creating the course.</p>
              <p>You can add sections, lessons, quizzes, and documents.</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
