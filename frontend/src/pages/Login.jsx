import { useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Toast from './Toast'
import Spinner from './Spinner'
import './Login.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setToast({ message: 'Please fill in all fields.', type: 'warning' })
      return
    }
    setLoading(true)
    try {
      const res = await API.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      const decoded = jwtDecode(res.data.token)
      if (decoded.role === 'admin') navigate('/admin')
      else navigate('/student')
    } catch (err) {
      setToast({ message: err.response?.data?.msg || 'Login failed. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="auth-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="auth-brand">
        <div className="auth-brand-icon">📋</div>
        <h1>QR Attendance</h1>
        <p>Smart, fast, and paperless attendance tracking for modern classrooms.</p>
        <div className="auth-brand-features">
          <div className="auth-brand-feature">
            <span className="auth-brand-feature-dot" />
            Instant QR code generation
          </div>
          <div className="auth-brand-feature">
            <span className="auth-brand-feature-dot" />
            Real-time attendance tracking
          </div>
          <div className="auth-brand-feature">
            <span className="auth-brand-feature-dot" />
            Detailed session history
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="login-container">
          <div className="auth-logo-mobile">
            <span>📋</span> QR Attendance
          </div>
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to your account to continue</p>

          <div className="form-group">
            <label>Email address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKey}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey}
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <><Spinner size={16} /> Signing in…</> : 'Sign In'}
          </button>

          <p className="register-link">
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </div>
      </div>
    </div>
  )
}
