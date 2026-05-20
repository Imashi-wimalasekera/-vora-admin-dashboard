import { useState, useEffect } from 'react'
import { productAPI } from '../services/api'
import { Spinner, Modal, FormField } from '../components/ui'
import { formatDateTime } from '../utils/helpers'
import toast from 'react-hot-toast'
import { Package, AlertTriangle, Search, Edit2 } from 'lucide-react'

export default function InventoryPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editProduct, setEditProduct] = useState(null)
  const [newQty, setNewQty] = useState('')
  const [saving, setSaving] = useState(false)
  const [threshold, setThreshold] = useState(10)

  const fetchProducts = () => {
    setLoading(true)
    productAPI.getAll(0, 100)
      .then(r => setProducts(r.data.data?.content || r.data.data || []))
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const handleUpdateStock = async () => {
    if (newQty === '' || isNaN(newQty) || Number(newQty) < 0) {
      toast.error('Enter a valid quantity')
      return
    }
    setSaving(true)
    try {
      await productAPI.updateStock(editProduct.id, { stockQty: parseInt(newQty) })
      toast.success(`Stock updated for ${editProduct.name}`)
      setEditProduct(null)
      setNewQty('')
      fetchProducts()
    } catch {
      toast.error('Failed to update stock')
    } finally {
      setSaving(false)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.categoryName || '').toLowerCase().includes(search.toLowerCase())
  )

  const stockLevel = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', bg: 'rgba(248,113,113,0.12)', color: 'var(--danger)' }
    if (qty <= threshold) return { label: 'Low Stock', bg: 'rgba(251,191,36,0.16)', color: 'var(--warning)' }
    return { label: 'In Stock', bg: 'rgba(52,211,153,0.12)', color: 'var(--success)' }
  }

  const outOfStock = products.filter(p => p.stockQty === 0).length
  const lowStock   = products.filter(p => p.stockQty > 0 && p.stockQty <= threshold).length
  const inStock    = products.filter(p => p.stockQty > threshold).length

  return (
    <div className="fade-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Track and manage product stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Low-stock threshold:</label>
          <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))}
            className="input w-16 px-2 py-1.5 text-sm text-center" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <Package className="w-8 h-8" style={{ color: 'var(--success)' }} />
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{inStock}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>In Stock</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" style={{ color: 'var(--warning)' }} />
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>{lowStock}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Low Stock</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" style={{ color: 'var(--danger)' }} />
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>{outOfStock}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input w-full pl-9 pr-3 py-2.5 text-sm" />
      </div>

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-light)' }}>
              <tr>
                {['Product', 'Category', 'Stock Qty', 'Status', 'Last Updated', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center" style={{ color: 'var(--text-muted)' }}>No products found</td></tr>
              )}
              {filtered.map(p => {
                const level = stockLevel(p.stockQty)
                return (
                  <tr key={p.id} className="table-row">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]?.imageUrl ? (
                          <img src={p.images[0].imageUrl} alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover" style={{ background: 'var(--bg-hover)' }} />
                        ) : (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
                            <Package className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                          </div>
                        )}
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{p.categoryName || '—'}</td>
                    <td className="px-5 py-3">
                      <span className="text-lg font-bold" style={{ color: p.stockQty === 0 ? 'var(--danger)' : p.stockQty <= threshold ? 'var(--warning)' : 'var(--text-primary)' }}>
                        {p.stockQty}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: level.bg, color: level.color }}>
                        {level.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(p.updatedAt)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => { setEditProduct(p); setNewQty(p.stockQty.toString()) }}
                        className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                        style={{ color: 'var(--accent)' }}>
                        <Edit2 className="w-3.5 h-3.5" />
                        Update
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Stock Modal */}
      <Modal open={!!editProduct} onClose={() => { setEditProduct(null); setNewQty('') }}
        title={`Update Stock — ${editProduct?.name}`} width="max-w-sm">
        <div className="space-y-4">
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-hover)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Current Stock</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{editProduct?.stockQty}</p>
          </div>
          <FormField label="New Quantity" required>
            <input type="number" min="0" value={newQty} onChange={e => setNewQty(e.target.value)}
              placeholder="Enter new quantity"
              className="input w-full px-3 py-2.5 text-sm" />
          </FormField>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={() => { setEditProduct(null); setNewQty('') }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary flex-1 disabled:opacity-60"
              disabled={saving}
              onClick={handleUpdateStock}
            >
              {saving ? 'Saving...' : 'Save Stock'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
