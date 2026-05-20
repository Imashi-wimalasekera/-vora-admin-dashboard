import { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import { StatCard, Spinner, Badge } from '../components/ui'
import { formatCurrency, formatDateTime, orderStatusStyle } from '../utils/helpers'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const PIE_COLORS = ['#4f8ef7','#34d399','#fbbf24','#f87171','#a78bfa','#fb923c','#22d3ee']

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardAPI.getSummary()
      .then(res => setData(res.data.data))
      .catch(() => setError('Unable to load dashboard data right now.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  )
  if (error) return (
    <div className="card p-6">
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Dashboard unavailable</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{error}</p>
    </div>
  )
  if (!data) return null

  const monthlyData = Object.entries(data.monthlyRevenue || {}).map(([m, v]) => ({
    month: MONTHS[parseInt(m) - 1],
    revenue: v,
  }))

  const statusData = Object.entries(data.orderStatusBreakdown || {}).map(([k, v]) => ({
    name: k, value: v
  }))

  return (
    <div className="fade-in flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Welcome back — here's what's happening today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Users"    value={data.totalUsers?.toLocaleString()}    color="var(--accent)" />
        <StatCard icon="🛒" label="Total Orders"   value={data.totalOrders?.toLocaleString()}   color="var(--success)" />
        <StatCard icon="💰" label="Total Revenue"  value={formatCurrency(data.totalRevenue)}    color="var(--warning)" />
        <StatCard icon="⚠️" label="Out of Stock"   value={data.outOfStockProducts?.toLocaleString()} color="var(--danger)" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Area Chart */}
        <div className="card p-5 lg:col-span-2">
          <p className="section-title mb-4">Monthly Revenue — {new Date().getFullYear()}</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f8ef7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-primary)' }}
                formatter={v => [formatCurrency(v), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#4f8ef7" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="card p-5">
          <p className="section-title mb-4">Order Status</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                dataKey="value" nameKey="name" paddingAngle={2}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1 mt-2">
            {statusData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                </div>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Orders</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Order ID','Customer','Amount','Status','Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.recentOrders || []).map(order => {
                const s = orderStatusStyle[order.status] || orderStatusStyle.PENDING
                return (
                  <tr key={order.orderId} className="table-row">
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--accent)' }}>#{order.orderId}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{order.customerName}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{formatCurrency(order.amount)}</td>
                    <td className="px-4 py-3"><Badge label={s.label} bg={s.bg} color={s.color} /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(order.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
