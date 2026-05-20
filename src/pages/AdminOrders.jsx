import { useState, useEffect } from 'react'
import { orderAPI } from '../services/api'
import { Spinner } from '../components/ui'
import { formatCurrency, formatDateTime, orderStatusStyle, buildPageInfo } from '../utils/helpers'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Eye, X, ChevronDown } from 'lucide-react'

const ORDER_STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']

export default function OrdersPage() {
  const [orders, setOrders]       = useState([])
  const [pageInfo, setPageInfo]   = useState({ current: 0, total: 1 })
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = (page = 0) => {
    setLoading(true)
    orderAPI.getAll(page, 10)
      .then(r => {
        setOrders(r.data.data.content)
        setPageInfo(buildPageInfo(r.data.data))
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId)
    try {
      await orderAPI.updateStatus(orderId, status)
      toast.success('Order status updated')
      fetchOrders(pageInfo.current)
      if (selected?.id === orderId) setSelected({ ...selected, status })
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const StatusBadge = ({ status }) => {
    const s = orderStatusStyle[status] || { bg: '#1e293b', color: '#94a3b8', label: status }
    return (
      <span style={{ background: s.bg, color: s.color }}
        className="text-xs font-medium px-2.5 py-1 rounded-full">
        {s.label}
      </span>
    )
  }

  const StatusSelect = ({ order }) => (
    <div className="relative">
      <select
        value={order.status}
        disabled={updatingId === order.id}
        onChange={e => handleStatusChange(order.id, e.target.value)}
        className="appearance-none input text-xs rounded-lg pl-3 pr-8 py-1.5 cursor-pointer disabled:opacity-50">
        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
    </div>
  )

  return (
    <div className="fade-in flex flex-col gap-6">
      <div>
        <h1 className="page-title">Orders</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>View and manage all customer orders</p>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }} className="text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Order</th>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-right px-5 py-3">Total</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Update</th>
                  <th className="text-center px-5 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="table-row">
                    <td className="px-5 py-3 font-mono" style={{ color: 'var(--accent)' }}>#{order.id}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{order.userName}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.userEmail}</div>
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{formatDateTime(order.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3"><StatusSelect order={order} /></td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => setSelected(order)}
                        className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--text-muted)' }}>Page {pageInfo.current + 1} of {pageInfo.total}</span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchOrders(pageInfo.current - 1)}
                disabled={pageInfo.current === 0}
                className="btn-secondary flex items-center gap-1 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => fetchOrders(pageInfo.current + 1)}
                disabled={pageInfo.current >= pageInfo.total - 1}
                className="btn-secondary flex items-center gap-1 px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 sticky top-0" style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--surface-elevated)' }}>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Order #{selected.id}</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatDateTime(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Customer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4" style={{ background: 'var(--bg-hover)' }}>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Customer</p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selected.userName}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selected.userEmail}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'var(--bg-hover)' }}>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Shipping Address</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{selected.shippingAddress}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Items</p>
                <div className="space-y-2">
                  {selected.items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: 'var(--bg-hover)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.productName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                      </div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg-hover)' }}>
                <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(selected.subtotal)}</span>
                </div>
                {selected.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Discount {selected.couponCode && `(${selected.couponCode})`}</span>
                    <span>-{formatCurrency(selected.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2" style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--border-light)' }}>
                  <span>Total</span>
                  <span>{formatCurrency(selected.totalAmount)}</span>
                </div>
              </div>

              {/* Status update */}
              <div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map(s => (
                    <button key={s}
                      onClick={() => handleStatusChange(selected.id, s)}
                      style={selected.status === s ? {
                        background: orderStatusStyle[s]?.bg,
                        color: orderStatusStyle[s]?.color,
                        borderColor: orderStatusStyle[s]?.color
                      } : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        selected.status === s
                          ? 'border-current font-semibold'
                          : 'font-medium hover:opacity-80'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
