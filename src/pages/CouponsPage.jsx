import { useState, useEffect } from 'react'
import { couponAPI } from '../services/api'
import { Spinner } from '../components/ui'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  code: '', discountType: 'PERCENTAGE', discountValue: '',
  minOrderAmount: '', maxUses: '', expiresAt: '', isActive: true,
}

export default function CouponsPage() {
  const [coupons, setCoupons]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await couponAPI.getAll()
      setCoupons(res.data.data)
    } catch { toast.error('Failed to load coupons') }
    finally  { setLoading(false) }
  }

  useEffect(() => { fetchCoupons() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit   = (c) => {
    setEditing(c)
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '', maxUses: c.maxUses || '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : '', isActive: c.isActive,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.code || !form.discountValue) return toast.error('Code and value are required')
    try {
      setSaving(true)
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      }
      if (editing) {
        await couponAPI.update(editing.id, payload)
        toast.success('Coupon updated')
      } else {
        await couponAPI.create(payload)
        toast.success('Coupon created')
      }
      setShowModal(false)
      fetchCoupons()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this coupon?')) return
    try {
      await couponAPI.delete(id)
      toast.success('Coupon deactivated')
      fetchCoupons()
    } catch { toast.error('Failed to delete coupon') }
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Discount & Coupons</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage promotional discount codes</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary"
        >
          + New Coupon
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }} className="text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Code</th>
                  <th className="px-6 py-4 text-left">Discount</th>
                  <th className="px-6 py-4 text-left">Min Order</th>
                  <th className="px-6 py-4 text-left">Usage</th>
                  <th className="px-6 py-4 text-left">Expires</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} className="table-row">
                    <td className="px-6 py-4">
                      <code className="font-mono px-2 py-0.5 rounded" style={{ color: 'var(--accent)', background: 'var(--accent-glow)' }}>
                        {c.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}%`
                        : `$${c.discountValue}`}
                    </td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                      ${Number(c.minOrderAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                      {c.usedCount} / {c.maxUses ?? '∞'}
                    </td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-600/30 text-slate-400 border border-slate-600'
                      }`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="btn-secondary px-3 py-1.5 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="btn-danger px-3 py-1.5 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                      No coupons yet. Create your first discount code!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg">
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl leading-none" style={{ color: 'var(--text-muted)' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Coupon Code *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    disabled={!!editing}
                    placeholder="e.g. SUMMER20"
                    className="input disabled:opacity-50 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="label">Type *</label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                    className="input"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    Value * {form.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    min="0.01" step="0.01"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Min Order Amount ($)</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                    min="0" step="0.01" placeholder="0"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Max Uses (blank = unlimited)</label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                    min="1" placeholder="∞"
                    className="input"
                  />
                </div>

                <div className="col-span-2">
                  <label className="label">Expires At (optional)</label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="input"
                  />
                </div>

                {editing && (
                  <div className="col-span-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4"
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <label htmlFor="isActive" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active</label>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 px-4 py-2.5 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
