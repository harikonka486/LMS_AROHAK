import axios from 'axios'

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api' })

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lms_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const token = localStorage.getItem('lms_token')
      // Only redirect if user had a token (session expired), not on public pages
      if (token) {
        localStorage.removeItem('lms_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
