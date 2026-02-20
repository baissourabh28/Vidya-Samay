import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

export default function ConstraintsForm() {
  const [formData, setFormData] = useState({
    classes_per_day_min: 4,
    classes_per_day_max: 8,
    classes_per_week: 30,
    break_duration_minutes: 10,
    lunch_break_start: '13:00',
    lunch_break_end: '14:00',
    target_utilization_rate: 80
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { getToken } = useAuth()

  // Fetch existing constraints on mount
  useEffect(() => {
    fetchConstraints()
  }, [])

  // Fetch constraints from API
  const fetchConstraints = async () => {
    try {
      const token = getToken()
      // TODO: Replace with actual API endpoint
      // const response = await axios.get('http://localhost:8000/api/constraints', {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // setFormData(response.data)
    } catch (err) {
      console.error('Error fetching constraints:', err)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)

    try {
      const token = getToken()
      // TODO: Replace with actual API call
      // await axios.post('http://localhost:8000/api/constraints', formData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      
      console.log('Saving constraints:', formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Failed to save constraints')
      console.error('Error saving constraints:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <div className="form-section full-width">
        <h3>Scheduling Constraints</h3>
        <p className="form-description">
          Configure global constraints for timetable generation
        </p>
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="data-form">
          <div className="form-section-title">Class Distribution</div>
          <div className="form-row">
            <div className="form-group">
              <label>Minimum Classes per Day *</label>
              <input
                type="number"
                value={formData.classes_per_day_min}
                onChange={(e) => setFormData({ ...formData, classes_per_day_min: parseInt(e.target.value) })}
                min="1"
                max="10"
                required
              />
              <small>Minimum number of classes each batch should have per day</small>
            </div>

            <div className="form-group">
              <label>Maximum Classes per Day *</label>
              <input
                type="number"
                value={formData.classes_per_day_max}
                onChange={(e) => setFormData({ ...formData, classes_per_day_max: parseInt(e.target.value) })}
                min="1"
                max="10"
                required
              />
              <small>Maximum number of classes each batch can have per day</small>
            </div>

            <div className="form-group">
              <label>Total Classes per Week *</label>
              <input
                type="number"
                value={formData.classes_per_week}
                onChange={(e) => setFormData({ ...formData, classes_per_week: parseInt(e.target.value) })}
                min="1"
                max="50"
                required
              />
              <small>Total classes to schedule per batch per week</small>
            </div>
          </div>

          <div className="form-section-title">Break Times</div>
          <div className="form-row">
            <div className="form-group">
              <label>Break Duration (minutes) *</label>
              <input
                type="number"
                value={formData.break_duration_minutes}
                onChange={(e) => setFormData({ ...formData, break_duration_minutes: parseInt(e.target.value) })}
                min="0"
                max="30"
                required
              />
              <small>Duration of breaks between classes</small>
            </div>

            <div className="form-group">
              <label>Lunch Break Start *</label>
              <input
                type="time"
                value={formData.lunch_break_start}
                onChange={(e) => setFormData({ ...formData, lunch_break_start: e.target.value })}
                required
              />
              <small>Start time of lunch break</small>
            </div>

            <div className="form-group">
              <label>Lunch Break End *</label>
              <input
                type="time"
                value={formData.lunch_break_end}
                onChange={(e) => setFormData({ ...formData, lunch_break_end: e.target.value })}
                required
              />
              <small>End time of lunch break</small>
            </div>
          </div>

          <div className="form-section-title">Optimization Goals</div>
          <div className="form-row">
            <div className="form-group">
              <label>Target Utilization Rate (%) *</label>
              <input
                type="number"
                value={formData.target_utilization_rate}
                onChange={(e) => setFormData({ ...formData, target_utilization_rate: parseInt(e.target.value) })}
                min="50"
                max="100"
                required
              />
              <small>Target classroom utilization percentage (recommended: 80%)</small>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Constraints'}
            </button>
            {saved && <span className="success-message">✓ Constraints saved successfully!</span>}
          </div>
        </form>

        <div className="info-box">
          <h4>ℹ️ About Constraints</h4>
          <ul>
            <li>These constraints apply globally to all timetable generation</li>
            <li>The optimizer will try to satisfy all constraints while maximizing utilization</li>
            <li>If no solution is found, try relaxing some constraints</li>
            <li>Lunch break time will be blocked for all batches</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
