'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import {
  Users, Search, Shield, GraduationCap, BookOpen, Trash2, Edit2,
  X, Check, Award, Clock, CheckCircle, Upload, FileText, AlertCircle
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
  const [showImport, setShowImport] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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

  const handleImportCSV = async (file: File) => {
    setImporting(true)
    setImportResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      // Do NOT set Content-Type manually — browser sets it with the correct boundary
      const res = await api.post('/users/import', fd)
      setImportResult(res.data)
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Import failed'
      setImportResult({ error: msg })
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

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
            <button onClick={() => { setShowImport(true); setImportResult(null) }}
              className="btn-primary flex items-center gap-2">
              <Upload className="w-4 h-4" /> Import CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
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
              <thead className="bg-gray-50 border-b border-gray-200">
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
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          {/* Clickable name */}
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="font-medium text-brand-600 hover:text-brand-800 hover:underline text-left"
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
                              className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors" title="Edit role">
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

      {/* CSV Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-pop">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Import Users from CSV</h2>
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format guide */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-xs text-gray-600 space-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-700 flex items-center gap-1.5"><FileText className="w-4 h-4" /> CSV Format</p>
                <button
                  onClick={() => {
                    const csv = `name,email,employee_id,department,role\nJohn Smith,john.smith@arohak.com,EMP001,Finance,employee\nJane Doe,jane.doe@arohak.com,EMP002,IT,trainer`
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = 'employees_sample.csv'; a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 text-xs"
                >
                  <Upload className="w-3.5 h-3.5 rotate-180" /> Download Sample
                </button>
              </div>
              <p>Required: <span className="font-mono bg-white px-1 rounded border border-gray-200">name</span>, <span className="font-mono bg-white px-1 rounded border border-gray-200">email</span></p>
              <p>Optional: <span className="font-mono bg-white px-1 rounded border border-gray-200">employee_id</span>, <span className="font-mono bg-white px-1 rounded border border-gray-200">department</span>, <span className="font-mono bg-white px-1 rounded border border-gray-200">role</span></p>
              <p className="text-gray-400 mt-2">Default password: <span className="font-mono font-semibold text-gray-600">Welcome@123</span> · Role values: <span className="font-mono">employee</span>, <span className="font-mono">admin</span></p>
            </div>

            {/* Upload area */}
            {!importResult && (
              <label className={cn(
                'flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors',
                importing ? 'border-brand-300 bg-brand-50' : 'border-gray-200 hover:border-brand-400 hover:bg-brand-50'
              )}>
                {importing ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-brand-600 font-medium">Importing users...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-700">Click to upload CSV file</p>
                    <p className="text-xs text-gray-400 mt-1">Max 5MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".csv" className="sr-only"
                  onChange={e => e.target.files?.[0] && handleImportCSV(e.target.files[0])} />
              </label>
            )}

            {/* Result */}
            {importResult && (
              <div className="space-y-4">
                {importResult.error ? (
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{importResult.error}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Total Rows', value: importResult.total, color: 'bg-gray-50 text-gray-700' },
                        { label: 'Created', value: importResult.created, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Skipped', value: importResult.skipped, color: 'bg-amber-50 text-amber-700' },
                      ].map(s => (
                        <div key={s.label} className={cn('rounded-xl p-3 text-center', s.color)}>
                          <p className="text-2xl font-bold">{s.value}</p>
                          <p className="text-xs mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {importResult.errors?.length > 0 && (
                      <div className="bg-amber-50 rounded-xl p-3 max-h-32 overflow-y-auto">
                        <p className="text-xs font-semibold text-amber-700 mb-1">Notes:</p>
                        {importResult.errors.map((e: string, i: number) => (
                          <p key={i} className="text-xs text-amber-600">{e}</p>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setImportResult(null)} className="flex-1 btn-secondary">Import Another</button>
                  <button onClick={() => setShowImport(false)} className="flex-1 btn-primary">Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
          style={{ background: 'linear-gradient(135deg, #1e1b4b, #3730a3)' }}>
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
