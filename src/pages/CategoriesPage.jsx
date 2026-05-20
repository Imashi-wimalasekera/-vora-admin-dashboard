import { useState, useEffect } from 'react'
import { categoryAPI } from '../services/api'
import { Modal, Spinner } from '../components/ui'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Check, Tag } from 'lucide-react'

const emptyForm = { name: '', description: '', isActive: true }

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [deleteId, setDeleteId]     = useState(null)

  const fetchAll = () => {
    setLoading(true)
    categoryAPI.getAll()
      .then(r => setCategories(r.data.data))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true) }
  const openEdit   = (cat) => { setEditItem(cat); setForm({ name: cat.name, description: cat.description || '', isActive: cat.isActive }); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      if (editItem) {
        await categoryAPI.update(editItem.id, form)
        toast.success('Category updated')
      } else {
        await categoryAPI.create(form)
        toast.success('Category created')
      }
      setShowModal(false)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await categoryAPI.delete(id)
      toast.success('Category deleted')
      fetchAll()
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage product categories</p>
        </div>
        <button onClick={openCreate}
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Category
        </button>
      </div>

      {/* Grid */}
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat.id}
              className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--bg-hover)' }}>
                  <Tag size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <span className="badge text-xs" style={{
                  background: cat.isActive ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                  color: cat.isActive ? 'var(--success)' : 'var(--danger)'
                }}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</h3>
                <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {cat.description || <span className="italic" style={{ color: 'var(--text-muted)' }}>No description</span>}
                </p>
              </div>
              <div className="flex gap-2 mt-auto pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                <button onClick={() => openEdit(cat)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-1 text-xs py-1.5 px-2">
                  <Pencil size={13} /> Edit
                </button>
                {deleteId === cat.id ? (
                  <div className="flex gap-1 flex-1">
                    <button onClick={() => handleDelete(cat.id)}
                      className="btn-danger flex-1 flex items-center justify-center gap-1 text-xs py-1.5 px-2">
                      <Check size={13} /> Yes
                    </button>
                    <button onClick={() => setDeleteId(null)}
                      className="btn-secondary flex-1 flex items-center justify-center gap-1 text-xs py-1.5 px-2">
                      <X size={13} /> No
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(cat.id)}
                    className="btn-danger flex-1 flex items-center justify-center gap-1 text-xs py-1.5 px-2">
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? 'Edit Category' : 'New Category'}
        width="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="label">Name *</span>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Category name"
              className="input"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="label">Description</span>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Optional description"
              className="input resize-none"
            />
          </label>

          {editItem && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active</span>
            </label>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary px-5 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-5 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving…' : editItem ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
