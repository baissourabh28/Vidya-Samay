import { useState, useEffect } from 'react'
import { timetableAPI } from '../services/api'
import Layout from './Layout'

export default function TimetableViewer() {
  const [timetables, setTimetables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOption, setSelectedOption] = useState(0)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [filterDept, setFilterDept] = useState('all')
  const [filterBatch, setFilterBatch] = useState('all')

  useEffect(() => {
    fetchTimetables()
  }, [])

  const fetchTimetables = async () => {
    try {
      setLoading(true)
      const res = await timetableAPI.getAll()
      const timetablesData = res.data || []
      
      // Transform API data to component format
      const transformedTimetables = timetablesData.map(tt => {
        const entries = (tt.entries || []).map(entry => {
          const timeSlot = entry.time_slot || {}
          const dayMap = {
            'Monday': 0,
            'Tuesday': 1,
            'Wednesday': 2,
            'Thursday': 3,
            'Friday': 4
          }
          
          return {
            id: entry.id,
            day: dayMap[timeSlot.day] !== undefined ? dayMap[timeSlot.day] : 0,
            slot: timeSlot.slot_number !== undefined ? timeSlot.slot_number % 8 : 0,
            subject: entry.subject?.name || '',
            subjectCode: entry.subject?.code || '',
            faculty: entry.faculty?.name || '',
            classroom: entry.classroom?.name || '',
            batch: entry.batch?.name || '',
            department: entry.batch?.department || '',
            startTime: timeSlot.start_time || '',
            endTime: timeSlot.end_time || ''
          }
        })
        
        return {
          id: tt.id,
          name: tt.name,
          status: tt.status,
          utilization: Math.round((tt.utilization_rate || 0) * 100),
          conflicts: tt.conflict_count || 0,
          qualityScore: tt.quality_score || 0,
          entries: entries
        }
      })
      
      setTimetables(transformedTimetables)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load timetables')
      console.error('Error fetching timetables:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentTimetable = timetables[selectedOption]
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const slots = ['9-10', '10-11', '11-12', '12-1', '14-15', '15-16', '16-17', '17-18']

  const getEntriesForSlot = (day, slot) => {
    if (!currentTimetable) return []
    return currentTimetable.entries.filter(e => e.day === day && e.slot === slot)
  }

  const filteredEntries = currentTimetable?.entries.filter(entry => {
    if (filterDept !== 'all' && entry.department !== filterDept) return false
    if (filterBatch !== 'all' && entry.batch !== filterBatch) return false
    return true
  }) || []

  const handleApprove = async () => {
    if (!currentTimetable) return
    
    try {
      await timetableAPI.approve(currentTimetable.id, 'Approved from viewer')
      alert('Timetable approved successfully!')
      fetchTimetables()
    } catch (err) {
      alert('Failed to approve timetable: ' + (err.response?.data?.detail || err.message))
    }
  }

  return (
    <Layout>
      <div className="timetable-viewer">
        <div className="viewer-header">
          <div>
            <h2>Timetable Options</h2>
            <p className="subtitle">Review and compare generated timetables</p>
          </div>
          <div className="view-controls">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              📅 Grid View
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List View
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading timetables...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <h3>Error Loading Timetables</h3>
            <p>{error}</p>
            <button onClick={fetchTimetables} className="btn-primary">
              Retry
            </button>
          </div>
        ) : timetables.length === 0 ? (
          <div className="empty-state">
            <h3>No Timetables Generated</h3>
            <p>Generate timetables to view them here</p>
            <button onClick={() => window.location.href = '/generate'} className="btn-primary">
              Generate Now
            </button>
          </div>
        ) : (
          <>
            <div className="options-selector">
              {timetables.map((tt, idx) => (
                <div
                  key={tt.id}
                  className={`option-card ${selectedOption === idx ? 'selected' : ''}`}
                  onClick={() => setSelectedOption(idx)}
                >
                  <h4>{tt.name}</h4>
                  <div className="option-stats">
                    <span className="stat">
                      <strong>Utilization:</strong> {tt.utilization}%
                    </span>
                    <span className={`stat ${tt.conflicts > 0 ? 'warning' : 'success'}`}>
                      <strong>Conflicts:</strong> {tt.conflicts}
                    </span>
                    <span className="stat">
                      <strong>Status:</strong> <span className={`badge ${tt.status === 'active' ? 'success' : tt.status === 'draft' ? 'warning' : 'secondary'}`}>
                        {tt.status || 'draft'}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="filters">
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                <option value="all">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mechanical">Mechanical</option>
              </select>

              <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)}>
                <option value="all">All Batches</option>
                <option value="CS-A">CS-A</option>
                <option value="CS-B">CS-B</option>
              </select>
            </div>

            {viewMode === 'grid' ? (
              <div className="timetable-grid">
                <table className="timetable">
                  <thead>
                    <tr>
                      <th className="time-header">Time</th>
                      {days.map(day => (
                        <th key={day}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot, slotIdx) => (
                      <tr key={slot}>
                        <td className="time-cell">{slot}</td>
                        {days.map((day, dayIdx) => {
                          const entries = getEntriesForSlot(dayIdx, slotIdx)
                          return (
                            <td key={dayIdx} className="schedule-cell">
                              {entries.map((entry, idx) => (
                                <div key={idx} className="class-entry">
                                  <div className="entry-subject">{entry.subject}</div>
                                  <div className="entry-details">
                                    <span>👨‍🏫 {entry.faculty}</span>
                                    <span>🏫 {entry.classroom}</span>
                                    <span>👥 {entry.batch}</span>
                                  </div>
                                </div>
                              ))}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="timetable-list">
                <table className="list-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Subject</th>
                      <th>Faculty</th>
                      <th>Classroom</th>
                      <th>Batch</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry, idx) => (
                      <tr key={idx}>
                        <td>{days[entry.day]}</td>
                        <td>{slots[entry.slot]}</td>
                        <td><strong>{entry.subject}</strong></td>
                        <td>{entry.faculty}</td>
                        <td>{entry.classroom}</td>
                        <td><span className="badge">{entry.batch}</span></td>
                        <td>{entry.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="timetable-actions">
              {currentTimetable?.status === 'draft' && (
                <button 
                  className="btn-primary" 
                  onClick={handleApprove}
                  disabled={loading}
                >
                  ✓ Approve This Timetable
                </button>
              )}
              {currentTimetable?.status === 'active' && (
                <span className="badge success">Currently Active</span>
              )}
              <button className="btn-secondary">Export to PDF</button>
              <button className="btn-secondary">Export to Excel</button>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
