import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const NAV = [
  { to: '/dashboard',  icon: '◈', label: 'Dashboard' },
  { to: '/products',   icon: '⬡', label: 'Products' },
  { to: '/categories', icon: '⊞', label: 'Categories' },
  { to: '/orders',     icon: '◎', label: 'Orders' },
  { to: '/users',      icon: '◯', label: 'Users' },
  { to: '/inventory',  icon: '▤', label: 'Inventory' },
  { to: '/payments',   icon: '◇', label: 'Payments' },
  { to: '/coupons',    icon: '⬙', label: 'Coupons' },
  { to: '/reports',    icon: '◱', label: 'Reports' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="flex flex-col w-64 shrink-0 h-screen sticky top-0"
      style={{ background: 'var(--bg-sidebar)' }}>

      {/* Logo */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: 'var(--salmon)', color: '#fff', fontFamily: 'Playfair Display, serif' }}>
            É
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight"
              style={{ color: '#fff', fontFamily: 'Playfair Display, serif' }}>
              Évora
            </span>
            <span className="block text-sm"
              style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.15em' }}>
              ADMIN
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 flex flex-col gap-0.5">
        <p className="section-title px-3 mb-3">Navigation</p>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="text-base w-5 text-center leading-none">{icon}</span>
            <span className="tracking-wide">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'var(--salmon)', color: '#fff' }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: '#fff' }}>
              {user?.name || 'Admin'}
            </div>
            <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="sidebar-link w-full mt-1 text-left"
          style={{ color: 'rgba(255,255,255,0.55)' }}>
          <span className="text-base w-5 text-center">↩</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}