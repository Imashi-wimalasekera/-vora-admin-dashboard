import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '../components/ui'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm]    = useState({ email: 'admin@shop.com', password: 'Admin@123' })
  const [err, setErr]      = useState('')
  const { login, loading } = useAuth()
  const navigate           = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      const msg = error?.response?.data?.message || 'Invalid email or password'
      setErr(msg)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Left: Form panel ── */}
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-sm fade-in">

          {/* Brand mark */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base"
                style={{ background: 'var(--teal)', color: '#fff', fontFamily: 'Playfair Display, serif' }}>
                É
              </div>
              <span className="font-bold text-xl"
                style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
                Évora
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2"
              style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
              Welcome Back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sign in to your Évora admin panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email" className="input" value={form.email} required
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label" style={{ marginBottom: 0 }}>Password</label>
                <span className="text-xs cursor-pointer" style={{ color: 'var(--salmon)' }}>
                  Forgot your password?
                </span>
              </div>
              <input
                type="password" className="input" value={form.password} required
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter your password"
              />
            </div>

            {err && (
              <div className="text-xs rounded-xl px-4 py-3"
                style={{
                  background: 'var(--salmon-light)',
                  color: 'var(--salmon-hover)',
                  border: '1px solid rgba(232,128,106,0.25)'
                }}>
                {err}
              </div>
            )}

            <button type="submit"
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 mt-1"
              disabled={loading}>
              {loading && <Spinner size={16} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            Admin access only · Évora Dashboard
          </p>
        </div>
      </div>

      {/* ── Right: Decorative teal panel ── */}
      <div className="hidden lg:flex w-2/5 flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--teal-deep) 0%, var(--teal-mid) 60%, var(--salmon) 100%)'
        }}>

        {/* Big watermark text — same as friend's design */}
        <div className="select-none text-center"
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '7rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.12)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
          ÉVORA
        </div>

        {/* Floating circles */}
        <div className="absolute" style={{
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
        }} />
        <div className="absolute" style={{
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
          top: '28%', right: '-60px'
        }} />
        <div className="absolute" style={{
          width: 150, height: 150, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          bottom: '15%', left: '-40px'
        }} />

        {/* Bottom caption */}
        <div className="absolute bottom-10 text-center px-10">
          <p className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>
            Admin Control Panel
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Manage your store with confidence
          </p>
        </div>
      </div>
    </div>
  )
}