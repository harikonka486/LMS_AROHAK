'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Users, Search, Shield, GraduationCap, BookOpen, Trash2, Edit2,
  X, Check, Award, Clock, CheckCircle
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import ConfirmModal from '@/components/ConfirmModal'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const ROLES = ['employee', 'admin']
const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  employee: 'Employee',
}

export default function AdminUsersPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [confirmDelete, setConfirmDelete] = useState<any>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [successType, setSuccessType] = useState<'deleted' | 'updated'>('deleted')

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then(r => r.data),
    enabled: !!user && user.role === 'admin',
  })

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => { setSuccessType('updated'); setSuccessMsg('Role updated successfully.'); setTimeout(() => setSuccessMsg(''), 3000); qc.invalidateQueries({ queryKey: ['admin-users'] }); setEditingId(null) },
    onError: () => { setSuccessMsg('') },
  })

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: (_, id) => {
      const name = confirmDelete?.name ?? 'User'
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setSelectedUser(null)
      setConfirmDelete(null)
      setSuccessType('deleted')
      setSuccessMsg(`${name} has been deleted successfully.`)
      setTimeout(() => setSuccessMsg(''), 3500)
    },
    onError: () => { setConfirmDelete(null) },
  })

  const filtered = (users ?? []).filter((u: any) => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.employee_id ?? '').toLowerCase().includes(search.toLowerCase())
    return matchSearch && (!roleFilter || u.role === roleFilter)
  })

  const roleBadge = (role: string) =>
    cn('badge flex items-center gap-1',
      role === 'admin' ? 'badge-red' : role === 'trainer' ? 'badge-blue' : 'badge-green')

  const roleIcon = (role: string) => {
    if (role === 'admin') return <Shield className="w-3.5 h-3.5" />
    if (role === 'instructor') return <BookOpen className="w-3.5 h-3.5" />
    return <GraduationCap className="w-3.5 h-3.5" />
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-500 mt-1">{users?.length ?? 0} total users · Click a name to view details</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3"
          style={{ background: '#FFF8F0', borderColor: '#f0d9c8' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name, email or employee ID..."
              value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 w-full" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input w-40">
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No users found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead style={{ background: '#FDF3E7', borderBottom: '1px solid #f0d9c8' }}>
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">User</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Employee ID</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Department</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Joined</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u: any) => (
                  <tr key={u.id} className="transition-colors" style={{}} onMouseEnter={e => (e.currentTarget.style.background = '#FFF8F0')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                          style={{ background: 'linear-gradient(135deg, #8B1A1A, #C0392B)' }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="font-medium hover:underline text-left"
                            style={{ color: '#8B1A1A' }}
                          >
                            {u.name}
                          </button>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{u.employee_id || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600">{u.department || '—'}</td>
                    <td className="px-5 py-3.5">
                      {editingId === u.id ? (
                        <div className="flex items-center gap-2">
                          <select value={editRole} onChange={e => setEditRole(e.target.value)} className="input py-1 text-xs w-28">
                            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                          </select>
                          <button onClick={() => updateRole.mutate({ id: u.id, role: editRole })} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <span className={roleBadge(u.role)}>{roleIcon(u.role)} {ROLE_LABELS[u.role] ?? u.role}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.id !== user?.id && (
                          <>
                            <button onClick={() => { setEditingId(u.id); setEditRole(u.role) }}
                              className="p-1.5 text-gray-400 rounded transition-colors" title="Edit role"
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#8B1A1A'; (e.currentTarget as HTMLButtonElement).style.background = '#FFF8F0' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = ''; (e.currentTarget as HTMLButtonElement).style.background = '' }}>
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setConfirmDelete(u)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete user">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {u.id === user?.id && <span className="text-xs text-gray-400">You</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over panel */}
      {selectedUser && (
        <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
          onConfirm={() => deleteUser.mutate(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
          loading={deleteUser.isPending}
        />
      )}

      {/* Centered success notification */}
      {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 animate-pop border border-emerald-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">
              {successType === 'deleted' ? 'Deleted Successfully' : 'Role Updated'}
            </p>
            <p className="text-gray-500 text-sm text-center">{successMsg}</p>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

function UserDetailPanel({ user, onClose }: { user: any; onClose: () => void }) {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['user-progress', user.id],
    queryFn: () => api.get(`/users/${user.id}/progress`).then(r => r.data),
  })

  const enrolled   = progress?.length ?? 0
  const completed  = progress?.filter((e: any) => e.status === 'completed').length ?? 0
  const inProgress = progress?.filter((e: any) => e.status === 'active').length ?? 0
  const certs      = progress?.filter((e: any) => e.certificate_number).length ?? 0

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between"
          style={{ background: 'linear-gradient(135deg, #3d0a0a, #8B1A1A)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white text-lg font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{user.name}</h2>
              <p className="text-white/60 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {user.employee_id && <span className="text-white/70 text-xs">{user.employee_id}</span>}
                {user.department && <span className="text-white/50 text-xs">· {user.department}</span>}
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{ROLE_LABELS[user.role] ?? user.role}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-0 border-b border-gray-100">
          {[
            { icon: BookOpen,     label: 'Enrolled',    value: enrolled,   color: 'text-blue-600',   bg: 'bg-blue-50' },
            { icon: Clock,        label: 'In Progress', value: inProgress, color: 'text-amber-600',  bg: 'bg-amber-50' },
            { icon: CheckCircle,  label: 'Completed',   value: completed,  color: 'text-emerald-600',bg: 'bg-emerald-50' },
            { icon: Award,        label: 'Certificates',value: certs,      color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="flex flex-col items-center py-4 border-r last:border-r-0 border-gray-100">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-1', bg)}>
                <Icon className={cn('w-4 h-4', color)} />
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 text-center leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Course list */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Course Details</p>

          {isLoading && (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          )}

          {!isLoading && !progress?.length && (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">No courses enrolled yet</p>
            </div>
          )}

          <div className="space-y-3">
            {progress?.map((e: any) => {
              const total = Number(e.total_lessons)
              const done  = Number(e.completed_lessons)
              const pct   = total > 0 ? Math.round((done / total) * 100) : 0
              const passedQ = Number(e.passed_quizzes)
              const totalQ  = Number(e.total_quizzes)

              const statusMap: Record<string, { label: string; color: string; bar: string }> = {
                completed: { label: 'Completed',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
                active:    { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200',          bar: 'bg-blue-500' },
                dropped:   { label: 'Dropped',     color: 'bg-red-100 text-red-700 border-red-200',             bar: 'bg-red-400' },
              }
              const s = statusMap[e.status] ?? statusMap.active

              return (
                <div key={e.enrollment_id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{e.course_title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{e.level}</p>
                    </div>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0', s.color)}>
                      {s.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Lessons</span>
                      <span>{done}/{total} · {pct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className={cn('h-1.5 rounded-full transition-all', s.bar)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-gray-500">
                      Quizzes: <span className={cn('font-semibold', passedQ >= totalQ && totalQ > 0 ? 'text-emerald-600' : 'text-gray-700')}>
                        {passedQ}/{totalQ} passed
                      </span>
                    </span>
                    {e.certificate_number
                      ? <span className="flex items-center gap-1 text-amber-600 font-medium"><Award className="w-3 h-3" /> Certified</span>
                      : <span className="text-gray-300">No certificate</span>
                    }
                  </div>

                  {/* Dates */}
                  <div className="flex justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                    <span>Enrolled: {new Date(e.enrolled_at).toLocaleDateString()}</span>
                    {e.completed_at && <span>Completed: {new Date(e.completed_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
