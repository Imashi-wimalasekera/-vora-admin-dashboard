import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { Spinner } from '../components/ui'
import { settingsAPI, userAPI } from '../services/api'

const TABS = [
  { id: 'profile',   icon: '👤', label: 'Profile' },
  { id: 'store',     icon: '🏪', label: 'Store' },
  { id: 'security',  icon: '🔒', label: 'Security' },
  { id: 'payment',   icon: '💳', label: 'Payment' },
  { id: 'appearance',icon: '🎨', label: 'Appearance' },
]

const DEFAULT_SETTINGS = {
  storeName: 'Evora',
  storeEmail: 'support@evora.com',
  currency: 'USD',
  timezone: 'Asia/Colombo',
  language: 'English',
  address: '',
  lowStockThreshold: 10,
  orderPrefix: 'EVR-',
  stripeSecretKey: '',
  stripePublishableKey: '',
  stripeWebhookSecret: '',
  stripeTestMode: true,
  theme: 'light',
  density: 'comfortable',
  animationsEnabled: true,
  compactSidebar: false,
  dateFormat: 'MMM DD, YYYY',
  notifyNewOrders: true,
  notifyPaymentUpdates: true,
  notifyLowStockAlerts: true,
  notifyNewUsers: false,
  notifySystemUpdates: false,
}

// ── Reusable section card ──────────────────────────────────────────────────
function Section({ title, desc, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--teal-light)' }}>
        <p className="font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--teal-deep)' }}>
          {title}
        </p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--teal)' }}>{desc}</p>}
      </div>
      <div className="p-6 flex flex-col gap-5">{children}</div>
    </div>
  )
}

// ── Field row ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-start">
      <label className="text-xs font-semibold uppercase tracking-wide pt-2.5"
        style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <div className="col-span-2">{children}</div>
    </div>
  )
}

// ── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all duration-200"
      style={{ background: value ? 'var(--teal)' : 'var(--border)' }}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 shadow-sm"
        style={{ left: value ? '22px' : '2px' }} />
    </button>
  )
}

// ── Profile Tab ────────────────────────────────────────────────────────────
function ProfileTab({ profile, onSave, saving }) {
  const [form, setForm] = useState({
    name:  profile?.name  || '',
    email: profile?.email || '',
    phone: '',
  })

  useEffect(() => {
    setForm({
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    })
  }, [profile])

  const save = async () => {
    if (!form.name.trim()) return toast.error('Name is required')
    await onSave({ name: form.name.trim(), phone: form.phone || '' })
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="Personal Information" desc="Update your personal details">

        {/* Avatar */}
        <Field label="Photo">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: 'var(--salmon)', color: '#fff', fontFamily: 'Playfair Display, serif' }}>
              {form.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col gap-1.5">
              <button className="btn-teal text-xs py-1.5 px-3 w-fit">Upload Photo</button>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>JPG, PNG up to 2MB</p>
            </div>
          </div>
        </Field>

        <Field label="Full Name">
          <input className="input" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </Field>

        <Field label="Email">
          <input className="input" type="email" value={form.email}
            disabled
            readOnly />
        </Field>

        <Field label="Phone">
          <input className="input" placeholder="+94 XX XXX XXXX" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </Field>

        <div className="flex justify-end pt-1">
          <button className="btn-primary flex items-center gap-2" onClick={save} disabled={saving}>
            {saving && <Spinner size={14} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </Section>
    </div>
  )
}

// ── Store Tab ──────────────────────────────────────────────────────────────
function StoreTab({ settings, setSettings, saveSettings, saving }) {
  const form = settings || DEFAULT_SETTINGS

  const updateField = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="Store Information" desc="Basic details about your store">
        <Field label="Store Name">
          <input className="input" value={form.storeName}
            onChange={e => updateField('storeName', e.target.value)} />
        </Field>
        <Field label="Support Email">
          <input className="input" type="email" value={form.storeEmail}
            onChange={e => updateField('storeEmail', e.target.value)} />
        </Field>
        <Field label="Address">
          <textarea className="input" rows={2} placeholder="Store address…" value={form.address}
            onChange={e => updateField('address', e.target.value)} />
        </Field>
      </Section>

      <Section title="Regional Settings" desc="Currency, timezone and language">
        <Field label="Currency">
          <select className="input" value={form.currency}
            onChange={e => updateField('currency', e.target.value)}>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="LKR">LKR — Sri Lankan Rupee</option>
          </select>
        </Field>
        <Field label="Timezone">
          <select className="input" value={form.timezone}
            onChange={e => updateField('timezone', e.target.value)}>
            <option value="Asia/Colombo">Asia/Colombo (UTC+5:30)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
          </select>
        </Field>
        <Field label="Language">
          <select className="input" value={form.language}
            onChange={e => updateField('language', e.target.value)}>
            <option>English</option>
            <option>Sinhala</option>
            <option>Tamil</option>
          </select>
        </Field>
      </Section>

      <Section title="Order Settings">
        <Field label="Order ID Prefix">
          <input className="input" value={form.orderPrefix}
            onChange={e => updateField('orderPrefix', e.target.value)}
            placeholder="e.g. EVR-" />
        </Field>
        <Field label="Low Stock Alert">
          <div className="flex items-center gap-3">
            <input className="input w-32" type="number" min="1" value={form.lowStockThreshold}
              onChange={e => updateField('lowStockThreshold', Number(e.target.value || 1))} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>units remaining</span>
          </div>
        </Field>
      </Section>

      <div className="flex justify-end">
        <button className="btn-primary flex items-center gap-2" onClick={saveSettings} disabled={saving}>
          {saving && <Spinner size={14} />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

// ── Security Tab ───────────────────────────────────────────────────────────
function SecurityTab({ onChangePassword, changingPassword }) {
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [twoFA, setTwoFA] = useState(false)
  const [sessions] = useState([
    { device: 'Chrome on Windows', location: 'Colombo, LK', time: 'Active now',   current: true  },
    { device: 'Safari on iPhone',  location: 'Colombo, LK', time: '2 hours ago',  current: false },
    { device: 'Firefox on Mac',    location: 'Unknown',      time: '3 days ago',   current: false },
  ])

  const savePassword = async () => {
    if (!pwd.current) return toast.error('Enter your current password')
    if (pwd.next.length < 6) return toast.error('New password must be at least 6 characters')
    if (pwd.next !== pwd.confirm) return toast.error('Passwords do not match')
    await onChangePassword({ currentPassword: pwd.current, newPassword: pwd.next })
    setPwd({ current: '', next: '', confirm: '' })
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="Change Password" desc="Use a strong, unique password">
        <Field label="Current Password">
          <input className="input" type="password" value={pwd.current} placeholder="••••••••"
            onChange={e => setPwd(p => ({ ...p, current: e.target.value }))} />
        </Field>
        <Field label="New Password">
          <input className="input" type="password" value={pwd.next} placeholder="Min. 6 characters"
            onChange={e => setPwd(p => ({ ...p, next: e.target.value }))} />
        </Field>
        <Field label="Confirm Password">
          <input className="input" type="password" value={pwd.confirm} placeholder="Repeat new password"
            onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} />
        </Field>
        <div className="flex justify-end">
          <button className="btn-primary flex items-center gap-2" onClick={savePassword} disabled={changingPassword}>
            {changingPassword && <Spinner size={14} />}
            {changingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </Section>

      <Section title="Two-Factor Authentication" desc="Add an extra layer of security">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Enable 2FA
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Require a verification code on login
            </p>
          </div>
          <Toggle value={twoFA} onChange={v => { setTwoFA(v); toast.success(`2FA ${v ? 'enabled' : 'disabled'}`) }} />
        </div>
      </Section>

      <Section title="Active Sessions" desc="Devices currently logged in">
        <div className="flex flex-col gap-3">
          {sessions.map(s => (
            <div key={s.device} className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--teal-light)', color: 'var(--teal)', fontSize: 16 }}>
                  💻
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {s.device}
                    {s.current && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(42,157,107,0.1)', color: 'var(--success)' }}>
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {s.location} · {s.time}
                  </p>
                </div>
              </div>
              {!s.current && (
                <button className="btn-danger text-xs py-1 px-3"
                  onClick={() => toast.success('Session terminated')}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ── Payment Tab ────────────────────────────────────────────────────────────
function PaymentTab({ settings, setSettings, saveSettings, saving }) {
  const form = settings || DEFAULT_SETTINGS

  const updateField = (key, value) => {
    setSettings(prev => ({ ...(prev || DEFAULT_SETTINGS), [key]: value }))
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="Stripe Integration" desc="Configure your Stripe payment keys">
        <div className="flex items-center justify-between py-2"
          style={{ borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Test Mode</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Use test keys — no real charges
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{ background: form.stripeTestMode ? 'rgba(212,137,26,0.1)' : 'rgba(42,157,107,0.1)',
                       color: form.stripeTestMode ? 'var(--warning)' : 'var(--success)' }}>
              {form.stripeTestMode ? 'TEST' : 'LIVE'}
            </span>
            <Toggle value={form.stripeTestMode} onChange={value => updateField('stripeTestMode', value)} />
          </div>
        </div>

        <Field label="Secret Key">
          <input className="input font-mono text-xs" type="password" value={form.stripeSecretKey}
            onChange={e => updateField('stripeSecretKey', e.target.value)} placeholder="sk_test_..." />
        </Field>

        <Field label="Publishable Key">
          <input className="input font-mono text-xs" value={form.stripePublishableKey}
            onChange={e => updateField('stripePublishableKey', e.target.value)} placeholder="pk_test_..." />
        </Field>

        <Field label="Webhook Secret">
          <input className="input font-mono text-xs" type="password" value={form.stripeWebhookSecret}
            onChange={e => updateField('stripeWebhookSecret', e.target.value)} placeholder="whsec_..." />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Webhook endpoint: <span className="font-mono" style={{ color: 'var(--teal)' }}>
              /api/payments/webhook
            </span>
          </p>
        </Field>

        <div className="flex justify-end">
          <button className="btn-primary flex items-center gap-2" onClick={saveSettings} disabled={saving}>
            {saving && <Spinner size={14} />}
            {saving ? 'Saving…' : 'Save Keys'}
          </button>
        </div>
      </Section>

      {/* Test cards reference */}
      <Section title="Test Cards" desc="Use these card numbers in test mode">
        <div className="grid grid-cols-1 gap-3">
          {[
            { number: '4242 4242 4242 4242', result: 'Payment Success',  color: 'var(--success)' },
            { number: '4000 0000 0000 0002', result: 'Card Declined',    color: 'var(--danger)' },
            { number: '4000 0025 0000 3155', result: '3D Secure',        color: 'var(--warning)' },
          ].map(c => (
            <div key={c.number} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
              <span className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                {c.number}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${c.color}15`, color: c.color }}>
                {c.result}
              </span>
            </div>
          ))}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Use any future expiry date, any 3-digit CVC, any ZIP.
          </p>
        </div>
      </Section>
    </div>
  )
}

// ── Appearance Tab ─────────────────────────────────────────────────────────
function AppearanceTab({ settings, setSettings, saveSettings, saving, theme, setTheme }) {
  const form = settings || DEFAULT_SETTINGS

  const updateField = (key, value) => {
    setSettings(prev => ({ ...(prev || DEFAULT_SETTINGS), [key]: value }))
  }

  const saveAppearance = async () => {
    await saveSettings()
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="Theme" desc={`Your current theme is ${theme === 'dark' ? 'Evora Dark' : 'Evora Light'}`}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'light', label: 'Évora Light', preview: ['#f4f6f4','#1a6b6b','#e8806a'] },
            { id: 'dark',  label: 'Évora Dark', preview: ['#101416','#66bcbc','#f18d78'] },
          ].map(t => (
            <div key={t.id}
              className="rounded-xl p-4 border-2 cursor-pointer transition-all"
              style={{
                borderColor: t.id === theme ? 'var(--teal)' : 'var(--border)',
              }}
              onClick={() => {
                setTheme(t.id)
                updateField('theme', t.id)
              }}>
              <div className="flex gap-1 mb-3">
                {t.preview.map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-md" style={{ background: c }} />
                ))}
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t.label}
              </p>
              {t.id === theme && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--teal)' }}>✓ Active</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Layout & Density">
        <Field label="Table Density">
          <div className="flex gap-2">
            {['compact','comfortable','spacious'].map(d => (
              <button key={d} onClick={() => updateField('density', d)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                style={form.density === d
                  ? { background: 'var(--teal)', color: '#fff' }
                  : { background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {d}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Animations">
          <div className="flex items-center gap-3">
            <Toggle value={form.animationsEnabled} onChange={value => updateField('animationsEnabled', value)} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {form.animationsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </Field>

        <Field label="Compact Sidebar">
          <div className="flex items-center gap-3">
            <Toggle value={form.compactSidebar} onChange={value => updateField('compactSidebar', value)} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {form.compactSidebar ? 'Icons only' : 'Show labels'}
            </span>
          </div>
        </Field>
      </Section>

      <Section title="Date & Time">
        <Field label="Date Format">
          <select className="input" value={form.dateFormat}
            onChange={e => updateField('dateFormat', e.target.value)}>
            <option>MMM DD, YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>MM/DD/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </Field>
      </Section>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={saveAppearance} disabled={saving}>
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}

// ── Main Settings Page ─────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, updateUser }  = useAuth()
  const { theme, setTheme } = useTheme()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [settings, setSettings] = useState(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await settingsAPI.get()
        const loaded = data.data
        setSettings(loaded)
        if (loaded?.theme) setTheme(loaded.theme)
      } catch {
        toast.error('Failed to load settings')
        setSettings(DEFAULT_SETTINGS)
      } finally {
        setSettingsLoading(false)
      }
    }

    const loadProfile = async () => {
      const fallbackProfile = {
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
      }

      try {
        const { data } = await userAPI.getMe()
        setProfile(data.data)
      } catch {
        setProfile(fallbackProfile)
      } finally {
        setProfileLoading(false)
      }
    }

    loadSettings()
    loadProfile()
  }, [])

  const saveProfile = async (payload) => {
    setProfileSaving(true)
    try {
      const { data } = await userAPI.updateMe(payload)
      setProfile(data.data)
      updateUser({ name: data.data.name, email: data.data.email })
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const changePassword = async (payload) => {
    setPasswordSaving(true)
    try {
      await userAPI.changeMyPassword(payload)
      toast.success('Password updated successfully')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update password')
    } finally {
      setPasswordSaving(false)
    }
  }

  const saveSettings = async () => {
    setSettingsSaving(true)
    try {
      const payload = settings || DEFAULT_SETTINGS
      const { data } = await settingsAPI.update(payload)
      setSettings(data.data)
      if (data.data?.theme) setTheme(data.data.theme)
      toast.success('Store settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSettingsSaving(false)
    }
  }

  const TAB_CONTENT = {
    profile:    profileLoading
                  ? <div className="card p-6 text-sm" style={{ color: 'var(--text-muted)' }}>Loading profile...</div>
                  : <ProfileTab
                      profile={profile || { name: user?.name || '', email: user?.email || '', phone: '' }}
                      onSave={saveProfile}
                      saving={profileSaving}
                    />,
    store:      <StoreTab
                  settings={settings || DEFAULT_SETTINGS}
                  setSettings={setSettings}
                  saveSettings={saveSettings}
                  saving={settingsSaving}
                />,
    security:   <SecurityTab onChangePassword={changePassword} changingPassword={passwordSaving} />,
    payment:    <PaymentTab
                  settings={settings || DEFAULT_SETTINGS}
                  setSettings={setSettings}
                  saveSettings={saveSettings}
                  saving={settingsSaving}
                />,
    appearance: <AppearanceTab
                  settings={settings || DEFAULT_SETTINGS}
                  setSettings={setSettings}
                  saveSettings={saveSettings}
                  saving={settingsSaving}
                  theme={theme}
                  setTheme={setTheme}
                />,
  }

  return (
    <div className="fade-in flex gap-6">

      {/* Left: tab list */}
      <div className="w-52 shrink-0">
        <div className="card p-2 flex flex-col gap-0.5 sticky top-24">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={tab === t.id
                ? { background: 'var(--teal)', color: '#fff' }
                : { color: 'var(--text-secondary)' }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = 'transparent' }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: content */}
      <div className="flex-1 min-w-0">
        {settingsLoading && tab === 'store'
          ? <div className="card p-6 text-sm" style={{ color: 'var(--text-muted)' }}>Loading settings...</div>
          : TAB_CONTENT[tab]}
      </div>
    </div>
  )
}