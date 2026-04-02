import { useState, useEffect } from 'react'
import { userAPI } from '../services/api'
import { Spinner } from '../components/ui'
import { formatDateTime } from '../utils/helpers'
import toast from 'react-hot-toast'
import { Trash2, ShieldCheck, ShieldOff, ToggleLeft, ToggleRight, X, Check } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  const fetchUsers = () => {
    setLoading(true)
    userAPI.getAll()
      .then(r => setUsers(r.data.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (id) => {
    try {
      await userAPI.delete(id)
      toast.success('User deleted')
      fetchUsers()
    } catch { toast.error('Failed to delete user') }
    finally { setDeleteId(null) }
  }

  const handleToggleActive = async (id) => {
    try {
      await userAPI.toggleActive(id)
      toast.success('User status updated')
      fetchUsers()
    } catch { toast.error('Operation failed') }
  }

  const handleRoleChange = async (id, isAdmin) => {
    const newRole = isAdmin ? 'ROLE_USER' : 'ROLE_ADMIN'
    try {
      await userAPI.updateRole(id, newRole)
      toast.success(`Role updated to ${newRole === 'ROLE_ADMIN' ? 'Admin' : 'User'}`)
      fetchUsers()
    } catch { toast.error('Failed to update role') }
  }

  const isAdmin = (user) => user.roles?.some(r => r.name === 'ROLE_ADMIN' || r === 'ROLE_ADMIN')

  return (
    <div className="fade-in flex flex-col gap-6">
      <div>
        <h1 className="page-title">Users</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {users.length} registered user{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }} className="text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Phone</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Joined</th>
                <th className="text-center px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const admin = isAdmin(user)
                return (
                  <tr key={user.id} className="table-row">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, var(--accent), var(--teal-mid))' }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{user.phone || '—'}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleRoleChange(user.id, admin)}
                        title={`Change to ${admin ? 'User' : 'Admin'}`}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          admin
                            ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                            : 'hover:bg-slate-600'
                        }`}
                        style={!admin ? { background: 'var(--bg-hover)', color: 'var(--text-secondary)' } : undefined}
                        onMouseEnter={e => {
                          if (!admin) e.currentTarget.style.background = 'var(--border-light)'
                        }}
                        onMouseLeave={e => {
                          if (!admin) e.currentTarget.style.background = 'var(--bg-hover)'
                        }}>
                        {admin ? <><ShieldCheck size={12} /> Admin</> : <><ShieldOff size={12} /> User</>}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          user.isActive
                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}>
                        {user.isActive
                          ? <><ToggleRight size={12} /> Active</>
                          : <><ToggleLeft size={12} /> Inactive</>}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(user.createdAt)}</td>
                    <td className="px-5 py-3 text-center">
                      {deleteId === user.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleDelete(user.id)}
                            className="text-red-400 hover:text-red-300 transition-colors">
                            <Check size={15} />
                          </button>
                          <button onClick={() => setDeleteId(null)}
                            className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(user.id)}
                          className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
