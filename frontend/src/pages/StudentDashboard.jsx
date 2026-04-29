import { useState, useRef, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import API from '../api'
import { useNavigate, useParams } from 'react-router-dom'
import Chatbot from './Chatbot'
import './StudentDashboard.css'

export default function StudentDashboard() {
  const scanned = useRef(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const { token } = useParams()
  const navigate = useNavigate()

  const markAttendance = async (qrToken) => {
    try {
      const res = await API.post('/attendance/mark', { qrToken })
      setResult(res.data.msg)
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong')
    }
  }

  useEffect(() => {
    if (token) { markAttendance(token); return }
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false)
    scanner.render(async (decodedText) => {
      if (scanned.current) return
      scanned.current = true
      scanner.clear()
      const qrToken = decodedText.split('/scan/')[1]
      await markAttendance(qrToken)
    }, () => {})
    return () => scanner.clear().catch(() => {})
  }, [token])

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <>
      <div className="dashboard-layout">
        <nav className="navbar">
          <div className="navbar-brand">
            <div className="navbar-brand-icon">📋</div>
            QR Attendance
          </div>
          <div className="navbar-actions">
            <span className="navbar-role-badge">Student</span>
            <button className="btn-back" onClick={() => navigate('/student-history')}>
              📊 My Attendance
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </nav>

        <div className="dashboard-content">
          <p className="dashboard-title">Mark Attendance</p>

          {result && (
            <div className="status-card success">
              <span className="status-icon">✅</span>
              <p className="status-title">Attendance Marked!</p>
              <p className="status-msg">{result}</p>
            </div>
          )}

          {error && (
            <div className="status-card error">
              <span className="status-icon">⚠️</span>
              <p className="status-title">Could Not Mark Attendance</p>
              <p className="status-msg">{error}</p>
            </div>
          )}

          {!result && !token && (
            <>
              <p className="student-subtitle">
                Point your camera at the QR code displayed by your teacher to mark your attendance.
              </p>
              <div className="scanner-wrapper">
                <div className="scanner-label">
                  <span className="scanner-label-dot" />
                  Camera active — scanning for QR code
                </div>
                <div id="qr-reader" />
              </div>
            </>
          )}
        </div>
      </div>
      <Chatbot />
    </>
  )
}
