import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import './StudentHistory.css'

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line long" />
      <div className="skeleton-line short" />
    </div>
  )
}

export default function StudentHistory() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/attendance/student/history')
      .then(res => setRecords(res.data))
      .catch(err => console.error('Fetch history error:', err))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

  // derive unique subjects for stats
  const uniqueSubjects = new Set(records.map(r => r.session?.subject)).size

  return (
    <div className="history-layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-brand-icon">📋</div>
          QR Attendance
        </div>
        <button className="btn-back" onClick={() => navigate('/student')}>
          ← Back
        </button>
      </nav>

      <div className="history-content">
        <div className="history-page-header">
          <p className="history-title">My Attendance</p>
        </div>

        {!loading && records.length > 0 && (
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-value">{records.length}</div>
              <div className="stat-label">Classes Attended</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{uniqueSubjects}</div>
              <div className="stat-label">Subjects</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">✓</div>
              <div className="stat-label">All Present</div>
            </div>
          </div>
        )}

        {loading ? (
          [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No attendance records yet.<br />Scan a QR code to mark your first class!</p>
          </div>
        ) : (
          records.map(record => (
            <div className="attendance-card" key={record._id}>
              <div className="attendance-card-left">
                <div className="attendance-card-icon">📚</div>
                <div>
                  <p className="attendance-subject">
                    {record.session?.subject || 'Unknown Subject'}
                  </p>
                  <p className="attendance-date">{formatDate(record.markedAt)}</p>
                </div>
              </div>
              <span className="attendance-status">✓ Present</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
