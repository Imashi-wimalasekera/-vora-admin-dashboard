import { useState, useEffect } from 'react'
import { paymentAPI } from '../services/api'
import { Spinner } from '../components/ui'
import { formatCurrency, formatDateTime, paymentStatusStyle } from '../utils/helpers'
import toast from 'react-hot-toast'
import { RefreshCw, Eye, X } from 'lucide-react'

export default function PaymentsPage() {
  const [payments, setPayments]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [refunding, setRefunding] = useState(null)

  const fetchPayments = () => {
    setLoading(true)
    paymentAPI.getAll()
      .then(r => setPayments(r.data.data))
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPayments() }, [])

  const handleRefund = async (paymentId) => {
    setRefunding(paymentId)
    try {
      await paymentAPI.refund(paymentId)
      toast.success('Refund issued successfully')
      fetchPayments()
      setSelected(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed')
    } finally {
      setRefunding(null)
    }
  }

  const StatusBadge = ({ status }) => {
    const s = paymentStatusStyle[status] || { bg: '#1e293b', color: '#94a3b8', label: status }
    return (
      <span style={{ background: s.bg, color: s.color }}
        className="text-xs font-medium px-2.5 py-1 rounded-full">
        {s.label}
      </span>
    )
  }

  // Summary stats
  const stats = {
    total: payments.length,
    success: payments.filter(p => p.status === 'SUCCESS').length,
    failed: payments.filter(p => p.status === 'FAILED').length,
    refunded: payments.filter(p => p.status === 'REFUNDED').length,
    revenue: payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + (p.amount || 0), 0),
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      <div>
        <h1 className="page-title">Payments</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Monitor transactions and process refunds</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-blue-400' },
          { label: 'Successful', value: stats.success, color: 'text-green-400' },
          { label: 'Failed', value: stats.failed, color: 'text-red-400' },
          { label: 'Revenue', value: formatCurrency(stats.revenue), color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }} className="text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">ID</th>
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-center px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>#{p.id}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.userName}</p>
                  </td>
                  <td className="px-5 py-3 font-mono" style={{ color: 'var(--accent)' }}>#{p.orderId}</td>
                  <td className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(p.paidAt || p.createdAt)}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelected(p)}
                        className="transition-colors" style={{ color: 'var(--text-muted)' }}>
                        <Eye size={15} />
                      </button>
                      {p.status === 'SUCCESS' && (
                        <button
                          onClick={() => handleRefund(p.id)}
                          disabled={refunding === p.id}
                          title="Issue Refund"
                          className="disabled:opacity-40 transition-colors" style={{ color: 'var(--text-muted)' }}>
                          <RefreshCw size={15} className={refunding === p.id ? 'animate-spin' : ''} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Payment #{selected.id}</h2>
              <button onClick={() => setSelected(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Customer', selected.userName],
                  ['Order', `#${selected.orderId}`],
                  ['Amount', formatCurrency(selected.amount)],
                  ['Currency', selected.currency],
                  ['Method', selected.paymentMethod || '—'],
                  ['Status', <StatusBadge key="s" status={selected.status} />],
                  ['Paid At', formatDateTime(selected.paidAt)],
                  ['Created', formatDateTime(selected.createdAt)],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-lg p-3" style={{ background: 'var(--bg-hover)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <p className="mt-1" style={{ color: 'var(--text-primary)' }}>{val}</p>
                  </div>
                ))}
              </div>
              {selected.stripePaymentIntentId && (
                <div className="rounded-lg p-3" style={{ background: 'var(--bg-hover)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Stripe Intent ID</p>
                  <p className="font-mono text-xs mt-1 break-all" style={{ color: 'var(--text-secondary)' }}>{selected.stripePaymentIntentId}</p>
                </div>
              )}
              {selected.status === 'SUCCESS' && (
                <button
                  onClick={() => handleRefund(selected.id)}
                  disabled={refunding === selected.id}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">
                  <RefreshCw size={15} className={refunding === selected.id ? 'animate-spin' : ''} />
                  {refunding === selected.id ? 'Processing Refund…' : 'Issue Full Refund'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
