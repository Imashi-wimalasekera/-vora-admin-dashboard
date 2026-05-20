import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { notificationAPI, settingsAPI } from '../services/api'

const FILTERS = ['All', 'Orders', 'Payments', 'Stock', 'Users', 'System']
const POLL_INTERVAL_MS = 15000

const TYPE_META = {
  order:   { icon: '🛒', color: 'var(--teal)' },
  payment: { icon: '💳', color: 'var(--success)' },
  stock:   { icon: '⚠️', color: 'var(--warning)' },
  user:    { icon: '👤', color: 'var(--info)' },
  system:  { icon: '💾', color: 'var(--teal-mid)' },
}

const PREFERENCE_KEYS = [
  { key: 'notifyNewOrders', label: 'New Orders', desc: 'Get notified when a new order is placed' },
  { key: 'notifyPaymentUpdates', label: 'Payment Updates', desc: 'Alerts for successful or failed payments' },
  { key: 'notifyLowStockAlerts', label: 'Low Stock Alerts', desc: 'When product stock falls below threshold' },
  { key: 'notifyNewUsers', label: 'New Users', desc: 'When a new customer registers' },
  { key: 'notifySystemUpdates', label: 'System Updates', desc: 'Maintenance and system notifications' },
]

function mapNotification(n) {
  const type = (n.type || 'system').toLowerCase()
  return {
    id: n.id,
    type,
    read: !!n.read,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt,
    ...TYPE_META[type] || TYPE_META.system,
  }
}

function formatRelativeTime(value) {
  if (!value) return ''
  const now = Date.now()
  const ts = new Date(value).getTime()
  const diffMs = Math.max(0, now - ts)
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(value).toLocaleDateString()
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState(null)

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  )

  const loadNotifications = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      const { data } = await notificationAPI.getAll()
      setNotifications((data.data || []).map(mapNotification))
    } catch {
      if (!silent) toast.error('Failed to load notifications')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const loadPreferences = async () => {
    try {
      const { data } = await settingsAPI.get()
      setPreferences(data.data)
    } catch {
      toast.error('Failed to load notification preferences')
    }
  }

  useEffect(() => {
    loadNotifications()
    loadPreferences()

    const timer = setInterval(() => {
      loadNotifications({ silent: true })
    }, POLL_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [])

  const filtered = notifications.filter(n => {
    if (filter === 'All') return true
    return n.type === filter.toLowerCase()
  })

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead()
      setNotifications(ns => ns.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const markRead = async (id) => {
    const target = notifications.find(n => n.id === id)
    if (!target || target.read) return

    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
    try {
      await notificationAPI.markRead(id)
    } catch {
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: false } : n))
      toast.error('Failed to mark notification as read')
    }
  }

  const deleteNotif = async (id) => {
    try {
      await notificationAPI.delete(id)
      setNotifications(ns => ns.filter(n => n.id !== id))
      toast.success('Notification removed')
    } catch {
      toast.error('Failed to delete notification')
    }
  }

  const clearAll = async () => {
    try {
      await notificationAPI.clearAll()
      setNotifications([])
      toast.success('All notifications cleared')
    } catch {
      toast.error('Failed to clear notifications')
    }
  }

  const togglePreference = async (key, nextValue) => {
    if (!preferences) return
    const previous = preferences
    const updated = { ...preferences, [key]: nextValue }
    setPreferences(updated)
    try {
      await settingsAPI.update(updated)
      toast.success('Preferences updated')
    } catch {
      setPreferences(previous)
      toast.error('Failed to update preferences')
    }
  }

  return (
    <div className="fade-in flex flex-col gap-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button className="btn-secondary text-xs py-1.5 px-3" onClick={markAllRead}>
              ✓ Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn-danger text-xs py-1.5 px-3" onClick={clearAll}>
              🗑 Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={filter === f
              ? { background: 'var(--teal)', color: '#fff' }
              : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            {f}
            {f === 'All' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'var(--salmon)', color: '#fff' }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="card py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Loading notifications...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4" style={{ opacity: 0.3 }}>🔔</div>
          <p className="font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
            No notifications
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            You're all caught up!
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filtered.map((notif, idx) => (
            <div key={notif.id}
              className="flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer"
              style={{
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                background: notif.read ? 'transparent' : 'rgba(42,138,138,0.04)',
              }}
              onClick={() => markRead(notif.id)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(42,138,138,0.04)'}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5"
                style={{ background: `${notif.color}15`, color: notif.color }}>
                {notif.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold"
                    style={{ color: 'var(--text-primary)', fontFamily: notif.read ? 'DM Sans, sans-serif' : 'DM Sans, sans-serif', fontWeight: notif.read ? 500 : 700 }}>
                    {notif.title}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(notif.createdAt)}</span>
                    <button
                      className="text-xs w-5 h-5 rounded flex items-center justify-center transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onClick={e => { e.stopPropagation(); deleteNotif(notif.id) }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >✕</button>
                  </div>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {notif.message}
                </p>
              </div>

              {/* Unread dot */}
              {!notif.read && (
                <div className="w-2 h-2 rounded-full shrink-0 mt-2"
                  style={{ background: 'var(--teal)' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notification Preferences card */}
      <div className="card p-5">
        <p className="font-bold text-sm mb-4"
          style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
          Notification Preferences
        </p>
        <div className="flex flex-col gap-3">
          {PREFERENCE_KEYS.map(item => (
            <ToggleRow
              key={item.key}
              label={item.label}
              desc={item.desc}
              on={preferences ? !!preferences[item.key] : false}
              disabled={!preferences}
              onChange={(value) => togglePreference(item.key, value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, on, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between py-2"
      style={{ borderBottom: '1px solid var(--border-light)' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!on)}
        className="relative w-11 h-6 rounded-full transition-all duration-200 shrink-0"
        style={{ background: on ? 'var(--teal)' : 'var(--border)', opacity: disabled ? 0.6 : 1 }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 shadow-sm"
          style={{ left: on ? '22px' : '2px' }} />
      </button>
    </div>
  )
}