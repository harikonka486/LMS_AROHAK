import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'employee'
  avatar?: string
  department?: string
  employee_id?: string
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('lms_token', token)
        set({ user, token })
      },
      clearAuth: () => {
        localStorage.removeItem('lms_token')
        set({ user: null, token: null })
      },
    }),
    { name: 'lms-erp-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)
