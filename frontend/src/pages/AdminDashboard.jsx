import { useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import Toast from './Toast'
import Spinner from './Spinner'
import Chatbot from './Chatbot'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [subject, setSubject] = useState('')
  const [qrData, setQrData] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const createSession = async () => {
    if (!subject.trim()) {
      setToast({ message: 'Please enter a subject name.', type: 'warning' })
      return
    }
    setLoading(true)
    try {
      const res = await API.post('/sessions/create', { subject })
      setQrData(res.data.qrData)
      setToast({ message: `Session "${subject}" created successfully!`, type: 'success' })
    } catch (err) {
      setToast({ message: 'Could not create session. Make sure you are logged in as a teacher.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(qrData)
    setToast({ message: 'Link copied to clipboard!', type: 'success' })
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="dashboard-layout">
        <nav className="navbar">
          <div className="navbar-brand">
            <div className="navbar-brand-icon">📋</div>
            QR Attendance
          </div>
          <div className="navbar-actions">
            <span className="navbar-role-badge">Teacher</span>
            <button className="btn-back" onClick={() => navigate('/teacher-history')}>
              📊 History
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </nav>

        <div className="dashboard-content">
          <div className="dashboard-page-header">
            <p className="dashboard-title">Teacher Dashboard</p>
            <p className="admin-subtitle">
              Enter a subject name and generate a QR code for your students to scan.
            </p>
          </div>

          <div className="session-form-card">
            <h3>🎯 New Session</h3>
            <div className="session-form">
              <input
                type="text"
                placeholder="e.g. Physics — Period 3"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createSession()}
              />
              <button onClick={createSession} className="btn-generate" disabled={loading}>
                {loading ? <><Spinner size={15} /> Generating…</> : '⚡ Generate QR'}
              </button>
            </div>
          </div>

          {qrData && (
            <div className="qr-card">
              <div className="qr-card-header">
                <div className="success-msg">✅ QR Code is live</div>
                <p className="qr-subject-label">{subject}</p>
              </div>

              <div className="qr-wrapper">
                <QRCode value={qrData} size={220} />
              </div>

              <div className="qr-actions">
                <button className="btn-qr-action" onClick={copyLink}>
                  📋 Copy Link
                </button>
              </div>

              <p className="qr-url">{qrData}</p>
              <p className="qr-expiry">⏱ Expires in 10 minutes</p>
            </div>
          )}
        </div>
      </div>
      <Chatbot />
    </>
  )
}
