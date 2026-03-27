'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Users, Search, Shield, GraduationCap, BookOpen, Trash2, Edit2,
  X, Check, CheckCircle
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
                            className="font-medium text-left"
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

