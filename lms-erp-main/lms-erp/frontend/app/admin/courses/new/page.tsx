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
  const [showSections, setShowSections] = useState(false)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => { 
        if (v !== undefined && v !== '') fd.append(k, v as string) 
      })
      
      // Add thumbnail to FormData
      if (thumbnail) {
        fd.append('thumbnail', thumbnail)
      }
      
      // Use the simple courses endpoint
      const res = await api.post('/courses-simple', fd)
      toast.success('Course created!')
      router.push(`/admin/courses/${res.data.id}/edit`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally { setLoading(false) }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnail(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnail(null)
    setThumbnailPreview(null)
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Thumbnail</label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="input py-1.5"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="text-red-500 hover:text-red-700 text-sm px-3 py-1.5 border border-red-300 rounded"
                >
                  Remove
                </button>
              </div>
              
              {/* Thumbnail Preview */}
              {thumbnailPreview && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Thumbnail Preview:</p>
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Recommended: Square image, at least 400x400px. Max size: 5MB.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
            <select {...register('level')} className="input">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select {...register('category_id')} className="input">
              <option value="">Select Category</option>
              <option value="tech">Technology</option>
              <option value="business">Business</option>
              <option value="finance">Finance</option>
              <option value="management">Management</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <input {...register('language')} className="input" defaultValue="English" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
              <input {...register('passing_score')} type="number" min="1" max="100" defaultValue={70} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input {...register('price')} type="number" min="0" step="0.01" defaultValue={0} className="input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Video URL</label>
            <input {...register('video_url')} type="url" className="input" placeholder="https://www.youtube.com/watch?v=..." />
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
