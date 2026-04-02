import { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import { Spinner } from '../components/ui'
import { formatCurrency } from '../utils/helpers'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts'
import { Download, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function ReportsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    setLoading(true)
    dashboardAPI.getSummary()
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [year])

  if (loading) return <Spinner />
  if (!data) return null

  const monthlyData = Object.entries(data.monthlyRevenue || {}).map(([m, v]) => ({
    month: MONTHS[parseInt(m) - 1],
    revenue: v,
    monthNum: parseInt(m),
  }))

  const statusData = Object.entries(data.orderStatusBreakdown || {}).map(([k, v]) => ({
    status: k, count: v,
  }))

  const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0)
  const bestMonth = monthlyData.reduce((best, d) => d.revenue > (best?.revenue ?? 0) ? d : best, null)
  const avgMonthly = totalRevenue / (monthlyData.filter(d => d.revenue > 0).length || 1)

  const exportCSV = () => {
    const rows = [
      ['Month', 'Revenue'],
      ...monthlyData.map(d => [d.month, d.revenue])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-report-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fade-in flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Sales performance and order statistics</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="input px-3 py-2 text-sm w-28">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={exportCSV}
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm font-medium">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--accent-glow)' }}>
              <DollarSign className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Revenue ({year})</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(52,211,153,0.12)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--success)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Best Month</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{bestMonth?.month ?? '—'}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{bestMonth ? formatCurrency(bestMonth.revenue) : ''}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.12)' }}>
              <ShoppingBag className="w-5 h-5" style={{ color: '#8b5cf6' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Avg. Monthly Revenue</p>
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(avgMonthly)}</p>
        </div>
      </div>

      {/* Monthly Revenue Bar Chart */}
      <div className="card p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Monthly Revenue — {year}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={v => [formatCurrency(v), 'Revenue']} />
            <Bar dataKey="revenue" fill="var(--accent)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Order Status Breakdown */}
      <div className="card p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Order Status Breakdown</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={statusData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
            <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="status" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={false} tickLine={false} width={100} />
            <Tooltip
              contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Raw Data Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly Revenue Table</h2>
        </div>
        <table className="w-full text-sm">
          <thead style={{ background: 'var(--bg-hover)' }}>
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Month</th>
              <th className="text-right px-6 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Revenue</th>
              <th className="text-right px-6 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>vs. Average</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map(d => (
              <tr key={d.month} className="table-row">
                <td className="px-6 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>{d.month} {year}</td>
                <td className="px-6 py-3 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(d.revenue)}</td>
                <td className="px-6 py-3 text-right">
                  {d.revenue === 0 ? (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  ) : (
                    <span className={`text-xs font-medium ${d.revenue >= avgMonthly ? 'text-green-600' : 'text-red-500'}`}>
                      {d.revenue >= avgMonthly ? '▲' : '▼'} {Math.abs(((d.revenue - avgMonthly) / avgMonthly) * 100).toFixed(1)}%
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{ background: 'var(--bg-hover)', borderTop: '1px solid var(--border-light)' }}>
            <tr>
              <td className="px-6 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>Total</td>
              <td className="px-6 py-3 text-right font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalRevenue)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
