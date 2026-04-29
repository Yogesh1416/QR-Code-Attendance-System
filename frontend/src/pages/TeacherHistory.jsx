import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import './TeacherHistory.css'

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line long" />
      <div className="skeleton-line medium" />
      <div className="skeleton-line short" />
    </div>
  )
}

export default function TeacherHistory() {
  const [sessions, setSessions]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState(null)
  const [students, setStudents]   = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/attendance/teacher/sessions')
      .then(res => setSessions(res.data))
      .catch(err => console.error('Fetch sessions error:', err))
      .finally(() => setLoading(false))
  }, [])

  const isExpired = (expiresAt) => new Date() > new Date(expiresAt)

  const viewStudents = async (sessionId) => {
    if (expanded === sessionId) { setExpanded(null); return }
    setExpanded(sessionId)
    if (students[sessionId]) return
    try {
      const res = await API.get(`/attendance/teacher/session/${sessionId}/students`)
      setStudents(prev => ({ ...prev, [sessionId]: res.data }))
    } catch (err) {
      console.error('Fetch students error:', err)
    }
  }

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

  return (
    <div className="history-layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-brand-icon">📋</div>
          QR Attendance
        </div>
        <button className="btn-back" onClick={() => navigate('/admin')}>
          ← Dashboard
        </button>
      </nav>

      <div className="history-content">
        <div className="history-page-header">
          <p className="history-title">Session History</p>
          {!loading && (
            <span className="history-count-badge">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {loading ? (
          [1, 2, 3].map(i => <SkeletonCard key={i} />)
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No sessions yet.<br />Go back and generate your first QR code!</p>
          </div>
        ) : (
          sessions.map(session => {
            const expired = isExpired(session.expiresAt)
            const isOpen  = expanded === session._id
            return (
              <div className="session-card" key={session._id}>
                <div className="session-card-header">
                  <span className="session-subject">{session.subject}</span>
                  <span className={`session-badge ${expired ? 'badge-expired' : 'badge-active'}`}>
                    {expired ? 'Expired' : '● Active'}
                  </span>
                </div>

                <div className="session-meta-row">
                  <span className="session-meta">📅 Created: {formatDate(session.createdAt)}</span>
                  <span className="session-meta">⏱ Expires: {formatDate(session.expiresAt)}</span>
                </div>

                <div className="session-card-footer">
                  <span className="student-count">
                    👥 {session.studentCount} student{session.studentCount !== 1 ? 's' : ''} attended
                  </span>
                  <button className="btn-view-students" onClick={() => viewStudents(session._id)}>
                    {isOpen ? '▲ Hide' : '▼ View Students'}
                  </button>
                </div>

                {isOpen && (
                  <div className="students-list">
                    <div className="students-list-header">
                      <span className="students-list-title">Attendance List</span>
                    </div>
                    {!students[session._id] ? (
                      <SkeletonCard />
                    ) : students[session._id].length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '8px 0' }}>
                        No students have marked attendance yet.
                      </p>
                    ) : (
                      <>
                        <div className="student-table-head">
                          <span>#</span>
                          <span>Name</span>
                          <span>Email</span>
                        </div>
                        {students[session._id].map((record, index) => (
                          <div className="student-row" key={record._id}>
                            <span className="student-index">{index + 1}</span>
                            <span className="student-name">{record.student.name}</span>
                            <span className="student-email">{record.student.email}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
