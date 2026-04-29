import { useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'
import Toast from './Toast'
import Spinner from './Spinner'
import './Register.css'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setToast({ message: 'Please fill in all fields.', type: 'warning' })
      return
    }
    setLoading(true)
    try {
      await API.post('/auth/register', form)
      setToast({ message: 'Account created! Redirecting to login…', type: 'success' })
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setToast({ message: err.response?.data?.msg || 'Registration failed. Please try again.', type: 'error' })
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
        <div className="register-container">
          <div className="auth-logo-mobile">
            <span>📋</span> QR Attendance
          </div>
          <h2>Create account</h2>
          <p className="subtitle">Sign up to get started today</p>

          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="e.g. Yogesh Kumar"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onKeyDown={handleKey}
              />
            </div>
          </div>

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
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey}
              />
            </div>
          </div>

          <div className="form-group">
            <label>I am a…</label>
            <div className="role-pills">
              <button
                type="button"
                className={`role-pill ${form.role === 'student' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'student' })}
              >
                🎓 Student
              </button>
              <button
                type="button"
                className={`role-pill ${form.role === 'admin' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'admin' })}
              >
                🏫 Teacher
              </button>
            </div>
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <><Spinner size={16} /> Creating account…</> : 'Create Account'}
          </button>

          <p className="login-link">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}
