import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Sidebar from './Sidebar'

const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/products':      'Products',
  '/categories':    'Categories',
  '/orders':        'Orders',
  '/users':         'Users',
  '/inventory':     'Inventory',
  '/payments':      'Payments',
  '/coupons':       'Coupons',
  '/reports':       'Reports',
  '/notifications': 'Notifications',
  '/settings':      'Settings',
}

export default function Layout() {
  const { user, logout }        = useAuth()
  const location                = useLocation()
  const navigate                = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard'
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  const unreadCountRaw = Number(localStorage.getItem('unreadNotifications') ?? '0')
  const unreadCount = Number.isFinite(unreadCountRaw) && unreadCountRaw > 0
    ? Math.floor(unreadCountRaw)
    : 0

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />

      <main className="flex-1 overflow-y-auto">

        {/* ── Top Bar ── */}
        <div
          className="sticky top-0 z-40 px-7 py-3.5 flex items-center justify-between gap-4"
          style={{
            background: 'var(--topbar-bg)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid var(--border-light)',
            minHeight: 64,
          }}
        >
          {/* Left: page title + date */}
          <div className="flex flex-col justify-center" style={{ minWidth: 140 }}>
            <h2 className="text-lg font-bold leading-tight"
              style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
              {pageTitle}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Today, {today}</p>
          </div>

          {/* Centre: search */}
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--text-muted)' }}>🔍</span>
              <input
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
                placeholder="Search for something…"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.background = 'var(--surface-floating)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-primary)' }}
              />
            </div>
          </div>

          {/* Right: icons + user */}
          <div className="flex items-center gap-2 shrink-0">

            {/* 🔔 Notifications button */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: location.pathname === '/notifications' ? 'var(--teal-light)' : 'var(--bg-primary)',
                border: `1.5px solid ${location.pathname === '/notifications' ? 'var(--teal)' : 'var(--border)'}`,
              }}
              title="Notifications"
            >
              <span style={{ fontSize: 15 }}>🔔</span>
              {unreadCount > 0 && (
                <span
                  className="absolute flex items-center justify-center text-white font-bold"
                  style={{
                    top: -4, right: -4,
                    minWidth: 16, height: 16,
                    borderRadius: 99,
                    background: 'var(--salmon)',
                    fontSize: 9,
                    border: '2px solid var(--surface-floating)',
                    padding: '0 3px',
                  }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* ⚙️ Settings button */}
            <button
              onClick={() => navigate('/settings')}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: location.pathname === '/settings' ? 'var(--teal-light)' : 'var(--bg-primary)',
                border: `1.5px solid ${location.pathname === '/settings' ? 'var(--teal)' : 'var(--border)'}`,
              }}
              title="Settings"
            >
              <span style={{ fontSize: 15 }}>⚙️</span>
            </button>

            <div className="w-px h-7 mx-1" style={{ background: 'var(--border)' }} />

            {/* User avatar + dropdown */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setShowMenu(v => !v) }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all"
                style={{
                  border: '1.5px solid var(--border)',
                  background: showMenu ? 'var(--teal-light)' : 'var(--surface-floating)',
                }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--salmon)', color: '#fff' }}>
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>Admin</p>
                </div>
                <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>⌄</span>
              </button>

              {/* Dropdown */}
              {showMenu && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden fade-in"
                  style={{
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 16px 48px rgba(26,107,107,0.15)',
                    zIndex: 9999,
                    top: '100%',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* User info header */}
                  <div className="px-4 py-3 flex items-center gap-3"
                    style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ background: 'var(--salmon)', color: '#fff' }}>
                      {user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {user?.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {[
                    { icon: '👤', label: 'My Account',    path: '/settings' },
                    { icon: '⚙️', label: 'Preferences',   path: '/settings' },
                    { icon: '🔔', label: 'Notifications',  path: '/notifications' },
                  ].map(item => (
                    <button key={item.label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onClick={() => { navigate(item.path); setShowMenu(false) }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{item.icon}</span><span>{item.label}</span>
                    </button>
                  ))}

                  <div style={{ borderTop: '1px solid var(--border-light)' }}>
                    <button
                      onClick={() => { logout(); window.location.href = '/login' }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left"
                      style={{ color: 'var(--danger)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,90,90,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>↩</span><span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Page content ── */}
        <div className="p-7 max-w-7xl mx-auto" onClick={() => setShowMenu(false)}>
          <Outlet />
        </div>

      </main>
    </div>
  )
}