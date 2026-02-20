import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from './Layout'

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeTimetable: null,
    pendingApprovals: 0,
    totalClassrooms: 0,
    totalFaculty: 0,
    totalBatches: 0,
    totalSubjects: 0,
    utilizationRate: 0
  })
  const [currentDateTime, setCurrentDateTime] = useState({
    date: '',
    time: '',
    year: 2026
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
    fetchDateTime()
    // Update time every minute
    const timeInterval = setInterval(fetchDateTime, 60000)
    return () => clearInterval(timeInterval)
  }, [])

  const fetchDateTime = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/datetime`)
      const data = await res.json()
      const now = new Date(data.iso)
      setCurrentDateTime({
        date: now.toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        }),
        time: now.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),
        year: data.year
      })
    } catch (error) {
      // Fallback to client time
      const now = new Date()
      setCurrentDateTime({
        date: now.toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        }),
        time: now.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),
        year: now.getFullYear()
      })
    }
  }

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardAPI.getStats()
      const data = res.data || {}
      
      setStats({
        activeTimetable: data.activeTimetable || null,
        pendingApprovals: data.pendingApprovals || 0,
        totalClassrooms: data.totalClassrooms || 0,
        totalFaculty: data.totalFaculty || 0,
        totalBatches: data.totalBatches || 0,
        totalSubjects: data.totalSubjects || 0,
        utilizationRate: Math.round((data.utilizationRate || 0) * 100)
      })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading dashboard...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h2>Dashboard Overview</h2>
            <p className="subtitle">Welcome to Vidya Samay - Smart Timetable Scheduler</p>
          </div>
          <div className="datetime-display">
            <div className="date-display">{currentDateTime.date || 'Loading...'}</div>
            <div className="time-display">{currentDateTime.time || 'Loading...'}</div>
            <div className="year-badge">Year: {currentDateTime.year}</div>
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Active Timetable</h3>
              <p className="stat-value">{stats.activeTimetable || 'None'}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending Approvals</h3>
              <p className="stat-value">{stats.pendingApprovals}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏫</div>
            <div className="stat-content">
              <h3>Classrooms</h3>
              <p className="stat-value">{stats.totalClassrooms}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-content">
              <h3>Faculty</h3>
              <p className="stat-value">{stats.totalFaculty}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Batches</h3>
              <p className="stat-value">{stats.totalBatches}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Utilization Rate</h3>
              <p className="stat-value">{stats.utilizationRate}%</p>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button onClick={() => navigate('/data')} className="action-btn primary">
              Manage Data
            </button>
            <button onClick={() => navigate('/generate')} className="action-btn success">
              Generate Timetable
            </button>
            <button onClick={() => navigate('/timetables')} className="action-btn info">
              View Timetables
            </button>
            <button onClick={() => navigate('/approvals')} className="action-btn warning">
              Review Approvals
            </button>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">📅</span>
              <div className="activity-content">
                <span className="activity-desc">System ready for timetable generation</span>
                <span className="activity-time">Current Year: {currentDateTime.year}</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">ℹ️</span>
              <div className="activity-content">
                <span className="activity-desc">All timetables are generated with current date/time</span>
                <span className="activity-time">Real-time updates enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
