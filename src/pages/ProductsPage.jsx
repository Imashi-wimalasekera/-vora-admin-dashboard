import { useState, useEffect, useCallback } from 'react'
import { productAPI, categoryAPI } from '../services/api'
import { Table, Pagination, Modal, ConfirmDialog, Spinner, EmptyState, FormField } from '../components/ui'
import { formatCurrency, formatDate, buildPageInfo, debounce } from '../utils/helpers'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', description: '', price: '', categoryId: '', stockQty: '' }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pageInfo, setPageInfo] = useState({ current: 0, total: 1, totalElements: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [images, setImages] = useState([])
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchProducts = useCallback(async (page = 0, q = '') => {
    setLoading(true)
    try {
      const res = q
        ? await productAPI.search(q, page)
        : await productAPI.getAll(page)
      const d = res.data.data
      setProducts(d.content)
      setPageInfo(buildPageInfo(d))
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProducts(0, searchQ) }, [searchQ])
  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.data || []))
  }, [])

  const debouncedSearch = useCallback(debounce(q => setSearchQ(q)), [])

  const openCreate = () => { setForm(EMPTY_FORM); setImages([]); setEditId(null); setShowForm(true) }
  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description || '',
      price: p.price, categoryId: p.categoryId || '',
      stockQty: p.stockQty
    })
    setEditId(p.id); setImages([]); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId || form.stockQty === '') {
      toast.error('Fill all required fields'); return
    }
    setSaving(true)
    try {
      if (editId) {
        await productAPI.update(editId, { ...form, price: Number(form.price), stockQty: Number(form.stockQty), categoryId: Number(form.categoryId) })
        toast.success('Product updated')
      } else {
        const fd = new FormData()
        const productBlob = new Blob([JSON.stringify({ ...form, price: Number(form.price), stockQty: Number(form.stockQty), categoryId: Number(form.categoryId) })], { type: 'application/json' })
        fd.append('product', productBlob)
        images.forEach(img => fd.append('images', img))
        await productAPI.create(fd)
        toast.success('Product created')
      }
      setShowForm(false)
      fetchProducts(pageInfo.current, searchQ)
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await productAPI.delete(deleteTarget)
      toast.success('Product deleted')
      setDeleteTarget(null)
      fetchProducts(pageInfo.current, searchQ)
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {pageInfo.totalElements} products total
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          className="input max-w-sm"
          placeholder="Search products…"
          onChange={e => debouncedSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card">
        <Table
          headers={['Image','Name','Category','Price','Stock','Status','Actions']}
          loading={loading}
        >
          {products.length === 0 && !loading
            ? <tr><td colSpan={7}><EmptyState icon="📦" message="No products found" /></td></tr>
            : products.map(p => {
              const primary = p.images?.find(i => i.isPrimary) || p.images?.[0]
              return (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3">
                    {primary
                      ? <img src={primary.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      : <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: 'var(--bg-hover)' }}>📦</div>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDate(p.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{p.categoryName || '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm font-medium" style={{ color: 'var(--accent)' }}>{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span style={{ color: p.stockQty === 0 ? 'var(--danger)' : p.stockQty < 10 ? 'var(--warning)' : 'var(--success)' }}>
                      {p.stockQty === 0 ? 'Out of stock' : `${p.stockQty} units`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge text-xs" style={{
                      background: p.isActive ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                      color: p.isActive ? 'var(--success)' : 'var(--danger)'
                    }}>{p.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="btn-secondary py-1 px-2 text-xs" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn-danger py-1 px-2 text-xs" onClick={() => setDeleteTarget(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })
          }
        </Table>
        <div className="px-4 pb-4">
          <Pagination current={pageInfo.current} total={pageInfo.total} onChange={p => fetchProducts(p, searchQ)} />
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editId ? 'Edit Product' : 'Add Product'} width="max-w-xl">
        <div className="flex flex-col gap-4">
          <FormField label="Product Name *">
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Wireless Headphones" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price (USD) *">
              <input className="input" type="number" min="0" step="0.01" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
            </FormField>
            <FormField label="Stock Quantity *">
              <input className="input" type="number" min="0" value={form.stockQty}
                onChange={e => setForm(f => ({ ...f, stockQty: e.target.value }))} placeholder="0" />
            </FormField>
          </div>
          <FormField label="Category *">
            <select className="input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Select category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Description">
            <textarea className="input" rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Product description…" />
          </FormField>
          {!editId && (
            <FormField label="Product Images">
              <input type="file" multiple accept="image/*" className="input py-1.5 text-xs"
                onChange={e => setImages(Array.from(e.target.files))} />
              {images.length > 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{images.length} file(s) selected</p>
              )}
            </FormField>
          )}
          <div className="flex gap-2 justify-end mt-2">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
              {saving && <Spinner size={14} />}
              {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Product" message="This product will be deactivated. This action cannot be undone." />
    </div>
  )
}
